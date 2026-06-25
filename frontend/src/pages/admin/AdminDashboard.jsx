import React, { useEffect, useState } from 'react';
import { fetchAdminDashboard, fetchVendorApplications, fetchUsers, approveVendor, rejectVendor, deleteUser } from '../../lib/api';
import { 
  Users, 
  FileText, 
  Activity, 
  Check, 
  X, 
  Shield, 
  Trash2, 
  LayoutDashboard,
  LogOut,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('all');
  const [ordersPeriod, setOrdersPeriod] = useState('daily');
  const [usersPeriod, setUsersPeriod] = useState('daily');

  const getOrdersData = () => {
    if (!stats) return [];
    switch(ordersPeriod) {
      case 'weekly': return stats.orders_graph_weekly || [];
      case 'monthly': return stats.orders_graph_monthly || [];
      default: return stats.orders_graph || [];
    }
  };

  const getUsersData = () => {
    if (!stats) return [];
    switch(usersPeriod) {
      case 'weekly': return stats.users_graph_weekly || [];
      case 'monthly': return stats.users_graph_monthly || [];
      default: return stats.users_graph || [];
    }
  };


  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await fetchAdminDashboard();
        setStats(data);
      } else if (activeTab === 'applications') {
        const data = await fetchVendorApplications();
        setApplications(data);
      } else if (activeTab === 'users') {
        const data = await fetchUsers();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId) => {
    if (window.confirm('Are you sure you want to approve this vendor?')) {
      try {
        await approveVendor(appId);
        loadData();
      } catch (error) {
        alert('Failed to approve vendor');
      }
    }
  };

  const handleReject = async (appId) => {
    if (window.confirm('Are you sure you want to reject this vendor?')) {
      try {
        await rejectVendor(appId);
        loadData();
      } catch (error) {
        alert('Failed to reject vendor');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error(error);
            alert('Failed to delete user. They may have active orders or data.');
        }
    }
  };
  
  const handleLogout = () => {
      logout();
      navigate('/');
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-none">
          <p className="text-xs font-mono text-gray-500 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <p className="text-sm font-bold font-mono">
              {payload[0].value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Sidebar - Shadcn Style: Minimalist */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-md font-bold">
                    A
                </div>
                <h1 className="text-lg font-bold tracking-tight">Admin</h1>
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-gray-100 text-black' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'applications' 
                ? 'bg-gray-100 text-black' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <FileText size={18} />
            Applications
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-gray-100 text-black' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <Users size={18} />
            Users
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                <LogOut size={18} />
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
            <h2 className="text-xl font-semibold tracking-tight capitalize">{activeTab}</h2>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium">
                    AD
                </div>
            </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            ) : (
                <>
                    {/* Overview Content */}
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                                        <Shield size={18} className="text-gray-400" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-bold tracking-tight text-gray-900">{stats.total_vendors}</h3>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium text-gray-500">Total Customers</p>
                                        <Users size={18} className="text-gray-400" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-bold tracking-tight text-gray-900">{stats.total_customers}</h3>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                        <ShoppingBag size={18} className="text-gray-400" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-bold tracking-tight text-gray-900">{stats.total_orders}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Graphs Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Orders Graph */}
                                <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Orders Overview</h3>
                                            <p className="text-sm text-gray-500 capitalize">{ordersPeriod} volume</p>
                                        </div>
                                        <div className="flex gap-1 bg-gray-50 p-1 rounded-md border border-gray-100">
                                            {['daily', 'weekly', 'monthly'].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setOrdersPeriod(p)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-sm capitalize transition-all ${
                                                        ordersPeriod === p ? 'bg-white text-black shadow-sm border border-gray-100' : 'text-gray-500 hover:text-black'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={getOrdersData()}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fill: '#9ca3af', fontSize: 12}} 
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fill: '#9ca3af', fontSize: 12}} 
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="#000000" 
                                                    strokeWidth={2} 
                                                    dot={false}
                                                    activeDot={{r: 4, fill: '#000000'}} 
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Trend Graph (Users / Vendors) */}
                                <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Vendor Growth</h3>
                                            <p className="text-sm text-gray-500 capitalize">{usersPeriod} applications</p>
                                        </div>
                                        <div className="flex gap-1 bg-gray-50 p-1 rounded-md border border-gray-100">
                                            {['daily', 'weekly', 'monthly'].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setUsersPeriod(p)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-sm capitalize transition-all ${
                                                        usersPeriod === p ? 'bg-white text-black shadow-sm border border-gray-100' : 'text-gray-500 hover:text-black'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={getUsersData()}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fill: '#9ca3af', fontSize: 12}} 
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fill: '#9ca3af', fontSize: 12}} 
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="#9ca3af" 
                                                    strokeWidth={2} 
                                                    dot={false}
                                                    activeDot={{r: 4, fill: '#9ca3af'}} 
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">ID</th>
                                            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Business Name</th>
                                            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Type</th>
                                            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Status</th>
                                            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Date</th>
                                            <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase tracking-wider text-xs">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {applications.map((app) => (
                                            <tr key={app.application_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-gray-500">#{app.application_id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{app.business_name}</td>
                                                <td className="px-6 py-4 text-gray-500 capitalize">{app.vendor_type}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        (app.status?.toLowerCase() === 'active' || app.status?.toLowerCase() === 'approved') 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : (!app.status || app.status?.toLowerCase() === 'pending') 
                                                                ? 'bg-yellow-100 text-yellow-800' 
                                                                : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {app.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {(!app.status || app.status.toLowerCase() === 'pending' || app.status.toLowerCase() === 'rejected') && (
                                                            <button 
                                                            onClick={() => handleApprove(app.application_id)}
                                                            className="p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                                                            title="Approve"
                                                            >
                                                            <Check size={16} />
                                                            </button>
                                                        )}
                                                        {(!app.status || app.status.toLowerCase() === 'pending' || app.status.toLowerCase() === 'active' || app.status.toLowerCase() === 'approved') && (
                                                            <button 
                                                            onClick={() => handleReject(app.application_id)}
                                                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Reject"
                                                            >
                                                            <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {applications.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                                    No applications found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex justify-end gap-2">
                                {['all', 'vendor', 'customer'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setUserFilter(filter)}
                                        className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border ${
                                            userFilter === filter 
                                                ? 'bg-black text-white border-black' 
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">ID</th>
                                                <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">User</th>
                                                <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Contact</th>
                                                <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Role</th>
                                                <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Status</th>
                                                <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase tracking-wider text-xs">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users.filter(user => userFilter === 'all' || user.role === userFilter).map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-gray-500">#{user.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{user.full_name}</div>
                                                        {user.vendor_type && <div className="text-xs text-gray-400 capitalize mt-0.5">{user.vendor_type}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize border ${
                                                            user.role === 'vendor' 
                                                                ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                                                : 'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            (user.status === 'active' || user.status === 'ACTIVE') 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {user.status || 'active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                                        No users found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
