import React from 'react';
import { Link } from 'react-router-dom';

const SelectUserType = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Select User Type</h2>
        <div className="space-y-4">
          <Link
            to="/register?role=customer"
            className="block w-full text-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Register as Customer
          </Link>
          <Link
            to="/register/vendor"
            className="block w-full text-center px-4 py-2 bg-blue-900 text-white rounded hover:bg-gray-700 transition"
          >
            Register as Vendor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SelectUserType;