import React, { useEffect, useState } from 'react';
import { fetchVendorDashboard, fetchStoreAppointments, getImageUrl } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from './Sidebar'; 
import TopBar from '../dashboard/TopBar';
import { useSearchParams } from 'react-router-dom';
import CustomerManager from '../../../components/vendor/management/CustomerManager';
import MessageManager from '../../../components/vendor/management/MessageManager';
import AppointmentManager from '../tailor/AppointmentManager';
import ServiceManager from '../../../components/vendor/management/ServiceManager';
import D3AreaTrendChart from '../../../components/charts/D3AreaTrendChart';
import D3BarComparisonChart from '../../../components/charts/D3BarComparisonChart';
import D3StatSparkline from '../../../components/charts/D3StatSparkline';
import { computeRealRevenueTrend, computeRealVolumeTrend } from '../../../utils/dashboardMetrics';
import { 
  Scissors, 
  CalendarCheck, 
  Users, 
  Clock, 
  CheckCircle, 
  Star, 
  TrendUp,
  Sparkle,
  Plus
} from '@phosphor-icons/react';

// Translation Dictionary
const translations = {
  en: {
    dashboardTitle: "Barber & Grooming Studio",
    subtitle: "Real-time haircut schedule, client bookings & styling revenue",
    totalAppointments: "Total Haircuts",
    studioRevenue: "Studio Revenue",
    activeClients: "Active Clients",
    todayAppointments: "Today's Schedule",
    growthOverview: "Haircut Revenue Growth",
    recentAppointments: "Recent Barber Bookings",
    viewAll: "View All",
    clientName: "Client",
    serviceBooked: "Styling Service",
    dateTime: "Schedule Time",
    status: "Status",
    myCustomers: "Grooming Client Directory",
    noAppointments: "No haircut appointments found.",
    bookAppointment: "Manage Haircuts",
    addService: "Add Styling Cut"
  },
  my: {
    dashboardTitle: "Studio Gunting Rambut & Dandanan",
    subtitle: "Jadual gunting rambut, tempahan pelanggan & hasil studio",
    totalAppointments: "Jumlah Guntingan",
    studioRevenue: "Hasil Studio",
    activeClients: "Pelanggan Aktif",
    todayAppointments: "Jadual Hari Ini",
    growthOverview: "Pertumbuhan Hasil Guntingan",
    recentAppointments: "Tempahan Terkini",
    viewAll: "Lihat Semua",
    clientName: "Pelanggan",
    serviceBooked: "Perkhidmatan Guntingan",
    dateTime: "Masa Jadual",
    status: "Status",
    myCustomers: "Direktori Pelanggan",
    noAppointments: "Tiada temujanji gunting rambut ditemui.",
    bookAppointment: "Urus Guntingan",
    addService: "Tambah Servis"
  }
};

const BarberDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('vendor_sidebar_collapsed') === 'true');

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vendor_sidebar_collapsed', String(next));
      return next;
    });
  };

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
        
        const storeId = dashboardData?.store_info?.store_id || 2;
        const appointmentData = await fetchStoreAppointments(storeId);
        
        let allAppointments = Array.isArray(appointmentData) ? [...appointmentData] : [];
        
        // Also ensure demo store data if store_id differs
        if (storeId !== 2) {
          try {
            const demoAppointments = await fetchStoreAppointments(2);
            if (Array.isArray(demoAppointments)) {
              allAppointments = [...allAppointments, ...demoAppointments];
            }
          } catch (e) {
            console.log("Could not fetch demo store appointments");
          }
        }
        
        const uniqueAppointments = Array.from(
          new Map(allAppointments.map(item => [item.appointment_id, item])).values()
        );
        
        setAppointments(uniqueAppointments);
      } catch (error) {
        console.error("Failed to load barber dashboard data", error);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfd]">
        <div className="w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center shadow-md animate-pulse mb-3">
          <Scissors size={24} weight="duotone" />
        </div>
        <p className="text-xs font-semibold text-[#86868b]">Loading AIU Barber Studio...</p>
      </div>
    );
  }

  // Filter Logic
  const filteredAppointments = appointments.filter(appt => 
    (appt.customer_name && appt.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (appt.service_name && appt.service_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Extract unique customers
  const uniqueCustomersMap = new Map();
  filteredAppointments.forEach(appt => {
    if (appt.customer_id && !uniqueCustomersMap.has(appt.customer_id)) {
      uniqueCustomersMap.set(appt.customer_id, {
        customer_id: appt.customer_id,
        customer_name: appt.customer_name || 'Client',
        status: 'Active',
        created_at: appt.booking_date
      });
    }
  });

  const recentCustomers = Array.from(uniqueCustomersMap.values());
  const realVolumeTrend = computeRealVolumeTrend(appointments, 'booking_date', 7);
  const realRevenueTrend = computeRealRevenueTrend(data?.recent_orders || [], 7);
  
  const realIncomeVal = data?.recent_orders && data.recent_orders.length > 0
    ? data.recent_orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
    : appointments.reduce((sum, a) => sum + Number(a.service_price || 15), 0);

  const totalAppointments = appointments.length;
  const allCustomers = data?.customers 
    ? data.customers.filter(c => c.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) 
    : [];

  const selectedId = searchParams.get('id');

  // Today's appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsList = appointments.filter(a => a.booking_date && a.booking_date.startsWith(todayStr));

  const renderContent = () => {
    switch(activeTab) {
      case 'appointments': 
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-[#e8e8ed]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block">
                  Studio Calendar
                </span>
                <h2 className="text-lg font-bold text-[#1d1d1f]">Haircut & Grooming Bookings</h2>
                <p className="text-xs text-[#6e6e73]">Manage chair reservations, confirmed cuts, and master barber schedules.</p>
              </div>
            </div>
            <AppointmentManager 
              storeId={data?.store_info?.store_id || 2} 
              appointments={filteredAppointments} 
              selectedId={selectedId} 
            />
          </div>
        );
      
      case 'services': 
        return (
          <div className="space-y-6">
            <ServiceManager storeId={data?.store_info?.store_id || 2} />
          </div>
        );

      case 'customers':  
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-[#e8e8ed]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block">
                  Client Database
                </span>
                <h2 className="text-lg font-bold text-[#1d1d1f]">{t.myCustomers}</h2>
                <p className="text-xs text-[#6e6e73]">View recurring student & campus staff grooming profiles.</p>
              </div>
            </div>
            <CustomerManager customers={recentCustomers.length > 0 ? recentCustomers : allCustomers} />
          </div>
        );
      
      case 'messages': 
        return <MessageManager selectedId={selectedId} />;
      
      default: return (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1d1d1f] to-[#333336] p-6 sm:p-7 rounded-3xl text-white shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-semibold text-emerald-400 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Barber Shop Open • Walk-ins & Bookings Active</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t.dashboardTitle}</h1>
              <p className="text-xs text-white/70 mt-1 max-w-lg">{t.subtitle}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button 
                onClick={() => setActiveTab('services')}
                className="px-4 py-2.5 bg-white text-[#1d1d1f] hover:bg-[#f5f5f7] text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center space-x-1.5"
              >
                <Plus size={15} weight="bold" />
                <span>{t.addService}</span>
              </button>
              <button 
                onClick={() => setActiveTab('appointments')}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition-all backdrop-blur-md flex items-center space-x-1.5"
              >
                <CalendarCheck size={16} weight="duotone" />
                <span>{t.bookAppointment}</span>
              </button>
            </div>
          </div>
          
          {/* Metrics Sparkline Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Haircuts */}
            <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
              <div>
                <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-wider block mb-1">
                  {t.totalAppointments}
                </span>
                <p className="text-2xl font-black text-[#1d1d1f]">{totalAppointments}</p>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                  <CheckCircle size={12} weight="fill" />
                  <span>Total Sessions</span>
                </span>
              </div>
              <D3StatSparkline data={realVolumeTrend.map(d => d.value)} color="#1d1d1f" width={70} height={26} />
            </div>
            
            {/* Revenue */}
            <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
              <div>
                <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-wider block mb-1">
                  {t.studioRevenue}
                </span>
                <p className="text-2xl font-black text-[#1d1d1f]">RM {realIncomeVal.toFixed(2)}</p>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                  <TrendUp size={12} weight="bold" />
                  <span>Captured Value</span>
                </span>
              </div>
              <D3StatSparkline data={realRevenueTrend.map(d => d.total)} color="#8e6e7d" width={70} height={26} />
            </div>

            {/* Active Clients */}
            <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
              <div>
                <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-wider block mb-1">
                  {t.activeClients}
                </span>
                <p className="text-2xl font-black text-[#1d1d1f]">{recentCustomers.length || allCustomers.length}</p>
                <span className="text-[11px] font-bold text-[#8e6e7d] flex items-center space-x-1 mt-0.5">
                  <Users size={12} weight="fill" />
                  <span>Campus Students</span>
                </span>
              </div>
              <D3StatSparkline data={[2, 4, 3, 6, 5, 8, recentCustomers.length || 5]} color="#594951" width={70} height={26} />
            </div>

            {/* Today's Schedule */}
            <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
              <div>
                <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-wider block mb-1">
                  {t.todayAppointments}
                </span>
                <p className="text-2xl font-black text-[#1d1d1f]">{todayAppointmentsList.length}</p>
                <span className="text-[11px] font-bold text-blue-600 flex items-center space-x-1 mt-0.5">
                  <Clock size={12} weight="bold" />
                  <span>Slots Today</span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#f5edf0] text-[#8e6e7d] flex items-center justify-center">
                <Scissors size={20} weight="duotone" />
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <D3AreaTrendChart
                data={realRevenueTrend}
                xKey="date"
                yKey="total"
                title={t.growthOverview}
                subtitle="7-day studio haircut revenue stream (RM)"
                height={280}
                color="#8e6e7d"
              />
            </div>

            <div className="lg:col-span-5">
              <D3BarComparisonChart
                data={realVolumeTrend}
                xKey="label"
                yKey="value"
                title="Appointments Flow"
                subtitle="Daily haircuts & beard grooming sessions"
                height={280}
                color="#1d1d1f"
                unit="cuts"
              />
            </div>
          </div>

          {/* Master Stylists & Recent Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Master Barbers Card */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-xs border border-[#e8e8ed]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block">
                    Styling Team
                  </span>
                  <h2 className="text-sm font-bold text-[#1d1d1f]">Master Barbers on Duty</h2>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#fbfbfd] rounded-2xl border border-[#e8e8ed] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-sm">
                      A
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1d1d1f]">Anas</h4>
                      <p className="text-[10px] text-[#86868b]">Master Barber • Fades & Beard</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <Star size={14} weight="fill" />
                    <span>4.9</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#fbfbfd] rounded-2xl border border-[#e8e8ed] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#8e6e7d] text-white flex items-center justify-center font-bold text-sm">
                      A
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1d1d1f]">Alaa</h4>
                      <p className="text-[10px] text-[#86868b]">Senior Stylist • Modern Cuts</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <Star size={14} weight="fill" />
                    <span>4.8</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-3.5 bg-[#f5edf0]/60 rounded-2xl border border-[#e6dadf] text-center">
                <p className="text-[11px] font-semibold text-[#594951]">Working Hours: 09:00 AM - 09:00 PM</p>
                <span className="text-[10px] text-[#86868b] block mt-0.5">Student Center Level 2, AIU Campus</span>
              </div>
            </div>

            {/* Recent Appointments Table */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-xs border border-[#e8e8ed] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block">
                    Upcoming Bookings
                  </span>
                  <h2 className="text-sm font-bold text-[#1d1d1f]">{t.recentAppointments}</h2>
                </div>
                <button 
                  onClick={() => setActiveTab('appointments')} 
                  className="text-xs text-[#8e6e7d] hover:text-[#594951] font-bold"
                >
                  {t.viewAll} →
                </button>
              </div>
              
              <div className="overflow-x-auto flex-1">
                {filteredAppointments.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#f0eaed]">
                        <th className="pb-2 text-[10px] font-bold text-[#86868b] uppercase tracking-wider">{t.clientName}</th>
                        <th className="pb-2 text-[10px] font-bold text-[#86868b] uppercase tracking-wider">{t.serviceBooked}</th>
                        <th className="pb-2 text-[10px] font-bold text-[#86868b] uppercase tracking-wider">{t.dateTime}</th>
                        <th className="pb-2 text-[10px] font-bold text-[#86868b] uppercase tracking-wider text-right">{t.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f7]">
                      {filteredAppointments.slice(0, 5).map((appt) => (
                        <tr key={appt.appointment_id} className="hover:bg-[#fbfbfd] transition-colors">
                          <td className="py-3 pr-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#f5edf0] text-[#594951] font-bold text-xs flex items-center justify-center shrink-0">
                                {appt.customer_name ? appt.customer_name[0].toUpperCase() : 'C'}
                              </div>
                              <span className="text-xs font-bold text-[#1d1d1f] truncate">{appt.customer_name || 'Walk-in Client'}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-3">
                            <span className="text-xs text-[#6e6e73] font-medium block truncate max-w-[150px]">
                              {appt.service_name || 'Standard Haircut'}
                            </span>
                            <span className="text-[10px] font-extrabold text-[#1d1d1f]">
                              RM {parseFloat(appt.service_price || 15).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-xs text-[#86868b]">
                            {appt.booking_date} {appt.booking_time ? `• ${appt.booking_time}` : ''}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              appt.status === 'confirmed' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : appt.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}>
                              {appt.status || 'Confirmed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                    <Scissors size={40} className="mb-2 text-[#8e6e7d] opacity-20" />
                    <p className="text-xs font-semibold text-[#86868b]">{t.noAppointments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfbfd] font-sans">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        shopName={data?.store_info?.store_name || "AIU Campus Barber Shop"}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      
      <div className={`flex-1 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} flex flex-col transition-all duration-300 relative h-full`}>
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(true)}
          language={lang}
          onLanguageChange={handleLanguageChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#fbfbfd] p-4 md:p-7 scrollbar-thin scrollbar-thumb-gray-200">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default BarberDashboard;
