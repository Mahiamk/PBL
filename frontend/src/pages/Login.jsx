import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      
      // Check if there's a return url
      const from = location.state?.from;
      if (from) {
        navigate(from);
        return;
      }

      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'vendor') {
        // Normalize vendor_type to handle case sensitivity
        const type = data.vendor_type ? data.vendor_type.toLowerCase() : '';
        
        if (type === 'barbershop') {
            navigate('/vendor/barber');
        } else if (type === 'bottleshop') {
            navigate('/vendor/bottleshop');
        } else if (type === 'clothesshop' || type === 'clothingshop' || type === 'fashion') {
            navigate('/vendor/clothesshop');
        } else if (type === 'computershop') {
            navigate('/vendor/tech');
        } else if (type === 'drinkshop') {
            navigate('/vendor/drinkshop');
        } else if (type === 'massage') {
            navigate('/vendor/massage');
        } else if (type === 'tailor') {
            navigate('/vendor/tailor');
        } else {
            // Default fallback if type is missing or unknown
            navigate('/vendor'); 
        }
      }
      else navigate('/customer');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Sign in to your account</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-primary rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Sign In
          </button>
        </form>
        <div className="text-sm text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/select-user-type" className="font-medium text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
