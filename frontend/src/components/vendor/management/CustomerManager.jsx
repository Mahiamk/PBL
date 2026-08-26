import React, { useState } from 'react';
import { 
  MagnifyingGlass, 
  Users, 
  EnvelopeSimple, 
  CalendarCheck,
  CheckCircle,
  User
} from '@phosphor-icons/react';

const CustomerManager = ({ customers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || (customer.status && customer.status.toLowerCase() === statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-[#8e6e7d] uppercase tracking-widest block mb-1">
            Client Relations
          </span>
          <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">Customer Directory</h2>
          <p className="text-xs text-[#6e6e73]">
            Verified university students and campus clients registered with your store.
          </p>
        </div>
        <span className="text-xs font-bold text-[#1d1d1f] bg-[#f5f5f7] px-3.5 py-1.5 rounded-full border border-[#e8e8ed]">
          {customers.length} Registered Students
        </span>
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
            placeholder="Search by name, student ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs font-semibold text-[#8e6e7d] hover:text-[#1d1d1f] px-3 py-1.5"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f0eaed] text-left text-xs">
            <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3.5">Student / Customer</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Total Orders</th>
                <th className="px-5 py-3.5">Total Spent</th>
                <th className="px-5 py-3.5 text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eaed] text-[#1d1d1f]">
              {currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-[#86868b]">
                    <Users size={36} weight="duotone" className="mx-auto mb-2 opacity-50" />
                    No customer records found.
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer, idx) => (
                  <tr key={customer.id || customer.customer_id || idx} className="hover:bg-[#fbfbfd] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#f5edf0] text-[#594951] font-bold text-xs flex items-center justify-center shrink-0">
                          {customer.customer_name?.[0] || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-[#1d1d1f] block">{customer.customer_name || 'AIU Student'}</span>
                          <span className="text-[10px] text-[#86868b]">ID: {customer.student_id || `STU-${1000 + idx}`}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#6e6e73]">
                      <div className="flex items-center space-x-1.5">
                        <EnvelopeSimple size={14} className="text-[#86868b]" />
                        <span>{customer.email || 'student@aiu.edu.my'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold">
                      {customer.orders_count || customer.total_orders || 1} Orders
                    </td>
                    <td className="px-5 py-3.5 font-black text-[#1d1d1f]">
                      RM {Number(customer.total_spent || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Verified Student</span>
                      </span>
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

export default CustomerManager;