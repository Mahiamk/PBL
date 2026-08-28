import React, { useEffect, useState } from 'react';
import { fetchVendorDashboard } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from '../dashboard/Sidebar';
import TopBar from '../dashboard/TopBar';
import ProductManager from '../../../components/vendor/management/ProductManager';
import ProductNewForm from '../../../components/vendor/management/ProductNewForm';
import CategoryManager from '../../../components/vendor/management/CategoryManager';
import OrderManager from '../../../components/vendor/management/OrderManager';
import CustomerManager from '../../../components/vendor/management/CustomerManager';
import MessageManager from '../../../components/vendor/management/MessageManager';
import StoreBannerManager from '../../../components/vendor/management/StoreBannerManager';
import { useSearchParams } from 'react-router-dom';
import D3AreaTrendChart from '../../../components/charts/D3AreaTrendChart';
import D3DonutBreakdownChart from '../../../components/charts/D3DonutBreakdownChart';
import D3StatSparkline from '../../../components/charts/D3StatSparkline';
import { computeRealRevenueTrend, computeRealVolumeTrend, computeRealProductBreakdown } from '../../../utils/dashboardMetrics';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const ClothesShopDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('vendor_sidebar_collapsed') === 'true');
  const selectedId = searchParams.get('id');

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vendor_sidebar_collapsed', String(next));
      return next;
    });
  };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const tab = searchParams.get('tab');
      if (tab) {
          setActiveTab(tab);
      }
  }, [searchParams]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!data) return null;

  // Process data for charts
  const totalRevenue = data.recent_orders.reduce((acc, order) => acc + order.total_amount, 0);
  const totalOrders = data.recent_orders.length;
  const completedOrders = data.recent_orders.filter(o => o.status === 'Completed').length;
  const cancelledOrders = data.recent_orders.filter(o => o.status === 'Cancelled').length;
  
  // Mock data for the line chart (since we have limited real data)
  const salesData = [
    { name: 'Jul 31', value: 0 },
    { name: 'Aug 31', value: 0 },
    { name: 'Sep 30', value: 0 },
    { name: 'Oct 31', value: 0 },
    { name: 'Nov 30', value: 0 },
    { name: 'Dec 31', value: totalOrders } // Just putting current orders here for visibility
  ];

  // Data for Pie Chart
  const pieData = [
    { name: 'Completed', value: completedOrders || 1, color: '#A7F3D0' }, // Green-200
    { name: 'Pending', value: totalOrders - completedOrders - cancelledOrders, color: '#BAE6FD' }, // Blue-200
    { name: 'Cancelled', value: cancelledOrders, color: '#FECACA' } // Red-200
  ];
  
  // If no orders, show empty pie
  const emptyPieData = [{ name: 'No Orders', value: 1, color: '#E5E7EB' }];
  const activePieData = totalOrders > 0 ? pieData : emptyPieData;

  const renderContent = () => {
    switch(activeTab) {
      case 'products': return <ProductManager />;
      case 'new-product': return <ProductNewForm storeId={data?.store_info?.store_id} onSuccess={() => setActiveTab('products')} onCancel={() => setActiveTab('products')} />;
      case 'categories': return <CategoryManager />;
      case 'orders': return <OrderManager orders={data.recent_orders} onOrderUpdate={() => loadData(true)} selectedId={selectedId} />;
      case 'customers': return <CustomerManager customers={data?.customers || []} />;
      case 'messages': return <MessageManager selectedId={selectedId} />;
      case 'banner':
      case 'store-banner':
        return (
          <StoreBannerManager 
            store={data?.store_info} 
            onBannerUpdated={(updated) => {
              setData(prev => prev ? { ...prev, store_info: { ...prev.store_info, ...updated } } : prev);
            }} 
          />
        );
      default: {
        const realRevenueTrend = computeRealRevenueTrend(data?.recent_orders || [], 7);
        const realVolumeTrend = computeRealVolumeTrend(data?.recent_orders || [], 'order_date', 7);
        const realProductBreakdown = (() => {
          const breakdown = computeRealProductBreakdown(data?.products || []);
          return breakdown.length > 0 ? breakdown : [{ label: 'Apparel Catalog', value: 1 }];
        })();

        return (
          <>
            {/* KPI Sparkline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Merch Orders
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">{totalOrders}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">Apparel & Gear</span>
                </div>
                <D3StatSparkline data={realVolumeTrend.map(d => d.value)} color="#1d1d1f" width={75} height={28} />
              </div>
              
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Merch Revenue
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">RM {totalRevenue.toFixed(2)}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">Total Sales</span>
                </div>
                <D3StatSparkline data={realRevenueTrend.map(d => d.total)} color="#8e6e7d" width={75} height={28} />
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Active Apparel Items
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">
                    {(data?.products || []).length}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-600">In Stock Products</span>
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
                  title="University Apparel Sales"
                  subtitle="7-day merchandise sales volume (RM)"
                  height={280}
                  color="#1d1d1f"
                />
              </div>
              
              <div className="lg:col-span-5">
                <D3DonutBreakdownChart
                  data={realProductBreakdown}
                  labelKey="label"
                  valueKey="value"
                  title="Collection Categories"
                  subtitle="Collegiate apparel distribution"
                  height={280}
                />
              </div>
            </div>

          {/* Product Catalog List */}
          <div className="bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-[#1d1d1f]">Apparel Inventory</h3>
                <p className="text-xs text-[#6e6e73]">Official AIU varsity merchandise & student apparel.</p>
              </div>
              <button onClick={() => setActiveTab('products')} className="text-xs font-semibold text-[#8e6e7d] hover:text-[#1d1d1f]">
                Manage All Products &rarr;
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold border-b border-[#e8e8ed]">
                  <tr>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eaed]">
                  {data.products.slice(0, 5).map((product) => (
                    <tr key={product.product_id} className="hover:bg-[#fbfbfd]">
                      <td className="p-3.5 font-bold text-[#1d1d1f]">{product.product_name}</td>
                      <td className="p-3.5 text-[#6e6e73]">RM {Number(product.product_price).toFixed(2)}</td>
                      <td className="p-3.5 text-[#1d1d1f] font-semibold">{product.stock_quantity || 30} in stock</td>
                      <td className="p-3.5 text-right">
                        <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>In Stock</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default ClothesShopDashboard;
