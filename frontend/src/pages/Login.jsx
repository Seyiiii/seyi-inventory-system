import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  // 1. The Memory (State) for our form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // useNavigate allows us to programmatically redirect the user after they log in
  const navigate = useNavigate();
  const { login } = useAuth();

  // 2. The Action (Submitting the form to your backend)
  const submitHandler = async (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // SUCCESS! Save the user data and JWT token to the browser's local storage
      login(data);      
      // Redirect them back to the Home page
      navigate('/');
      
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

  // 3. The UI (Modern Tailwind Form)
  return (
    <div className="flex justify-center items-center mt-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
        
        {/* If there is an error from the backend, display it here in a red box */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex justify-center items-center h-12"
          >
            {loading ? (
                <svg className='animate-spin h-6 w-6 text-white' xmlns="http://www.w3.org/2000/svg" fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx="12" cy="12" r="10" stroke='currentColor' strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            New Customer?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;