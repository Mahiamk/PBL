import React, { useState, useEffect } from 'react';
import { createCategory, fetchCategories, deleteCategory } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { 
  Folders, 
  Plus, 
  Trash, 
  CheckCircle, 
  WarningCircle,
  Tag
} from '@phosphor-icons/react';

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
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories", error);
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
      setTimeout(() => setMessage(''), 3000);
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
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
        <span className="text-[10px] font-bold text-[#8e6e7d] uppercase tracking-widest block mb-1">
          Taxonomy & Structure
        </span>
        <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">Category Management</h2>
        <p className="text-xs text-[#6e6e73]">
          Organize your store products and services into structured campus collections.
        </p>
      </div>

      {/* Creation Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
        <h3 className="text-sm font-bold text-[#1d1d1f] mb-4">Create New Category</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">Category Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#e8e8ed] rounded-2xl text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:border-[#8e6e7d] transition-all"
                placeholder="e.g. Laptops & MacBooks, Hoodies..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">Category Type</label>
              <input 
                type="text" 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#e8e8ed] rounded-2xl text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:border-[#8e6e7d] transition-all"
                placeholder="e.g. Hardware, Apparel, Beverage"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button 
              type="submit" 
              className="inline-flex items-center space-x-2 bg-[#1d1d1f] text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#333336] transition-all shadow-xs"
            >
              <Plus size={14} weight="bold" />
              <span>Save Category</span>
            </button>

            {message && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle size={15} weight="fill" />
                <span>{message}</span>
              </span>
            )}
            {error && (
              <span className="text-xs font-bold text-rose-600 flex items-center space-x-1">
                <WarningCircle size={15} weight="fill" />
                <span>{error}</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8e8ed] flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#1d1d1f]">Active Categories</h3>
          <span className="text-xs font-bold text-[#86868b]">{categories.length} Categories</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f0eaed] text-left text-xs">
            <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-5 py-3.5">Category Type</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eaed] text-[#1d1d1f]">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-xs text-[#86868b]">
                    <Folders size={36} weight="duotone" className="mx-auto mb-2 opacity-50" />
                    No custom categories defined yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.category_id} className="hover:bg-[#fbfbfd] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[#86868b] text-[11px]">#{cat.category_id}</td>
                    <td className="px-5 py-3.5 font-bold text-[#1d1d1f]">{cat.category_name}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5edf0] text-[#594951]">
                        {cat.category_type || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => handleDelete(cat.category_id)}
                        className="p-1.5 text-[#86868b] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash size={16} weight="duotone" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
