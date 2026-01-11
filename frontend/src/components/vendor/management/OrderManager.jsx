import React, { useState, useEffect, useRef } from 'react';
import { updateOrderStatus } from '../../../lib/api';
import { Search, Filter, Eye, CheckCircle, XCircle, Truck, Package } from 'lucide-react';

const OrderManager = ({ orders, onOrderUpdate, selectedId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const selectedRowRef = useRef(null);

  useEffect(() => {
    if (selectedId && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId, orders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error("Failed to update order status", error);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (String(status).toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'accepted': 
      case 'confirmed':
      case '1': return 'bg-blue-100 text-blue-800';
      case 'processing': 
      case 'pending':
      case '0': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': 
      case 'rejected':
      case '-1': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (String(status).toLowerCase()) {
      case '0': return 'Pending';
      case '1': return 'Accepted';
      case '-1': return 'Cancelled';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const displayId = order.store_order_id || order.order_id;
    const matchesSearch = 
      String(displayId).includes(searchTerm) || 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status Filter Logic mapped to new codes
    let statusMatch = true;
    const currentStatus = String(order.status).toLowerCase();
    
    if (statusFilter !== 'all') {
        if (statusFilter === 'processing' || statusFilter === 'pending') {
            statusMatch = currentStatus === '0' || currentStatus === 'pending' || currentStatus === 'processing';
        } else if (statusFilter === 'accepted') {
            statusMatch = currentStatus === '1' || currentStatus === 'accepted';
        } else if (statusFilter === 'cancelled' || statusFilter === 'rejected') {
            statusMatch = currentStatus === '-1' || currentStatus === 'cancelled' || currentStatus === 'rejected';
        } else {
            statusMatch = currentStatus === statusFilter.toLowerCase();
        }
    }
    
    return matchesSearch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Search orders by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="accepted">Accepted</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr 
                key={order.order_id} 
                className={`hover:bg-gray-50 ${selectedId && (parseInt(selectedId) === order.order_id) ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}
                ref={selectedId && (parseInt(selectedId) === order.order_id) ? selectedRowRef : null}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.store_order_id || order.order_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.customer_name || 'Guest'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="space-y-2">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name} className="h-10 w-10 rounded object-cover border border-gray-200" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                        <div>
                          <p className="text-gray-900 font-medium text-xs">{item.product_name}</p>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.order_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.total_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {(String(order.status) === '0' || order.status === 'Processing' || order.status === 'Pending') && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.order_id, '1')}
                          disabled={updatingId === order.order_id}
                          className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"
                          title="Accept Order"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.order_id, '-1')}
                          disabled={updatingId === order.order_id}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded"
                          title="Reject Order"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {(String(order.status) === '1' || order.status === 'Accepted') && (
                      <button
                        onClick={() => handleStatusUpdate(order.order_id, 'Shipped')}
                        disabled={updatingId === order.order_id}
                        className="text-purple-600 hover:text-purple-900 bg-purple-50 p-1 rounded"
                        title="Mark as Shipped"
                      >
                        <Truck className="h-5 w-5" />
                      </button>
                    )}
                    {order.status === 'Shipped' && (
                      <button
                        onClick={() => handleStatusUpdate(order.order_id, 'Completed')}
                        disabled={updatingId === order.order_id}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1 rounded"
                        title="Mark as Completed"
                      >
                        <Package className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManager;
