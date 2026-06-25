import React, { useState, useEffect } from 'react';
import { createCategory, fetchCategories, deleteCategory } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const CategoryManager = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories(user?.storeId);
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await createCategory({ 
        category_name: name, 
        category_type: type,
        store_id: user?.storeId 
      });
      setMessage('Category created successfully!');
      setName('');
      setType('');
      loadCategories();
    } catch (error) {
      setError('Error creating category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    setMessage('');
    setError('');
    try {
      await deleteCategory(id);
      setMessage('Category deleted successfully');
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white shadow rounded">
        <h3 className="text-lg font-bold mb-4">Create Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Category Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Category Type</label>
              <input 
                type="text" 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="e.g. Tech, Fashion"
              />
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Category
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Existing Categories</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.category_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.category_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.category_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.category_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDelete(cat.category_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManager;
