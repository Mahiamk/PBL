import React, { useState, useRef } from 'react';
import { createService, uploadImage, fetchCategories } from '../../../../lib/api'; // Use createService
import { useAuth } from '../../../../context/AuthContext';
import { Camera, X } from 'lucide-react';

export default function ServiceForm({ onSuccess, onCancel, storeId }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    service_name: '', // Changed from product_name
    service_price: '', // Changed from product_price
    service_desc: '', // Changed from product_desc
    images: [],
    status: 'active',
    store_id: storeId || user?.storeId || '',
    category_id: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const sid = storeId || user?.storeId;
    if (sid) {
       fetchCategories(sid).then(data => {
          if (Array.isArray(data)) setCategories(data);
       }).catch(console.error);
    }
  }, [storeId, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const uploadBtn = e.target.parentElement;
        const originalText = uploadBtn.innerText;
        uploadBtn.innerText = "Uploading...";
        
        const data = await uploadImage(file);
        
        setFormData(prev => ({ 
            ...prev, 
            images: [...prev.images, data.url],
            image_url: prev.images.length === 0 ? data.url : prev.image_url 
        }));
        
        uploadBtn.innerText = originalText;
      } catch (err) {
        console.error("Upload failed", err);
        setError("Failed to upload image");
      } finally {
        e.target.value = '';
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
      const payload = {
        service_name: formData.service_name,
        service_desc: formData.service_desc,
        service_price: parseFloat(formData.service_price) || 0,
        store_id: parseInt(formData.store_id || storeId || user?.storeId || 1),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        image_url: formData.images.length > 0 ? formData.images[0] : '',
        status: formData.status
      };

      await createService(payload);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Add New Service</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="service_name"
              required
              value={formData.service_name}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              placeholder="e.g., Suit Alteration, Hemming"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
            >
              <option value="">None</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="service_price"
              required
              min="0"
              step="0.01"
              value={formData.service_price}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="service_desc"
              rows={4}
              value={formData.service_desc}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              placeholder="Describe the service details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Images</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                    <span>Upload a file</span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="sr-only" 
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            
            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </form>
    </div>
  );
}