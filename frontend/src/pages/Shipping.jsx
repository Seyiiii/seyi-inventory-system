import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Shipping() {
  // Check if we already have a shipping address saved in the browser
  const savedAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};

  // Form State
  const [address, setAddress] = useState(savedAddress.address || '');
  const [city, setCity] = useState(savedAddress.city || '');
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || '');
  // Default to Nigeria as discussed in your backend architecture!
  const [country, setCountry] = useState(savedAddress.country || 'Nigeria');

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Save the address to local storage so the final Place Order screen can grab it
    localStorage.setItem('shippingAddress', JSON.stringify({ address, city, postalCode, country }));
    
    // Move to the next step
    navigate('/payment');
  };

  return (
    <div className="flex justify-center items-center mt-12 mb-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md border border-gray-100">
        
        {/* Progress Bar (Visual indicator for the user) */}
        <div className="flex justify-between mb-8 text-sm font-medium text-gray-400">
          <span className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">1. Shipping</span>
          <span>2. Payment</span>
          <span>3. Place Order</span>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">Shipping Address</h2>
        
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Street Address</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="123 Tech Avenue"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
            <input 
              type="text" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Lagos"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Postal Code</label>
              <input 
                type="text" 
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="100001"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
              <input 
                type="text" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-4"
          >
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
}

export default Shipping;