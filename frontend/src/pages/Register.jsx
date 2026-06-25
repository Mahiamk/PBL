import React, { useState } from 'react';
import { register } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  // 3NF Normalized: Split full_name into first_name, last_name, initial
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    initial: '',  // Optional middle initial
    phone_number: '',  // User phone number
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        initial: formData.initial || null,  // Send null if empty
        phone_number: formData.phone_number || null,  // Send null if empty
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      // Redirect to login on success
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create an account</h2>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Middle Initial (Optional)</label>
            <input
              name="initial"
              type="text"
              maxLength={10}
              value={formData.initial}
              onChange={handleChange}
              placeholder="e.g., M. or M"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
            <input
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="e.g., +81-90-1234-5678"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-primary rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Register
          </button>
        </form>
        <div className="text-sm text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;