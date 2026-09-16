import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState(null);

  // New States for Feature 4
  const [qty, setQty] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { refreshCartCount } = useAuth();

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const data = await apiRequest(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        setProduct(data.product);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSingleProduct();
  }, [id]);

  const addToCartHandler = async () => {
    setAddingToCart(true);
    setError(null);
    setShowSuccess(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
      navigate('/login');
      return;
    }

    try {
      await apiRequest(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, quantity: Number(qty) }), // Send the selected quantity
      });

      // Show success message instead of redirecting
      setShowSuccess(true);
      refreshCartCount();

      // Auto-hide the success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <p className="text-center mt-12 text-gray-600">Loading product details...</p>;
  if (!product) return <p className="text-center mt-12 text-gray-600">Product not found!</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block transition">&larr; Back to Inventory</Link>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* The Success Message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex justify-between items-center animate-fade-in-down">
          <span>Successfully added to your cart!</span>
          <Link to="/cart" className="underline font-bold">View Cart</Link>
        </div>
      )}

     <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm flex flex-col lg:flex-row gap-8">
  {/* Left: Product Image */}
  <div className="w-full lg:w-80 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden border border-gray-100 min-h-[280px]">
    {product.image ? (
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-72 object-contain p-4"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    ) : (
      <div className="flex flex-col items-center justify-center text-gray-400 p-8">
        <span className="text-6xl mb-2">📦</span>
        <span className="text-xs font-medium">No Image Uploaded</span>
      </div>
    )}
  </div>

  {/* Middle: Product Info */}
  <div className="flex-1">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
    <div className="flex items-center gap-3 mb-4">
      <span className="text-gray-500 text-sm">SKU: {product.sku}</span>
      {product.category_id && (
        <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
          {typeof product.category_id === 'object' ? product.category_id.name : product.category_id}
        </span>
      )}
    </div>
    <h2 className="text-3xl font-bold text-green-600 mb-6">NGN {product.price.toLocaleString()}</h2>
    <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>
  </div>

        <div className="w-full md:w-72">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="font-semibold text-gray-800 mb-4 border-b pb-4">
              Status: <span className={product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}>
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </p>

            {/* The Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600 font-medium">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  {/* Minus button */}
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg transition"
                  >
                    −
                  </button>

                  {/* Number input — user can also type directly */}
                  <input
                    type="number"
                    value={qty}
                    min={1}
                    max={product.stock_quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 1 && val <= product.stock_quantity) setQty(val);
                    }}
                    className="w-12 h-9 text-center border-x border-gray-300 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {/* Plus button */}
                  <button
                    onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                    className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={addToCartHandler}
              disabled={addingToCart || product.stock_quantity === 0}
              className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 ${product.stock_quantity === 0 ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;