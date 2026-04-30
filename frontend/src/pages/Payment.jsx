import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Payment() {
  const navigate = useNavigate();

  // If they skipped the Shipping page, send them back
  useEffect(() => {
    const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
    if (!shippingAddress) {
      navigate('/checkout');
    }
  }, [navigate]);

  const savedPaymentMethod = JSON.parse(localStorage.getItem('paymentMethod')) || 'Paystack';
  const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod);

  const submitHandler = (e) => {
    e.preventDefault();
    localStorage.setItem('paymentMethod', JSON.stringify(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div className="flex justify-center items-center mt-12 mb-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md border border-gray-100">

        {/* Progress Bar */}
        <div className="flex justify-between mb-8 text-sm font-medium">
          <span className="text-gray-400">1. Shipping</span>
          <span className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">2. Payment</span>
          <span className="text-gray-400">3. Place Order</span>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">Payment Method</h2>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="space-y-4">

            {/* Option 1: Paystack */}
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                className="h-5 w-5 text-blue-600"
                name="paymentMethod"
                value="Paystack"
                checked={paymentMethod === 'Paystack'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="ml-3 font-medium text-gray-800">Debit/Credit Card (Paystack)</span>
            </label>

            {/* Option 2: Pay on Delivery */}
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                className="h-5 w-5 text-blue-600"
                name="paymentMethod"
                value="Pay on Delivery"
                checked={paymentMethod === 'Pay on Delivery'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="ml-3 font-medium text-gray-800">Pay on Delivery</span>
            </label>

          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-6"
          >
            Continue to Review
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;