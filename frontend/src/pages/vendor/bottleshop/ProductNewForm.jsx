import React, { useState, useEffect, useRef } from 'react';
import { createProduct, fetchCategories, uploadImage } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Camera, HelpCircle, X, Check } from 'lucide-react';

export default function ProductNewForm({ onSuccess, onCancel, storeId }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    product_price: '',
    weight: '',
    category_id: '',
    tax_class: 'Taxable Goods',
    product_desc: '',
    images: [],
    url_key: '',
    meta_title: '',
    meta_desc: '',
    status: 'active',
    visibility: 'catalog_search',
    manage_stock: true,
    stock_availability: 'in_stock',
    stock_quantity: '',
    store_id: storeId || user?.storeId || '',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const AVAILABLE_COLORS = [
    { name: 'White', hex: '#FFFFFF', border: 'border-gray-300' },
    { name: 'Black', hex: '#000000', border: 'border-black' },
    { name: 'Yellow', hex: '#FCD34D', border: 'border-yellow-400' },
    { name: 'Red', hex: '#EF4444', border: 'border-red-500' },
    { name: 'Blue', hex: '#3B82F6', border: 'border-blue-500' },
    { name: 'Green', hex: '#10B981', border: 'border-green-500' },
    { name: 'Gray', hex: '#6B7280', border: 'border-gray-500' }
  ];

  useEffect(() => {
    const currentStoreId = storeId || user?.storeId;
    if (currentStoreId) {
      fetchCategories(currentStoreId).then(setCategories).catch(console.error);
    } else {
      fetchCategories().then(setCategories).catch(console.error);
    }
  }, [storeId, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const toggleColor = (colorName) => {
    setSelectedColors(prev => 
      prev.includes(colorName) 
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handleAddImage = () => {
    if (imageUrl) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
      setImageUrl('');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await uploadImage(file);
        setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
      } catch (err) {
        console.error("Upload failed", err);
        setError("Failed to upload image");
      }
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Append color metadata to description nicely
      let description = formData.product_desc;
      if (selectedColors.length > 0) {
        const colorString = JSON.stringify(selectedColors);
        description += `\n\n<!-- COLORS:${colorString} -->`;
      }

      const payload = {
        ...formData,
        product_desc: description,
        product_price: parseFloat(formData.product_price),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category_id: parseInt(formData.category_id),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        store_id: parseInt(formData.store_id || storeId || user?.storeId || 1)
      };

      await createProduct(payload);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">New Product</h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Product Name *</label>
            <input
              type="text"
              name="product_name"
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={formData.product_name}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Price *</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="product_price"
                required
                min="0"
                step="0.01"
                className="block w-full pl-7 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={formData.product_price}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Category *</label>
             <select
               name="category_id"
               required
               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
               value={formData.category_id}
               onChange={handleChange}
             >
               <option value="">Select a category</option>
               {categories.map(c => (
                 <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900">Available Colors</h3>
        <div className="flex flex-wrap gap-4">
          {AVAILABLE_COLORS.map((color) => {
            const isSelected = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleColor(color.name)}
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                  ${isSelected ? 'ring-2 ring-offset-2 ring-green-500 scale-110' : 'hover:scale-105'}
                  ${color.border}
                `}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {isSelected && (
                  <Check className={`w-6 h-6 ${color.name === 'White' || color.name === 'Yellow' ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500">Selected: {selectedColors.join(', ') || 'None'}</p>
      </div>

      {/* Description */}
      <div className="space-y-4 border-t pt-6">
         <label className="block text-sm font-medium text-gray-700">Description</label>
         <textarea
           name="product_desc"
           rows={4}
           className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
           value={formData.product_desc}
           onChange={handleChange}
         />
      </div>

      {/* Inventory */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900">Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              name="sku"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={formData.sku}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="stock_quantity"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={formData.stock_quantity}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900">Images</h3>
        <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
        />
        
        <div className="flex flex-wrap gap-4">
          <button
             type="button"
             onClick={() => fileInputRef.current?.click()}
             className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors"
          >
            <Camera className="w-8 h-8 mb-1" />
            <span className="text-xs">Add Image</span>
          </button>
          
          {formData.images.map((img, idx) => (
             <div key={idx} className="relative w-24 h-24 group">
               <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover rounded-lg" />
               <button
                 type="button"
                 onClick={() => removeImage(idx)}
                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
          ))}
        </div>
        
        <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Or enter image URL" 
                className="flex-1 border-gray-300 rounded-md sm:text-sm"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
            />
            <button 
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
                Add URL
            </button>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
