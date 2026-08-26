import React, { useEffect, useState } from 'react';
import {
  fetchAdminDashboard,
  fetchVendorApplications,
  fetchUsers,
  fetchStores,
  approveVendor,
  rejectVendor,
  deleteUser,
} from '../../lib/api';
import {
  ShieldCheck,
  Users,
  Storefront,
  ShoppingBag,
  Sparkle,
  TrendUp,
  CheckCircle,
  XCircle,
  Trash,
  SignOut,
  CalendarCheck,
  Clock,
  ArrowRight,
  MagnifyingGlass,
  FileText,
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import D3AreaTrendChart from '../../components/charts/D3AreaTrendChart';
import D3BarComparisonChart from '../../components/charts/D3BarComparisonChart';
import D3DonutBreakdownChart from '../../components/charts/D3DonutBreakdownChart';
import D3StatSparkline from '../../components/charts/D3StatSparkline';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'stores') {
        const [dashData, storeData] = await Promise.all([
          fetchAdminDashboard().catch(() => null),
          fetchStores().catch(() => []),
        ]);
        setStats(dashData);
        setStores(storeData || []);
      } else if (activeTab === 'applications') {
        const data = await fetchVendorApplications();
        setApplications(data || []);
      } else if (activeTab === 'users') {
        const data = await fetchUsers();
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Failed to load admin data', error);
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
    if (
      window.confirm(
        'Are you sure you want to permanently delete this user? This action cannot be undone.'
      )
    ) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
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

  // Prepare 100% Real D3 Chart Datasets from DB stats
  const revenueTrendData = stats?.revenue_trend && stats.revenue_trend.length > 0
    ? stats.revenue_trend
    : (stats?.orders_graph && stats.orders_graph.length > 0
        ? stats.orders_graph.map(d => ({ date: d.name, total: Number(d.value || 0) }))
        : [
            { date: 'Mon', total: 0 },
            { date: 'Tue', total: 0 },
            { date: 'Wed', total: 0 },
            { date: 'Thu', total: 0 },
            { date: 'Fri', total: 0 },
            { date: 'Sat', total: 0 },
            { date: 'Sun', total: 0 },
          ]);

  const storeDistributionData = stats?.store_distribution && stats.store_distribution.length > 0
    ? stats.store_distribution.map(s => ({ label: s.name, value: s.value || 1 }))
    : (stores.length > 0 
        ? stores.map(s => ({ label: s.store_name, value: 1 }))
        : [{ label: 'Campus Stores', value: 1 }]);

  const ordersVolumeData = stats?.orders_graph && stats.orders_graph.length > 0
    ? stats.orders_graph.map(d => ({ label: d.name, value: Number(d.value || 0) }))
    : [
        { label: 'Mon', value: 0 },
        { label: 'Tue', value: 0 },
        { label: 'Wed', value: 0 },
        { label: 'Thu', value: 0 },
        { label: 'Fri', value: 0 },
        { label: 'Sat', value: 0 },
        { label: 'Sun', value: 0 },
      ];

  const realTotalRevenue = stats?.total_revenue ? stats.total_revenue : 0;
  const realVendorsCount = stats?.total_vendors !== undefined ? stats.total_vendors : stores.length;
  const realCustomersCount = stats?.total_customers !== undefined ? stats.total_customers : 0;
  const realOrdersCount = stats?.total_orders !== undefined ? stats.total_orders : 0;

  const filteredUsers = users.filter((u) => {
    const matchesRole = userFilter === 'all' || u.role === userFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-[#e8e8ed] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#e8e8ed]">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-[#1d1d1f] text-white flex items-center justify-center rounded-2xl shadow-xs">
                <ShieldCheck size={20} weight="duotone" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-[#1d1d1f] tracking-tight">
                  Admin Console
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d]">
                  AIU Market Suite
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#f5edf0] text-[#1d1d1f] font-bold shadow-xs'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <TrendUp size={18} weight="duotone" className="text-[#8e6e7d]" />
              <span>Platform & D3 Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                activeTab === 'applications'
                  ? 'bg-[#f5edf0] text-[#1d1d1f] font-bold shadow-xs'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <FileText size={18} weight="duotone" className="text-[#8e6e7d]" />
              <div className="flex items-center justify-between flex-1">
                <span>Vendor Applications</span>
                {applications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1d1d1f] text-white">
                    {applications.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('stores')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                activeTab === 'stores'
                  ? 'bg-[#f5edf0] text-[#1d1d1f] font-bold shadow-xs'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <Storefront size={18} weight="duotone" className="text-[#8e6e7d]" />
              <span>Campus Stores Registry</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-[#f5edf0] text-[#1d1d1f] font-bold shadow-xs'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <Users size={18} weight="duotone" className="text-[#8e6e7d]" />
              <span>User Management</span>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#e8e8ed]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl text-xs font-medium text-[#86868b] hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            <SignOut size={16} weight="duotone" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
        {/* Top greeting bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
          <div>
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#f5edf0] text-[#594951] text-[10px] font-bold mb-1">
              <span>Administration Gateway</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1d1d1f] tracking-tight">
              Executive Marketplace Control
            </h2>
            <p className="text-xs text-[#6e6e73]">
              Live monitoring of campus shops, revenue trends, and student booking activity.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => loadData()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#f5edf0] text-[#1d1d1f] text-xs font-semibold border border-[#e8e8ed] transition-all"
            >
              <Clock size={14} weight="duotone" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border-2 border-[#dfd5da] border-t-[#1d1d1f] animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Tab 1: Overview & D3 Analytics */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* 4 KPI Cards with D3 Sparklines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Active Campus Stores */}
                  <div className="bg-white rounded-3xl border border-[#e8e8ed] p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] block mb-1">
                        Active Campus Stores
                      </span>
                      <div className="text-2xl font-black text-[#1d1d1f] tracking-tight">
                        {realVendorsCount}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Operational
                      </span>
                    </div>
                    <D3StatSparkline
                      data={[realVendorsCount, realVendorsCount, realVendorsCount, realVendorsCount, realVendorsCount, realVendorsCount, realVendorsCount]}
                      color="#1d1d1f"
                      width={70}
                      height={28}
                    />
                  </div>

                  {/* Total Customers */}
                  <div className="bg-white rounded-3xl border border-[#e8e8ed] p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] block mb-1">
                        Registered Students
                      </span>
                      <div className="text-2xl font-black text-[#1d1d1f] tracking-tight">
                        {realCustomersCount}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Campus Accounts
                      </span>
                    </div>
                    <D3StatSparkline
                      data={stats?.users_graph && stats.users_graph.length > 0 ? stats.users_graph.map(u => u.value) : [0, 0, 0, 0, 0, 0, realCustomersCount]}
                      color="#8e6e7d"
                      width={70}
                      height={28}
                    />
                  </div>

                  {/* Total Orders & Volume */}
                  <div className="bg-white rounded-3xl border border-[#e8e8ed] p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] block mb-1">
                        Total Orders
                      </span>
                      <div className="text-2xl font-black text-[#1d1d1f] tracking-tight">
                        {realOrdersCount}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Fulfillment Live
                      </span>
                    </div>
                    <D3StatSparkline
                      data={stats?.orders_graph && stats.orders_graph.length > 0 ? stats.orders_graph.map(o => o.value) : [0, 0, 0, 0, 0, 0, realOrdersCount]}
                      color="#594951"
                      width={70}
                      height={28}
                    />
                  </div>

                  {/* Total Gross Revenue */}
                  <div className="bg-white rounded-3xl border border-[#e8e8ed] p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] block mb-1">
                        Gross Marketplace GMV
                      </span>
                      <div className="text-2xl font-black text-[#1d1d1f] tracking-tight">
                        RM {realTotalRevenue.toFixed(2)}
                      </div>
                      <span className="text-[11px] font-semibold text-[#8e6e7d]">
                        Total Captured
                      </span>
                    </div>
                    <D3StatSparkline
                      data={revenueTrendData.map(d => Number(d.total || 0))}
                      color="#8e6e7d"
                      width={70}
                      height={28}
                    />
                  </div>
                </div>

                {/* D3 Interactive Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Chart: D3 Area Trend */}
                  <div className="lg:col-span-7">
                    <D3AreaTrendChart
                      data={revenueTrendData}
                      xKey="date"
                      yKey="total"
                      title="Campus Revenue Flow"
                      subtitle="Weekly Gross Merchandise Value (GMV)"
                      height={280}
                      color="#1d1d1f"
                    />
                  </div>

                  {/* Right Chart: D3 Donut Breakdown */}
                  <div className="lg:col-span-5">
                    <D3DonutBreakdownChart
                      data={storeDistributionData}
                      labelKey="label"
                      valueKey="value"
                      title="Volume by Store"
                      subtitle="Campus demand distribution"
                      height={280}
                    />
                  </div>
                </div>

                {/* Second Chart Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-12">
                    <D3BarComparisonChart
                      data={ordersVolumeData}
                      xKey="label"
                      yKey="value"
                      title="Daily Orders & Appointments"
                      subtitle="Transaction frequency across all 7 shops"
                      height={240}
                      color="#8e6e7d"
                      unit="orders"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Vendor Applications */}
            {activeTab === 'applications' && (
              <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#e8e8ed] flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#1d1d1f]">
                      Pending Vendor Onboarding Requests
                    </h3>
                    <p className="text-xs text-[#6e6e73]">
                      Review store applications submitted by student entrepreneurs.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-[#f5edf0] text-[#594951] rounded-full border border-[#e6dadf]">
                    {applications.length} Pending
                  </span>
                </div>

                {applications.length === 0 ? (
                  <div className="p-12 text-center text-[#86868b] space-y-2">
                    <CheckCircle size={32} weight="duotone" className="mx-auto text-emerald-500" />
                    <p className="text-xs font-semibold text-[#1d1d1f]">All applications reviewed</p>
                    <p className="text-[11px]">No pending vendor onboarding requests at this time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold border-b border-[#e8e8ed]">
                        <tr>
                          <th className="p-4">Store Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Applicant Contact</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-right">Decision</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0eaed]">
                        {applications.map((app) => (
                          <tr key={app.application_id} className="hover:bg-[#fbfbfd]">
                            <td className="p-4 font-bold text-[#1d1d1f]">{app.business_name}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#f5edf0] text-[#594951] font-semibold text-[10px]">
                                {app.vendor_type}
                              </span>
                            </td>
                            <td className="p-4 text-[#6e6e73]">{app.contact_details || 'Campus'}</td>
                            <td className="p-4 text-[#86868b]">
                              {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleApprove(app.application_id)}
                                className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] active:scale-95 transition-all shadow-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(app.application_id)}
                                className="px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium text-[11px] active:scale-95 transition-all"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Campus Stores Registry */}
            {activeTab === 'stores' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stores.map((store) => (
                    <div
                      key={store.store_id}
                      className="bg-white rounded-3xl border border-[#e8e8ed] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#dfd5da] transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5edf0] text-[#594951]">
                            {store.store_type}
                          </span>
                          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Active</span>
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#1d1d1f]">{store.store_name}</h4>
                        <p className="text-xs text-[#6e6e73] line-clamp-2">{store.description}</p>
                      </div>

                      <div className="pt-3 border-t border-[#f0eaed] space-y-1.5 text-[11px] text-[#86868b]">
                        <div className="flex items-center justify-between">
                          <span>Location:</span>
                          <span className="font-semibold text-[#1d1d1f]">{store.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Working Hours:</span>
                          <span className="font-semibold text-[#1d1d1f]">{store.working_hours}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Phone:</span>
                          <span className="font-semibold text-[#1d1d1f]">{store.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: User Directory */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#1d1d1f]">Platform User Directory</h3>
                    <p className="text-xs text-[#6e6e73]">Manage registered students, vendors, and admins.</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <MagnifyingGlass
                        size={14}
                        weight="bold"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]"
                      />
                      <input
                        type="text"
                        placeholder="Search user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-[#f5f5f7] rounded-full text-xs text-[#1d1d1f] border border-transparent focus:border-[#dfd5da] outline-none"
                      />
                    </div>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-3 py-1.5 bg-[#f5f5f7] rounded-full text-xs font-semibold text-[#1d1d1f] border border-transparent focus:border-[#dfd5da] outline-none cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="customer">Students</option>
                      <option value="vendor">Vendors</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold border-b border-[#e8e8ed]">
                      <tr>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0eaed]">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#fbfbfd]">
                          <td className="p-3.5 font-bold text-[#1d1d1f]">
                            {u.first_name} {u.last_name}
                          </td>
                          <td className="p-3.5 text-[#6e6e73]">{u.email}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.role === 'admin'
                                  ? 'bg-[#1d1d1f] text-white'
                                  : u.role === 'vendor'
                                  ? 'bg-[#f5edf0] text-[#594951]'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{u.status || 'active'}</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded-full hover:bg-rose-50 text-[#86868b] hover:text-rose-600 transition-colors"
                                title="Delete user"
                              >
                                <Trash size={15} weight="duotone" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
