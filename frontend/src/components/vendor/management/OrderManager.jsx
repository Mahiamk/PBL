import React, { useState, useEffect, useRef } from 'react';
import { updateOrderStatus } from '../../../lib/api';
import { 
  MagnifyingGlass, 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  Package, 
  SlidersHorizontal,
  User
} from '@phosphor-icons/react';

const OrderManager = ({ orders = [], onOrderUpdate, selectedId }) => {
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

  const getStatusBadge = (status = '') => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Completed</span>
          </span>
        );
      case 'accepted':
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{status}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span>Ready for Pickup</span>
          </span>
        );
      case 'cancelled': 
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-700 border border-gray-100">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            <span>{status || 'Pending'}</span>
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(order => {
    const displayId = order.store_order_id || order.order_id;
    const matchesSearch = 
      String(displayId).includes(searchTerm) || 
      (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (order.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-[#8e6e7d] uppercase tracking-widest block mb-1">
            Store Orders
          </span>
          <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">Order Management & Fulfillment</h2>
          <p className="text-xs text-[#6e6e73]">
            Track client purchases, update status, and manage campus pick-ups.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-full border border-[#e8e8ed]">
            {orders.length} Total Orders
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#e8e8ed] shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
            <MagnifyingGlass size={16} weight="bold" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3.5 py-2 border border-[#e8e8ed] rounded-full text-xs bg-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:bg-white focus:border-[#8e6e7d] transition-all duration-200"
            placeholder="Search order ID, customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1.5 bg-[#f5f5f7] px-3 py-1.5 rounded-full border border-[#e8e8ed] text-xs">
            <SlidersHorizontal size={14} className="text-[#86868b]" />
            <select 
              className="bg-transparent text-xs font-bold text-[#1d1d1f] focus:outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="accepted">Accepted</option>
              <option value="shipped">Ready / Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="text-xs font-semibold text-[#8e6e7d] hover:text-[#1d1d1f] px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f0eaed] text-left text-xs">
            <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Items Purchased</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eaed] text-[#1d1d1f]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-[#86868b]">
                    <Receipt size={36} weight="duotone" className="mx-auto mb-2 opacity-50" />
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const displayId = order.store_order_id || order.order_id;
                  const isSelected = selectedId && String(displayId) === String(selectedId);

                  return (
                    <tr 
                      key={order.order_id || displayId} 
                      ref={isSelected ? selectedRowRef : null}
                      className={`hover:bg-[#fbfbfd] transition-colors ${isSelected ? 'bg-[#f5edf0]/40' : ''}`}
                    >
                      <td className="px-5 py-3.5 font-black text-[#1d1d1f]">
                        #{displayId}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-[#f5edf0] text-[#594951] font-bold text-xs flex items-center justify-center shrink-0">
                            {order.customer_name?.[0] || 'C'}
                          </div>
                          <div>
                            <span className="font-bold text-[#1d1d1f] block">{order.customer_name || 'Campus Student'}</span>
                            <span className="text-[10px] text-[#86868b]">{order.customer_email || 'student@aiu.edu'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#6e6e73]">
                        {order.items && order.items.length > 0 ? (
                          <span className="font-semibold">{order.items.map(i => `${i.product_name} (x${i.quantity})`).join(', ')}</span>
                        ) : (
                          <span>{order.total_items || 1} item(s)</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#86868b] text-[11px]">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                      </td>
                      <td className="px-5 py-3.5 font-black text-[#1d1d1f]">
                        RM {Number(order.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {order.status !== 'Completed' && (
                            <button
                              disabled={updatingId === order.order_id}
                              onClick={() => handleStatusUpdate(order.order_id, 'Completed')}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {order.status !== 'Accepted' && order.status !== 'Completed' && (
                            <button
                              disabled={updatingId === order.order_id}
                              onClick={() => handleStatusUpdate(order.order_id, 'Accepted')}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                            >
                              Accept
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;
