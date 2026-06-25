import React, { useState } from 'react';
import { registerVendor } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';

const VendorRegister = () => {
  // 3NF Normalized: Split full_name into first_name, last_name, initial
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    initial: '',  // Optional middle initial
    phone_number: '',  // User phone number
    email: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    contact_details: '',
    vendor_type: ''
  });
  const [bannerImage, setBannerImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!formData.vendor_type) {
      setError("Please select a vendor type");
      return;
    }
    
    try {
      const data = new FormData();
      // 3NF Normalized: Send separate name fields
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      if (formData.initial) {
        data.append('initial', formData.initial);
      }
      if (formData.phone_number) {
        data.append('phone_number', formData.phone_number);
      }
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('business_name', formData.business_name);
      data.append('contact_details', formData.contact_details);
      data.append('vendor_type', formData.vendor_type);
      if (bannerImage) {
        data.append('banner_image', bannerImage);
      }

      await registerVendor(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your vendor application has been received. An administrator will review your details shortly.
            You will be able to log in once your account is approved.
          </p>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Become a Vendor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our marketplace and start selling today
          </p>
        </div>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* 3NF Normalized: Separate name fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  name="first_name"
                  type="text"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  name="last_name"
                  type="text"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial (Optional)</label>
              <input
                name="initial"
                type="text"
                maxLength={10}
                placeholder="e.g., M. or M"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.initial}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
              <input
                name="phone_number"
                type="tel"
                placeholder="e.g., +81-90-1234-5678"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                name="business_name"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.business_name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Type</label>
              <select
                name="vendor_type"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.vendor_type}
                onChange={handleChange}
              >
                <option value="">Select a type</option>
                <option value="BarberShop">Barber Shop</option>
                <option value="BottleShop">Bottle Shop</option>
                <option value="ClothingShop">Clothing Shop</option>
                <option value="ComputerShop">Computer Shop</option>
                <option value="DrinkShop">Drink Shop</option>
                <option value="Massage">Massage</option>
                <option value="Tailor">Tailor</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Banner (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload a banner image for your shop. If skipped, a default image will be used.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
              <textarea
                name="contact_details"
                rows="3"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.contact_details}
                onChange={handleChange}
                placeholder="Phone number, address, etc."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Submit Application
            </button>
          </div>
          <div className="text-center text-sm">
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegister;