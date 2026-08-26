import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  Loader, 
  Pencil, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Sparkle
} from 'lucide-react';
import { 
  fetchServices, 
  createService, 
  updateService, 
  deleteService, 
  uploadImage, 
  getImageUrl 
} from '../../../lib/api';

const ServiceManager = ({ storeId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    service_name: '',
    service_desc: '',
    service_price: '',
    image_url: '',
    status: 'active'
  });

  useEffect(() => {
    if (storeId) {
      loadServices();
    }
  }, [storeId]);

  const loadServices = async () => {
    try {
      const data = await fetchServices(storeId);
      setServices(data || []);
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      service_name: '',
      service_desc: '',
      service_price: '',
      image_url: '',
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name || '',
      service_desc: service.service_desc || '',
      service_price: service.service_price ? String(service.service_price) : '',
      image_url: service.image_url || '',
      status: service.status || 'active'
    });
    setIsAddModalOpen(true);
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
    } catch (err) {
      console.error("Image upload failed", err);
      showError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.service_name.trim()) {
      showError("Service name is required.");
      return;
    }

    if (!formData.service_price || isNaN(formData.service_price) || Number(formData.service_price) <= 0) {
      showError("Please provide a valid service price in RM.");
      return;
    }

    try {
      const payload = {
        service_name: formData.service_name.trim(),
        service_desc: formData.service_desc.trim(),
        service_price: parseFloat(formData.service_price),
        image_url: formData.image_url || '',
        status: formData.status || 'active',
        store_id: storeId
      };

      if (editingService) {
        await updateService(editingService.service_id, payload);
        showSuccess(`"${payload.service_name}" updated successfully!`);
      } else {
        await createService(payload);
        showSuccess(`"${payload.service_name}" created successfully!`);
      }

      setIsAddModalOpen(false);
      setEditingService(null);
      loadServices();
    } catch (err) {
      console.error("Failed to save service", err);
      showError(err.response?.data?.detail || "Failed to save service. Please try again.");
    }
  };

  const handleDelete = async (serviceId, serviceName) => {
    if (window.confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      try {
        setDeletingServiceId(serviceId);
        await deleteService(serviceId);
        showSuccess(`"${serviceName}" deleted successfully.`);
        loadServices();
      } catch (err) {
        console.error("Failed to delete service", err);
        showError(err.response?.data?.detail || "Failed to delete service.");
      } finally {
        setDeletingServiceId(null);
      }
    }
  };

  const filteredServices = services.filter(s => 
    s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.service_desc && s.service_desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#e8e8ed] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8e6e7d] mb-3"></div>
        <p className="text-xs text-[#86868b]">Loading therapy & wellness services...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-[#e8e8ed]">
      {/* Header */}
      <div className="p-6 border-b border-[#e8e8ed] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fbfbfd] rounded-t-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block mb-1">
            Service Catalog Management
          </span>
          <h2 className="text-lg font-bold text-[#1d1d1f]">Therapy & Service Offerings</h2>
          <p className="text-xs text-[#6e6e73]">Add, modify, edit session prices, and manage treatment options.</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
            <input 
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#e8e8ed] rounded-2xl focus:border-[#8e6e7d] outline-none transition-all"
            />
          </div>

          <button 
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold rounded-2xl transition-all shadow-xs shrink-0 active:scale-95"
          >
            <Plus size={15} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Service Cards Grid */}
      <div className="p-6">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-[#fbfbfd] rounded-2xl border border-dashed border-[#e8e8ed]">
            <Sparkle size={32} className="mx-auto text-[#8e6e7d] mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-[#1d1d1f]">No services found</h3>
            <p className="text-xs text-[#86868b] max-w-sm mx-auto mt-1 mb-4">
              {searchTerm ? "No services match your search query." : "Get started by adding your first cupping, massage, or therapy session."}
            </p>
            <button 
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1d1d1f] text-white text-xs font-semibold rounded-full hover:bg-[#333336] transition-all"
            >
              <Plus size={14} />
              <span>Add Your First Service</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div 
                key={service.service_id} 
                className="border border-[#e8e8ed] rounded-3xl overflow-hidden flex flex-col bg-white shadow-xs hover:shadow-md hover:border-[#dfd5da] transition-all duration-200 group"
              >
                {/* Image Frame */}
                <div className="h-48 bg-[#f5f5f7] relative overflow-hidden">
                  {service.image_url ? (
                    <img 
                      src={getImageUrl(service.image_url)} 
                      alt={service.service_name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/bowl-white.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={36} className="text-[#8e6e7d] opacity-40 mb-1" />
                      <span className="text-[10px] font-semibold text-[#86868b]">No Photo Attached</span>
                    </div>
                  )}

                  {/* Price Tag Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-extrabold text-[#1d1d1f] shadow-xs border border-[#e8e8ed]">
                    RM {parseFloat(service.service_price).toFixed(2)}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                      service.status === 'active' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      <span className="w-1 h-1 rounded-full bg-white"></span>
                      <span className="capitalize">{service.status || 'Active'}</span>
                    </span>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#1d1d1f] mb-1.5 line-clamp-1">{service.service_name}</h3>
                    <p className="text-xs text-[#6e6e73] line-clamp-2 leading-relaxed">
                      {service.service_desc || 'Custom treatment session and wellness service.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-[#f0eaed] flex items-center justify-between">
                    <button 
                      onClick={() => handleOpenEdit(service)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#f5edf0] hover:bg-[#eee0e5] text-[#594951] text-xs font-semibold rounded-xl border border-[#e6dadf] transition-all"
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>

                    <button 
                      onClick={() => handleDelete(service.service_id, service.service_name)}
                      disabled={deletingServiceId === service.service_id}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                      {deletingServiceId === service.service_id ? (
                        <Loader size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="p-6 border-b border-[#e8e8ed] flex justify-between items-center bg-[#fbfbfd] rounded-t-3xl">
              <div>
                <span className="text-[10px] font-bold text-[#8e6e7d] uppercase tracking-widest block">
                  {editingService ? "Update Listing" : "New Service"}
                </span>
                <h3 className="text-base font-bold text-[#1d1d1f]">
                  {editingService ? `Edit "${editingService.service_name}"` : "Add New Therapy Service"}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-2">
                  Service Image / Photo
                </label>
                <div className="border-2 border-dashed border-[#e8e8ed] rounded-2xl p-5 flex flex-col items-center justify-center bg-[#fbfbfd] hover:bg-white transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center text-[#8e6e7d]">
                      <Loader className="animate-spin mb-2" size={20} />
                      <span className="text-xs font-medium">Uploading image...</span>
                    </div>
                  ) : formData.image_url ? (
                    <div className="relative w-full h-40">
                      <img 
                        src={getImageUrl(formData.image_url)} 
                        alt="Preview" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/bowl-white.jpg';
                        }}
                        className="w-full h-full object-contain rounded-xl"
                      />
                      <p className="text-center text-xs text-emerald-600 mt-2 font-semibold">Click to replace photo</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#f5edf0] flex items-center justify-center text-[#8e6e7d] mb-2">
                        <ImageIcon size={20} />
                      </div>
                      <p className="text-xs font-bold text-[#1d1d1f]">Click to upload photo</p>
                      <p className="text-[10px] text-[#86868b] mt-0.5">PNG, JPG, WebP up to 5MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                  Service Name *
                </label>
                <input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-[#f5f5f7] focus:bg-white border border-[#e8e8ed] rounded-2xl focus:border-[#8e6e7d] outline-none transition-all"
                  placeholder="e.g. Traditional Cupping Therapy (Hijama)"
                />
              </div>

              {/* Price & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                    Price (RM) *
                  </label>
                  <input
                    type="number"
                    name="service_price"
                    value={formData.service_price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#f5f5f7] focus:bg-white border border-[#e8e8ed] rounded-2xl focus:border-[#8e6e7d] outline-none transition-all font-bold"
                    placeholder="45.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                    Availability Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#f5f5f7] focus:bg-white border border-[#e8e8ed] rounded-2xl focus:border-[#8e6e7d] outline-none transition-all"
                  >
                    <option value="active">Active (Available)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                  Treatment Description
                </label>
                <textarea
                  name="service_desc"
                  value={formData.service_desc}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#f5f5f7] focus:bg-white border border-[#e8e8ed] rounded-2xl focus:border-[#8e6e7d] outline-none transition-all"
                  placeholder="Describe treatment procedure, duration (e.g. 45 mins), targeted muscle groups, or health benefits..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#f5f5f7] hover:bg-[#ebebef] text-[#1d1d1f] font-semibold text-xs rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`flex-1 py-2.5 text-white font-semibold text-xs rounded-full transition-all shadow-xs ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#1d1d1f] hover:bg-[#333336]'
                  }`}
                >
                  {uploading ? 'Uploading...' : editingService ? 'Save Changes' : 'Create Service'}
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
