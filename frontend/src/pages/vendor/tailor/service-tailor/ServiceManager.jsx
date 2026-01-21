import React, { useState, useEffect } from 'react';
import { fetchServices, deleteService, updateService } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import { Search, Filter, MoreHorizontal, Trash2, Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

const ServiceManager = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchServices(user?.storeId);
      setServices(data);
    } catch (error) {
      console.error("Failed to load services", error);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
        setServices(services.filter(s => s.service_id !== serviceId));
        setSuccess('Service deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error("Failed to delete service", error);
        setError("Failed to delete service");
      }
    }
  };

  const handleEditClick = (service) => {
    setEditingId(service.service_id);
    setEditForm({
      service_name: service.service_name,
      service_price: service.service_price,
      service_desc: service.service_desc,
      status: service.status || 'active'
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setError(null);
  };

  const handleSaveEdit = async (serviceId) => {
    try {
      await updateService(serviceId, editForm);
      setSuccess('Service updated successfully');
      setEditingId(null);
      loadServices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to update service", err);
      setError('Failed to update service');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'service_price' ? parseFloat(value) : value
    }));
  };

  if (loading) return <div>Loading services...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Service Management</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.service_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === service.service_id ? (
                    <input
                      type="text"
                      name="service_name"
                      value={editForm.service_name}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <div className="flex items-center">
                      {service.image_url && (
                        <img className="h-10 w-10 rounded-full object-cover mr-3" src={service.image_url} alt="" />
                      )}
                      <div className="text-sm font-medium text-gray-900">{service.service_name}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === service.service_id ? (
                    <input
                      type="number"
                      name="service_price"
                      value={editForm.service_price}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">${service.service_price}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === service.service_id ? (
                    <textarea
                      name="service_desc"
                      value={editForm.service_desc}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <div className="text-sm text-gray-500 truncate max-w-xs">{service.service_desc}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === service.service_id ? (
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === service.service_id ? (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleSaveEdit(service.service_id)} className="text-green-600 hover:text-green-900">
                        <Save size={18} />
                      </button>
                      <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleEditClick(service)} className="text-indigo-600 hover:text-indigo-900">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(service.service_id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceManager;