import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function PlaceOrder() {
  const navigate = useNavigate();
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  // 1. Gather all the data we saved in previous steps
  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};
  const paymentMethod = JSON.parse(localStorage.getItem('paymentMethod'));
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // 2. Safety Checks & Fetch Cart
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/checkout');
    } else if (!paymentMethod) {
      navigate('/payment');
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        const data = await response.json();
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

    fetchCart();
  }, [navigate, paymentMethod, shippingAddress.address, userInfo?.token]);

  // 3. The Action: Sending the final payload to the backend
  const placeOrderHandler = async () => {
    setPlacingOrder(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          orderItems: cart.items,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod,
          itemsPrice: cart.totalPrice,
          totalPrice: cart.totalPrice, // You can add tax/shipping math here later!
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to create order');

      // Success! Usually, we redirect to an Order Summary page using the new Order ID
      navigate(`/order-success/${data.order._id}`); 
      
    } catch (err) {
      setError(err.message);
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="text-center mt-12 text-gray-500">Loading order summary...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-12">
      
      {/* Progress Bar */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-lg flex justify-between text-sm font-medium">
          <span className="text-gray-400">1. Shipping</span>
          <span className="text-gray-400">2. Payment</span>
          <span className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">3. Place Order</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Your Order</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Summary Details */}
        <div className="grow space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping</h2>
            <p className="text-gray-600">
              <strong>Address:</strong> {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
            <p className="text-gray-600">
              <strong>Method:</strong> {paymentMethod}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
            {cart?.items?.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {cart?.items.map((item, index) => (
                  <li key={index} className="py-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800">{item.product.name || 'Product'}</span>
                    </div>
                    <div className="text-gray-600 font-medium">
                      {item.quantity} x NGN {item.price.toLocaleString()} = <span className="text-green-600 font-bold">NGN {(item.quantity * item.price).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Right Side: Action Box */}
        <div className="w-full lg:w-96">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Items:</span>
              <span>NGN {cart?.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            
            <hr className="border-gray-200 my-4" />
            
            <div className="flex justify-between mb-8 text-xl font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-green-600">NGN {cart?.totalPrice.toLocaleString()}</span>
            </div>

            {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}

            <button 
              onClick={placeOrderHandler}
              disabled={placingOrder || cart?.items?.length === 0}
              className={`w-full font-bold py-4 px-4 rounded-lg shadow-md transition duration-200 ${
                cart?.items?.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {placingOrder ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PlaceOrder;