import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null); // tracks which item is being updated
  const navigate = useNavigate();
  const { userInfo, refreshCartCount } = useAuth();

  const fetchMyCart = async () => {
    if (!userInfo?.token) { navigate('/login'); return; }
    try {
      const response = await fetch('https://seyi-inventory.onrender.com/api/cart', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load cart');
      setCart(data.cart);
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Network error — please check your connection.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyCart(); }, []);

  // Remove item completely
  const handleRemove = async (productId) => {
    setUpdatingItem(productId);
    try {
      const response = await fetch(`https://seyi-inventory.onrender.com/api/cart/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setCart(data.cart);
      refreshCartCount(); // update navbar badge
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingItem(null);
    }
  };

  // Update quantity
  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    setUpdatingItem(productId);
    try {
      const response = await fetch(`https://seyi-inventory.onrender.com/api/cart/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ quantity: newQty })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setCart(data.cart);
      refreshCartCount();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingItem(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Cart Items */}
        <div className="grow bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {cart.items.map((item) => {
              const isUpdating = updatingItem === item.product._id;
              return (
                <li key={item._id} className={`p-6 transition ${isUpdating ? 'opacity-50' : ''}`}>
                  <div className="flex gap-4">

                    {/* Product Image */}
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-100 shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">📦</div>
                    )}

                    {/* Info + Controls */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          NGN {item.price.toLocaleString()} each
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Quantity +/- */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold disabled:opacity-40 transition"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-bold text-gray-800 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            disabled={isUpdating}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold disabled:opacity-40 transition"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="text-base font-bold text-green-600 w-28 text-right">
                          NGN {(item.price * item.quantity).toLocaleString()}
                        </span>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item.product._id)}
                          disabled={isUpdating}
                          className="text-gray-300 hover:text-red-500 transition disabled:opacity-40"
                          title="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Items ({cart.items.reduce((acc, item) => acc + item.quantity, 0)}):</span>
              <span>NGN {cart.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <hr className="border-gray-200 mb-6" />
            <div className="flex justify-between mb-8 text-xl font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-green-600">NGN {cart.totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-md transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Cart;