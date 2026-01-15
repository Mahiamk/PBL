import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Image as ImageIcon, Loader, Edit } from 'lucide-react';
import { fetchServices, createService, uploadImage, fetchCategories, updateService, deleteService } from '../../../lib/api';

const ServiceManager = ({ storeId }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    service_name: '',
    service_desc: '',
    service_price: '',
    image_url: '',
    category_id: '',
    status: 'active'
  });

  useEffect(() => {
    if (storeId) {
      loadServices();
      loadCategories();
    }
  }, [storeId]);

  const loadServices = async () => {
    try {
      const data = await fetchServices(storeId);
      setServices(data);
    } catch (error) {
      console.error("Failed to load services", error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const data = await fetchCategories(storeId);
      setCategories(data);
    } catch (error) {
       console.error("Failed to load categories for service manager", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: data.url }));
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      service_name: service.service_name,
      service_desc: service.service_desc || '',
      service_price: service.service_price,
      image_url: service.image_url || '',
      category_id: service.category_id || '',
      status: service.status || 'active'
    });
    setEditingId(service.service_id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
        try {
            await deleteService(serviceId);
            // Optimistic update
            setServices(prev => prev.filter(s => s.service_id !== serviceId));
        } catch (error) {
            console.error("Failed to delete service", error);
            alert("Failed to delete service.");
        }
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      service_desc: '',
      service_price: '',
      image_url: '',
      category_id: '',
      status: 'active'
    });
    setIsEditMode(false);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Image is mandatory
    if (!formData.image_url) {
        alert("Please upload an image for the service.");
        return;
    }

    try {
      const payload = {
          service_name: formData.service_name,
          service_desc: formData.service_desc,
          service_price: parseFloat(formData.service_price) || 0,
          image_url: formData.image_url,
          status: formData.status,
          store_id: parseInt(storeId),
          category_id: formData.category_id ? parseInt(formData.category_id) : null
      };
      
      if (isEditMode) {
          await updateService(editingId, payload);
          alert("Service updated successfully!");
      } else {
          await createService(payload);
      }
      
      // Reset and reload
      resetForm();
      loadServices();
    } catch (error) {
      console.error("Failed to save service", error);
      alert("Failed to save service. Please try again.");
    }
  };

  if (loading) return <div className="p-4">Loading services...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Services</h2>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="p-6">
        {services.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No services added yet. Click "Add Service" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.service_id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col group">
                <div className="h-48 bg-gray-100 relative">
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.service_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-bold text-gray-700">
                    ${parseFloat(service.service_price).toFixed(2)}
                  </div>
                  
                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                     <button 
                        onClick={() => handleEdit(service)}
                        className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Service"
                     >
                        <Edit size={18} />
                     </button>
                     <button 
                        onClick={() => handleDelete(service.service_id)}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Service"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{service.service_name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{service.service_desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Service' : 'Add New Service'}</h3>
              <button 
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Selection - If Categories Exist */}
              {categories.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="">Select a Category</option>
                        {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>
                                {cat.category_name}
                            </option>
                        ))}
                    </select>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center text-blue-600">
                      <Loader className="animate-spin mb-2" />
                      <span className="text-sm font-medium">Uploading...</span>
                    </div>
                  ) : formData.image_url ? (
                    <div className="relative w-full h-16">
                        <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-full h-full object-contain rounded-md"
                        />
                         <p className="text-center text-xs text-green-600 mt-2 font-medium">Click to replace</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                        <ImageIcon className="text-blue-500" size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Fade Haircut"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  name="service_price"
                  value={formData.service_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="service_desc"
                  value={formData.service_desc}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Briefly describe the service..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !formData.image_url}
                  className={`flex-1 py-2.5 text-white font-medium rounded-lg transition-colors shadow-sm ${
                      uploading || !formData.image_url 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {uploading ? 'Processing...' : (isEditMode ? 'Update Service' : 'Save Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
