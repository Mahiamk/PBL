import React, { useEffect, useState } from 'react';
import { fetchVendorDashboard, fetchStoreAppointments, fetchServices } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from '../dashboard/TopBar';
import { useSearchParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ServiceManager from '../../../components/vendor/management/ServiceManager';
import AppointmentManager from '../tailor/AppointmentManager';
import CustomerManager from '../../../components/vendor/management/CustomerManager';
import MessageManager from '../../../components/vendor/management/MessageManager';
import CategoryManager from '../../../components/vendor/management/CategoryManager';

const MassageDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [servicesCount, setServicesCount] = useState(0);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
        setActiveTab(tab);
    }
  }, [searchParams]);

  const loadData = (isRefresh = false) => {
    if (user && user.userId) {
      if (!isRefresh) setLoading(true);
      Promise.all([
        fetchVendorDashboard(user.userId),
        fetchStoreAppointments(user.storeId),
        fetchServices(user.storeId)
      ])
        .then(([dashboardData, appointmentsData, servicesData]) => {
            setData(dashboardData);
            setAppointments(appointmentsData);
            setServicesCount(servicesData.length);
        })
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        shopName="Massage Service"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-72 transition-all duration-300">
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          user={user}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                  title="Total Appointments" 
                  value={appointments?.length || 0} 
                  trend="+12% from last month"
                  icon="calendar"
                />
                <DashboardCard 
                  title="Active Services" 
                  value={servicesCount || 0} 
                  trend=""
                  icon="sparkles"
                />
                <DashboardCard 
                  title="New Customers" 
                  value={data?.new_customers || 0} 
                  trend="+5% from last week"
                  icon="users"
                />
                <DashboardCard 
                  title="Revenue" 
                  value={`RM ${data?.revenue || 0}`} 
                  trend="+18% from last month"
                  icon="dollar"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Overview</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.sales_data || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `RM${value}`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`RM ${value}`, 'Revenue']}
                        />
                        <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h3>
                   <div className="grid grid-cols-1 gap-4">
                      <button onClick={() => setActiveTab('appointments')} className="p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between group transition-all">
                        <span className="font-medium text-gray-700">View Upcoming Appointments</span>
                        <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                      <button onClick={() => setActiveTab('services')} className="p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between group transition-all">
                         <span className="font-medium text-gray-700">Manage Services</span>
                         <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'services' || activeTab === 'new-service') && <ServiceManager storeId={user.storeId} />}
          {activeTab === 'appointments' && <AppointmentManager storeId={user.storeId} />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'messages' && <MessageManager />}
          {activeTab === 'settings' && (
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold mb-4">Settings</h2>
                  <p className="text-gray-500">Settings panel coming soon...</p>
              </div>
          )}
        </main>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, trend, icon }) => {
    const icons = {
        calendar: <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        sparkles: <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" /></svg>,
        users: <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        dollar: <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                    {icons[icon]}
                </div>
                {/* <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span> */}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    );
};

export default MassageDashboard;
