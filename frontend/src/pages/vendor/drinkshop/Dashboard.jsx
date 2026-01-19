import React, { useEffect, useState } from 'react';
import { fetchVendorDashboard } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from '../dashboard/Sidebar';
import TopBar from '../dashboard/TopBar';
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

const DrinkShopDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const selectedId = searchParams.get('id');

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
  const completedOrders = data.recent_orders.filter(o => String(o.status).toLowerCase() === 'completed' || String(o.status) === '1').length;
  const cancelledOrders = data.recent_orders.filter(o => String(o.status).toLowerCase() === 'cancelled' || String(o.status) === '-1').length;
  
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
      default: return (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Drink Shop Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sale Statistics Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Sale Statistics</h2>
                <div className="flex space-x-4 text-sm text-blue-500">
                  <button className="hover:text-blue-700">Daily</button>
                  <button className="hover:text-blue-700">Weekly</button>
                  <button className="hover:text-blue-700">Monthly</button>
                </div>
              </div>
              
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
            
            {/* Lifetime Sales */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Lifetime Sales</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                  <span className="text-gray-600 text-sm">{totalOrders} orders</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                  <span className="text-gray-600 text-sm">${totalRevenue.toFixed(2)} lifetime sale</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-200"></div>
                  <span className="text-gray-600 text-sm">{(completedOrders / (totalOrders || 1) * 100).toFixed(0)}% of orders completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-200"></div>
                  <span className="text-gray-600 text-sm">{(cancelledOrders / (totalOrders || 1) * 100).toFixed(0)}% of orders cancelled</span>
                </div>
              </div>
              
              <div className="h-64 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {activePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Labels on sides like in image */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-blue-300 font-bold ml-4">100</div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-red-300 font-bold mr-4">0</div>
              </div>
            </div>
          </div>
          
          {/* Best Sellers Section */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Best Sellers</h2>
              <button className="text-sm text-blue-500 hover:text-blue-700">All products</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product Name</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                    <th className="px-6 py-3 font-medium">Sold</th>
                    <th className="px-6 py-3 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.products.slice(0, 5).map((product) => (
                    <tr key={product.product_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.product_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">${product.product_price}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">0</td> {/* Mock sold count */}
                      <td className="px-6 py-4 text-sm text-gray-900">$0.00</td>
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
      />
      
      <div className="flex-1 md:ml-72 flex flex-col transition-all duration-300 relative h-full">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-200">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Existing dashboard content for charts and stats */}
            </div>
          )}

          {activeTab === 'add-product' && (
            <div className="bg-white rounded-lg shadow p-6">
              {/* Product addition form or component */}
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DrinkShopDashboard;
