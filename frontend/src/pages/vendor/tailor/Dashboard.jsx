import React, { useEffect, useState } from 'react';
import { fetchVendorDashboard } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from '../dashboard/TopBar';
import { useSearchParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ProductManager from '../../../components/vendor/management/ProductManager';
import ProductNewForm from '../../../components/vendor/management/ProductNewForm';
import ServiceForm from './service-tailor/Service'; // Import ServiceForm
import ServiceManager from './service-tailor/ServiceManager';
import CategoryManager from '../../../components/vendor/management/CategoryManager';
import AttributeManager from '../../../components/vendor/management/AttributeManager';
import CollectionManager from '../../../components/vendor/management/CollectionManager';
import FeaturedProductManager from '../../../components/vendor/management/FeaturedProductManager';
import OrderManager from '../../../components/vendor/management/OrderManager';
import CustomerManager from '../../../components/vendor/management/CustomerManager';
import MessageManager from '../../../components/vendor/management/MessageManager';
import AppointmentManager from './AppointmentManager';
import { Package, Scissors } from 'lucide-react';
import D3AreaTrendChart from '../../../components/charts/D3AreaTrendChart';
import D3DonutBreakdownChart from '../../../components/charts/D3DonutBreakdownChart';
import D3StatSparkline from '../../../components/charts/D3StatSparkline';
import { computeRealRevenueTrend, computeRealVolumeTrend, computeRealProductBreakdown } from '../../../utils/dashboardMetrics';

const TailorDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('vendor_sidebar_collapsed') === 'true');
  const [data, setData] = useState(null);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vendor_sidebar_collapsed', String(next));
      return next;
    });
  };
  const selectedId = searchParams.get('id');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
        setActiveTab(tab);
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [creationType, setCreationType] = useState(null); // 'product' or 'service'

  const loadData = (isRefresh = false) => {
    if (user && user.userId) {
      if (!isRefresh) setLoading(true);
      fetchVendorDashboard(user.userId)
        .then(setData)
        .catch(console.error)
        .finally(() => {
          if (!isRefresh) setLoading(false);
        });
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Reset creation type when tab changes
  useEffect(() => {
    if (activeTab !== 'new-product') {
      setCreationType(null);
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!data) return null;

  // Process data for charts
  const totalRevenue = data.recent_orders.reduce((acc, order) => acc + order.total_amount, 0);
  const totalOrders = data.recent_orders.length;
  const completedOrders = data.recent_orders.filter(o => o.status === 'Completed').length;
  const cancelledOrders = data.recent_orders.filter(o => o.status === 'Cancelled').length;
  
  const salesData = [
    { name: 'Jul', value: 0 },
    { name: 'Aug', value: 0 },
    { name: 'Sep', value: 0 },
    { name: 'Oct', value: 0 },
    { name: 'Nov', value: 0 },
    { name: 'Dec', value: totalOrders }
  ];

  const pieData = [
    { name: 'Completed', value: completedOrders || 1, color: '#A7F3D0' },
    { name: 'Pending', value: totalOrders - completedOrders - cancelledOrders, color: '#BAE6FD' },
    { name: 'Cancelled', value: cancelledOrders, color: '#FECACA' }
  ];
  
  const activePieData = totalOrders > 0 ? pieData : [{ name: 'No Orders', value: 1, color: '#E5E7EB' }];

  const renderContent = () => {
    switch(activeTab) {
      case 'products': return <ProductManager />;
      case 'services': return <ServiceManager />;
      case 'new-product': 
        if (!creationType) {
          return (
            <div className="max-w-4xl mx-auto mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What would you like to add?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setCreationType('product')}
                  className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Package className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Add Product</h3>
                  <p className="text-gray-500 text-center">Add physical items like fabrics, suits, or accessories to your inventory.</p>
                </button>

                <button 
                  onClick={() => setCreationType('service')}
                  className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <Scissors className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Add Service</h3>
                  <p className="text-gray-500 text-center">Add services like alterations, hemming, or custom tailoring.</p>
                </button>
              </div>
            </div>
          );
        }
        if (creationType === 'product') {
          return <ProductNewForm storeId={data?.store_info?.store_id} onSuccess={() => setActiveTab('products')} onCancel={() => setCreationType(null)} />;
        }
        if (creationType === 'service') {
          return <ServiceForm storeId={data?.store_info?.store_id} onSuccess={() => setActiveTab('products')} onCancel={() => setCreationType(null)} />;
        }
        return null;

      case 'categories': return <CategoryManager />;
      case 'attributes': return <AttributeManager />;
      case 'collections': return <CollectionManager />;
      case 'featured': return <FeaturedProductManager />;
      case 'orders': return (
        <OrderManager 
          vendorId={user.userId} 
          orders={data?.recent_orders || []}
          onOrderUpdate={() => loadData(true)}
          selectedId={selectedId}
        />
      );
      case 'customers': return <CustomerManager customers={data?.customers || []} />;
      case 'messages': return <MessageManager selectedId={selectedId} />;
      case 'appointments': return <AppointmentManager storeId={data?.store_info?.store_id} selectedId={selectedId} />;
      case 'measurements': return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Customer Measurements</h2>
          <p className="text-gray-500">Select a customer to view or update their measurements.</p>
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 text-center text-gray-400">
            Measurement module coming soon
          </div>
        </div>
      );
      case 'dashboard':
      default: {
        const realRevenueTrend = computeRealRevenueTrend(data?.recent_orders || [], 7);
        const realVolumeTrend = computeRealVolumeTrend(data?.recent_orders || [], 'order_date', 7);
        const realProductBreakdown = (() => {
          const breakdown = computeRealProductBreakdown(data?.products || []);
          return breakdown.length > 0 ? breakdown : [{ label: 'Tailoring Services', value: 1 }];
        })();

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Active Jobs & Orders
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">{totalOrders}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">Garments in Progress</span>
                </div>
                <D3StatSparkline data={realVolumeTrend.map(d => d.value)} color="#1d1d1f" width={75} height={28} />
              </div>
              
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Tailoring Revenue
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">RM {totalRevenue.toFixed(2)}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">Total Captured</span>
                </div>
                <D3StatSparkline data={realRevenueTrend.map(d => d.total)} color="#8e6e7d" width={75} height={28} />
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Active Catalog & Services
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">
                    {(data?.products || []).length}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-600">Services & Fabrics</span>
                </div>
                <D3StatSparkline data={[0, 0, 0, 0, 0, 0, (data?.products || []).length]} color="#594951" width={75} height={28} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <D3AreaTrendChart
                  data={realRevenueTrend}
                  xKey="date"
                  yKey="total"
                  title="Garment Production Volume"
                  subtitle="7-day alterations & fittings revenue (RM)"
                  height={280}
                  color="#8e6e7d"
                />
              </div>
              
              <div className="lg:col-span-5">
                <D3DonutBreakdownChart
                  data={realProductBreakdown}
                  labelKey="label"
                  valueKey="value"
                  title="Job & Service Categories"
                  subtitle="Active tailoring catalog breakdown"
                  height={280}
                />
              </div>
            </div>
        </>
      );
    }
  };
};

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        shopName={data?.store_info?.store_name}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      
      <div className={`flex-1 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} flex flex-col transition-all duration-300 relative h-full`}>
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-200">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TailorDashboard;
