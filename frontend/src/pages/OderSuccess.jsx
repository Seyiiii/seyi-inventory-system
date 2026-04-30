import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` }
        });
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="flex justify-center items-center mt-12 mb-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">Thank you for your purchase. Your order has been received.</p>

        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Order Number</span>
              <span className="font-bold text-blue-600">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Payment Method</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Total</span>
              <span className="font-bold text-green-600">NGN {order.totalPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Delivery Status</span>
              <span className={`font-medium ${order.isDelivered ? 'text-green-600' : 'text-orange-500'}`}>
                {order.isDelivered ? 'Delivered' : 'Processing'}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/my-orders" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
            View My Orders
          </Link>
          <Link to="/" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;