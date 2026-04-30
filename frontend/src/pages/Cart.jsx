import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCart = async () => {
      // 1. Get the user's secure token
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!userInfo || !userInfo.token) {
        navigate('/login');
        return;
      }

      try {
        // 2. Fetch their specific cart from the database
        const response = await fetch('https://seyi-inventory.onrender.com/api/cart', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load cart');
        }

        // 3. Save the cart to React's memory
        setCart(data.cart);
        
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Network error - please check your internet connection and try again.');
        } else {
          setError(err.message)
        }
    } finally {
      setLoading(false);
    }
  };

    fetchMyCart();
  }, [navigate]);

  // Loading & Error States
  if (loading) return <p className="text-center mt-12 text-gray-600">Loading your cart...</p>;
  if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;

  // Empty Cart State
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any tech to your cart yet.</p>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  // Populated Cart UI
  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Cart Items */}
        <div className="grow bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <li key={item._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition">
                <div className="flex flex-col mb-4 sm:mb-0">
                  {/* Depending on if your backend populates the product name, it might be item.product.name or just item.product */}
                  <h3 className="text-lg font-bold text-gray-800">
                    {item.product.name || "Product Name (Refresh needed)"}
                  </h3>
                  <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    NGN {item.price.toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Items ({cart.items.reduce((acc, item) => acc + item.quantity, 0)}):</span>
              <span>NGN {cart.totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between mb-6 text-gray-600">
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </div>
            
            <hr className="border-gray-200 mb-6" />
            
            <div className="flex justify-between mb-8 text-xl font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-green-600">NGN {cart.totalPrice.toLocaleString()}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg shadow-md transition duration-200"
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