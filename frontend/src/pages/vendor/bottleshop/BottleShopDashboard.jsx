import React, { useEffect, useState, useCallback } from 'react';
import { fetchVendorDashboard } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from './Sidebar'; // Uses the dedicated BottleShop Sidebar
import TopBar from '../dashboard/TopBar';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ProductManager from '../../../components/vendor/management/ProductManager';
import ProductNewForm from '../../../pages/vendor/bottleshop/ProductNewForm';
import CategoryManager from '../../../components/vendor/management/CategoryManager';
import AttributeManager from '../../../components/vendor/management/AttributeManager';
import CollectionManager from '../../../components/vendor/management/CollectionManager';
import FeaturedProductManager from '../../../components/vendor/management/FeaturedProductManager';
import OrderManager from '../../../components/vendor/management/OrderManager';
import CustomerManager from '../../../components/vendor/management/CustomerManager';
import MessageManager from '../../../components/vendor/management/MessageManager';
import D3AreaTrendChart from '../../../components/charts/D3AreaTrendChart';
import D3DonutBreakdownChart from '../../../components/charts/D3DonutBreakdownChart';
import D3StatSparkline from '../../../components/charts/D3StatSparkline';
import { computeRealRevenueTrend, computeRealVolumeTrend, computeRealProductBreakdown } from '../../../utils/dashboardMetrics';

const BottleShopDashboard = ({ initialData }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('vendor_sidebar_collapsed') === 'true');

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vendor_sidebar_collapsed', String(next));
      return next;
    });
  };
  
  // Initialize with prop
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  // TopBar State
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('vendorLanguage') || 'en');

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('vendorLanguage', lang);
  };

  const translations = {
    en: {
      dashboard: 'Bottle Shop Dashboard',
      salesStats: 'Sale Statistics',
      lifetimeSales: 'Lifetime Sales',
      bestSellers: 'Best Sellers',
      allProducts: 'All products',
      orders: 'orders',
      completed: 'of orders completed',
      cancelled: 'of orders cancelled',
      lifetime: 'lifetime sale'
    },
    my: {
      dashboard: 'Dashboard Kedai Botol',
      salesStats: 'Statistik Jualan',
      lifetimeSales: 'Jualan Seumur Hidup',
      bestSellers: 'Produk Laris',
      allProducts: 'Semua Produk',
      orders: 'pesanan',
      completed: 'pesanan selesai',
      cancelled: 'pesanan dibatalkan',
      lifetime: 'jualan seumur hidup'
    }
  };

  const t = translations[language];

  // Manual refresh function - Memoized to prevent loops
  const handleRefresh = useCallback(() => {
    if (user && user.userId) {
      fetchVendorDashboard(user.userId)
        .then(setData)
        .catch(console.error);
      // Note: We don't set loading=true to prevent UI flickering on refresh
    }
  }, [user]);

  // Sync props to state if they change (e.g. parent updates)
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  // Initial Fetch Effect - ONLY if no initialData provided (Fallback)
  useEffect(() => {
    if (!initialData && !data && user) {
      fetchVendorDashboard(user.userId)
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, []); // Empty dependency array ensures this runs exactly ONCE

  if (loading && !data) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (!data) return null;

  // Process data for charts
  const totalRevenue = data.recent_orders ? data.recent_orders.reduce((acc, order) => acc + order.total_amount, 0) : 0;
  const totalOrders = data.recent_orders ? data.recent_orders.length : 0;
  
  const salesData = [
    { name: 'Total', value: totalOrders }
  ];
  
  const completedOrders = data.recent_orders ? data.recent_orders.filter(o => o.status === 'Completed').length : 0;
  const cancelledOrders = data.recent_orders ? data.recent_orders.filter(o => o.status === 'Cancelled').length : 0;
  
  const pieData = [
    { name: 'Completed', value: completedOrders || 1, color: '#A7F3D0' },
    { name: 'Pending', value: totalOrders - completedOrders - cancelledOrders, color: '#BAE6FD' },
    { name: 'Cancelled', value: cancelledOrders, color: '#FECACA' }
  ];
  const activePieData = totalOrders > 0 ? pieData : [{ name: 'No Orders', value: 1, color: '#E5E7EB' }];

  const renderContent = () => {
    switch(activeTab) {
      case 'products': return <ProductManager />;
      case 'new-product': return <ProductNewForm storeId={data?.store_info?.store_id} onSuccess={() => setActiveTab('products')} onCancel={() => setActiveTab('products')} />;
      case 'categories': return <CategoryManager />;
      case 'attributes': return <AttributeManager />;
      case 'collections': return <CollectionManager />;
      case 'featured': return <FeaturedProductManager />;
      // Pass handleRefresh so order updates refresh the stats
      case 'orders': return <OrderManager orders={data.recent_orders} onOrderUpdate={handleRefresh} />; 
      case 'customers': return <CustomerManager customers={data?.customers || []} />;
      case 'messages': return <MessageManager />;
      default: {
        const realRevenueTrend = computeRealRevenueTrend(data?.recent_orders || [], 7);
        const realVolumeTrend = computeRealVolumeTrend(data?.recent_orders || [], 'order_date', 7);
        const realProductBreakdown = (() => {
          const breakdown = computeRealProductBreakdown(data?.products || []);
          return breakdown.length > 0 ? breakdown : [{ label: 'Drinkware Catalog', value: 1 }];
        })();

        return (
          <>
            {/* KPI Sparkline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Flask & Bottle Sales
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">{totalOrders}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">Drinkware Sold</span>
                </div>
                <D3StatSparkline data={realVolumeTrend.map(d => d.value)} color="#1d1d1f" width={75} height={28} />
              </div>
              
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Total Revenue
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">RM {totalRevenue.toFixed(2)}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">Total Captured</span>
                </div>
                <D3StatSparkline data={realRevenueTrend.map(d => d.total)} color="#8e6e7d" width={75} height={28} />
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Active Catalog Items
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">
                    {(data?.products || []).length}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-600">Flasks & Tumblers</span>
                </div>
                <D3StatSparkline data={[0, 0, 0, 0, 0, 0, (data?.products || []).length]} color="#594951" width={75} height={28} />
              </div>
            </div>

            {/* D3 Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <div className="lg:col-span-7">
                <D3AreaTrendChart
                  data={realRevenueTrend}
                  xKey="date"
                  yKey="total"
                  title="Drinkware Demand Stream"
                  subtitle="7-day sales breakdown (RM)"
                  height={280}
                  color="#1d1d1f"
                />
              </div>
              
              <div className="lg:col-span-5">
                <D3DonutBreakdownChart
                  data={realProductBreakdown}
                  labelKey="label"
                  valueKey="value"
                  title="Flask & Bottle Taxonomy"
                  subtitle="Product models & sizes"
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

      <div className={`flex-1 flex flex-col h-full ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} transition-all duration-300 relative`}>
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          language={language}
          onLanguageChange={handleLanguageChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-200">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
export default BottleShopDashboard;
