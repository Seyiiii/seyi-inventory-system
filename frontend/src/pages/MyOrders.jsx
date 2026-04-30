import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null); // 👈 tracks which order is expanded
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOrders(data.orders);
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

    fetchOrders();
  }, [userInfo, navigate]);

  // Toggle expand — clicking same order collapses it
  const toggleExpand = (orderId) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-xl font-bold text-gray-700 mb-2">No orders yet</p>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expandedOrder === order._id;

            return (
              <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* Order Header Row */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Order Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-blue-600">{order.orderNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.isDelivered
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.isDelivered ? '✅ Delivered' : '🚚 Processing'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''} · {order.paymentMethod}
                      </p>
                    </div>

                    {/* Right: Price + Toggle Button */}
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-green-600">
                        NGN {order.totalPrice?.toLocaleString()}
                      </span>
                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition text-sm"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Details Panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6">
                    
                    {/* Products Table */}
                    <h3 className="font-bold text-gray-800 mb-4">Order Items</h3>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Product</th>
                            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Qty</th>
                            <th className="text-right px-4 py-3 text-gray-600 font-semibold">Unit Price</th>
                            <th className="text-right px-4 py-3 text-gray-600 font-semibold">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {order.orderItems.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-600">NGN {item.price?.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">
                                NGN {(item.price * item.quantity)?.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-800">Total</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600 text-base">
                              NGN {order.totalPrice?.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Shipping + Payment Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">Shipping Address</h4>
                        <p className="text-gray-600 text-sm">{order.shippingAddress?.address}</p>
                        <p className="text-gray-600 text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                        <p className="text-gray-600 text-sm">{order.shippingAddress?.country}</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">Payment</h4>
                        <p className="text-gray-600 text-sm">Method: <span className="font-medium">{order.paymentMethod}</span></p>
                        <p className="text-gray-600 text-sm mt-1">
                          Status: <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                            {order.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;