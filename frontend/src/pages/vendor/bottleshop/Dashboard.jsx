import React, { useEffect, useState, useCallback } from 'react';
import { fetchVendorDashboard } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from './Sidebar'; // Correct: Uses the local, dedicated Sidebar
import TopBar from '../dashboard/TopBar'; // This file must be fixed as shown above!
import { useSearchParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ProductManager from '../../../components/vendor/management/ProductManager';
import ProductNewForm from '../../../components/vendor/management/ProductNewForm';
import CategoryManager from '../../../components/vendor/management/CategoryManager';
import AttributeManager from '../../../components/vendor/management/AttributeManager';
import CollectionManager from '../../../components/vendor/management/CollectionManager';
import FeaturedProductManager from '../../../components/vendor/management/FeaturedProductManager';
import OrderManager from '../../../components/vendor/management/OrderManager';
import CustomerManager from '../../../components/vendor/management/CustomerManager';
import MessageManager from '../../../components/vendor/management/MessageManager';

const BottleShopDashboard = ({ initialData }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
        setActiveTab(tab);
    }
  }, [searchParams]);

  const selectedId = searchParams.get('id');
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

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
  
  const completedOrders = data.recent_orders ? data.recent_orders.filter(o => String(o.status).toLowerCase() === 'completed' || String(o.status) === '1').length : 0;
  const cancelledOrders = data.recent_orders ? data.recent_orders.filter(o => String(o.status).toLowerCase() === 'cancelled' || String(o.status) === '-1').length : 0;
  
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
      case 'orders': return <OrderManager orders={data.recent_orders} onOrderUpdate={handleRefresh} selectedId={selectedId} />; 
      case 'customers': return <CustomerManager customers={data?.customers || []} />;
      case 'messages': return <MessageManager selectedId={selectedId} />;
      default: return (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">{t.dashboard}</h1>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">{t.salesStats}</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">{t.lifetimeSales}</h2>
              <div className="h-64 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={activePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value" stroke="none">
                      {activePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-900">${totalRevenue}</span>
                  <span className="text-sm text-gray-500 uppercase tracking-wider mt-1">{t.lifetime}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen md:ml-64 transition-all duration-300">
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          language={language}
          onLanguageChange={handleLanguageChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="flex-1 overflow-auto p-4 sm:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
export default BottleShopDashboard;
