import React, { useEffect, useState } from 'react';
import { fetchVendorDashboard, fetchStoreAppointments } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from './Sidebar'; 
import TopBar from '../dashboard/TopBar';
import { useSearchParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import CustomerManager from '../../../components/vendor/management/CustomerManager';
import MessageManager from '../../../components/vendor/management/MessageManager';
import AppointmentManager from '../tailor/AppointmentManager'; 
import ServiceManager from '../../../components/vendor/management/ServiceManager';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';

// Translation Dictionary
const translations = {
    en: {
        dashboardTitle: "Barber Dashboard",
        totalAppointments: "Total Appointments",
        estimatedIncome: "Estimated Income",
        newCustomers: "New Customers",
        growthOverview: "Growth Overview",
        recentCustomers: "Recent Customers",
        viewAll: "View All",
        myCustomers: "My Customers",
        customer: "Customer",
        date: "Date"
    },
    my: {
        dashboardTitle: "Papan Pemuka Tukang Gunting Rambut",
        totalAppointments: "Jumlah Temujanji",
        estimatedIncome: "Anggaran Pendapatan",
        newCustomers: "Pelanggan Baru",
        growthOverview: "Gambaran Keseluruhan Pertumbuhan",
        recentCustomers: "Pelanggan Terkini",
        viewAll: "Lihat Semua",
        myCustomers: "Pelanggan Saya",
        customer: "Pelanggan",
        date: "Tarikh"
    }
};

const BarberDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem('language') || 'en');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
      const tab = searchParams.get('tab');
      if (tab) {
          setActiveTab(tab);
      }
  }, [searchParams]);

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = translations[lang] || translations.en;

  const loadData = async (isRefresh = false) => {
    if (user && user.userId) {
      if (!isRefresh) setLoading(true);
      try {
        const dashboardData = await fetchVendorDashboard(user.userId);
        setData(dashboardData);
        
        if (dashboardData.store_info?.store_id) {
          const appointmentData = await fetchStoreAppointments(dashboardData.store_info.store_id);
          
          let allAppointments = [...appointmentData];
          
          if (dashboardData.store_info.store_id !== 2) {
             try {
                 const demoAppointments = await fetchStoreAppointments(2);
                 allAppointments = [...allAppointments, ...demoAppointments];
             } catch (e) {
                 console.log("Could not fetch demo store appointments");
             }
          }
          
          const uniqueAppointments = Array.from(
              new Map(allAppointments.map(item => [item.appointment_id, item])).values()
          );
          
          setAppointments(uniqueAppointments);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  // Filter Logic
  const filteredAppointments = appointments.filter(appt => 
      appt.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (appt.service_name && appt.service_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Extract unique customers
  const uniqueCustomersMap = new Map();
  filteredAppointments.forEach(appt => {
    if (!uniqueCustomersMap.has(appt.customer_id)) {
        uniqueCustomersMap.set(appt.customer_id, {
            customer_id: appt.customer_id || Math.random(),
            customer_name: appt.customer_name,
            status: 'Active',
            created_at: appt.booking_date
        });
    }
  });
  const recentCustomers = Array.from(uniqueCustomersMap.values());
  const allCustomers = data.customers ? data.customers.filter(c => c.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  // Chart data usually based on all appointments, not filtered one unless specified
  // Keeping chart global
  const appointmentsByDate = appointments.reduce((acc, appt) => {
    const date = new Date(appt.booking_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(appointmentsByDate).map(date => ({
    name: date,
    appointments: appointmentsByDate[date],
    income: appointmentsByDate[date] * 25 
  })).sort((a,b) => new Date(a.name) - new Date(b.name));
  
  if (chartData.length === 0) {
    const today = new Date();
    for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        chartData.push({
            name: d.toLocaleDateString(),
            appointments: 0,
            income: 0
        });
    }
  }

  const totalAppointments = appointments.length;
  const estimatedIncome = totalAppointments * 30;

  const selectedId = searchParams.get('id');

  const renderContent = () => {
    switch(activeTab) {
      case 'appointments': 
        return <AppointmentManager storeId={data?.store_info?.store_id} appointments={filteredAppointments} selectedId={selectedId} />;
      
      case 'services': 
        return <ServiceManager storeId={data?.store_info?.store_id} />;

      case 'customers':  
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t.myCustomers}</h2>
            <CustomerManager customers={recentCustomers.length > 0 ? recentCustomers : allCustomers} />
          </div>
        );
      
      case 'messages': 
        return <MessageManager selectedId={selectedId} />;
      
      default: return (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">{t.dashboardTitle}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="p-4 bg-blue-50 rounded-full mr-4">
                    <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">{t.totalAppointments}</h3>
                    <p className="text-3xl font-bold text-gray-900">{totalAppointments}</p>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="p-4 bg-green-50 rounded-full mr-4">
                    <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">{t.estimatedIncome}</h3>
                    <p className="text-3xl font-bold text-gray-900">${estimatedIncome}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="p-4 bg-purple-50 rounded-full mr-4">
                    <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">{t.newCustomers}</h3>
                    <p className="text-3xl font-bold text-gray-900">{recentCustomers.length}</p>
                </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500" />
                    {t.growthOverview}
                </h2>
              </div>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="appointments" name={t.totalAppointments} stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="income" name={t.estimatedIncome} stroke="#10B981" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">{t.recentCustomers}</h2>
                <button onClick={() => setActiveTab('customers')} className="text-sm text-blue-500 hover:text-blue-700 font-medium">{t.viewAll}</button>
              </div>
              
              <div className="overflow-y-auto flex-1 pr-2">
                {recentCustomers.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{t.customer}</th>
                                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{t.date}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentCustomers.map((cust, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3">
                                                {cust.customer_name ? cust.customer_name[0].toUpperCase() : 'U'}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{cust.customer_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(cust.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Users size={48} className="mb-2 opacity-20" />
                        <p>No customers yet</p>
                    </div>
                )}
              </div>
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
        <TopBar 
            onMenuClick={() => setIsSidebarOpen(true)}
            language={lang}
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

export default BarberDashboard;
