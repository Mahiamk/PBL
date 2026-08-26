import React, { useEffect, useState } from 'react';
import { fetchVendorDashboard, fetchStoreAppointments, fetchServices } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from '../dashboard/TopBar';
import { useSearchParams } from 'react-router-dom';
import AppointmentManager from '../tailor/AppointmentManager';
import ServiceManager from '../../../components/vendor/management/ServiceManager';
import CustomerManager from '../../../components/vendor/management/CustomerManager';
import MessageManager from '../../../components/vendor/management/MessageManager';
import D3AreaTrendChart from '../../../components/charts/D3AreaTrendChart';
import D3DonutBreakdownChart from '../../../components/charts/D3DonutBreakdownChart';
import D3StatSparkline from '../../../components/charts/D3StatSparkline';
import { computeRealRevenueTrend, computeRealVolumeTrend, computeRealServiceBreakdown } from '../../../utils/dashboardMetrics';
import { HandHeart, CalendarCheck, Users, CurrencyCircleDollar, CheckCircle, Clock } from '@phosphor-icons/react';

const MassageDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [data, setData] = useState(null);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('vendor_sidebar_collapsed') === 'true');

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

  const loadData = async (isRefresh = false) => {
    if (user && user.userId) {
      if (!isRefresh) setLoading(true);
      try {
        const dashboardData = await fetchVendorDashboard(user.userId);
        setData(dashboardData);
        
        const storeId = dashboardData?.store_info?.store_id || 6;
        if (storeId) {
          const [apptsData, servicesData] = await Promise.all([
            fetchStoreAppointments(storeId).catch(() => []),
            fetchServices(storeId).catch(() => [])
          ]);
          setAppointments(apptsData || []);
          setServices(servicesData || []);
        }
      } catch (error) {
        console.error('Failed to load wellness dashboard data:', error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8e6e7d]"></div>
      </div>
    );
  }

  if (!data) return null;

  const storeId = data?.store_info?.store_id || 6;
  const storeName = data?.store_info?.store_name || "AIU Wellness & Cupping Therapy";

  // Calculate real service analytics
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'Completed' || a.status === 'completed').length;
  const totalEstimatedRevenue = appointments
    .filter(a => a.status !== 'Cancelled' && a.status !== 'cancelled')
    .reduce((sum, a) => sum + (Number(a.service_price || a.price || 0)), 0);

  const realRevenueTrend = computeRealRevenueTrend(appointments, 7);
  const realVolumeTrend = computeRealVolumeTrend(appointments, 'booking_date', 7);
  const realServiceBreakdown = (() => {
    const breakdown = computeRealServiceBreakdown(appointments);
    if (breakdown.length > 0) return breakdown;
    if (services.length > 0) {
      return services.map(s => ({ label: s.service_name, value: 1 }));
    }
    return [{ label: 'Therapy Services', value: 1 }];
  })();

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1d1d1f]">Therapy & Cupping Appointments</h2>
                  <p className="text-xs text-[#6e6e73]">Manage client bookings, confirmations, and session completions.</p>
                </div>
                <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#f5edf0] text-[#594951] border border-[#e6dadf]">
                  <CalendarCheck size={16} weight="duotone" className="text-[#8e6e7d]" />
                  <span>{totalAppointments} Total Sessions</span>
                </div>
              </div>
              <AppointmentManager 
                storeId={storeId} 
                appointments={appointments} 
                selectedId={selectedId} 
              />
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <ServiceManager storeId={storeId} />
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            <CustomerManager customers={data?.customers || []} />
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <MessageManager selectedId={selectedId} />
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="space-y-8">
            {/* KPI Sparkline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Therapy Bookings
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">{totalAppointments}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {completedAppointments} Sessions Completed
                  </span>
                </div>
                <D3StatSparkline data={realVolumeTrend.map(d => d.value)} color="#1d1d1f" width={75} height={28} />
              </div>
              
              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Estimated Revenue
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">RM {totalEstimatedRevenue.toFixed(2)}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">Booking Pipeline</span>
                </div>
                <D3StatSparkline data={realRevenueTrend.map(d => d.total)} color="#8e6e7d" width={75} height={28} />
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#e8e8ed] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Therapy Menu
                  </span>
                  <p className="text-2xl font-black text-[#1d1d1f]">
                    {services.length}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-600">Active Services</span>
                </div>
                <D3StatSparkline data={[0, 0, 0, 0, 0, 0, services.length]} color="#594951" width={75} height={28} />
              </div>
            </div>

            {/* D3 Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <D3AreaTrendChart
                  data={realRevenueTrend}
                  xKey="date"
                  yKey="total"
                  title="Therapy Appointments Volume"
                  subtitle="7-day revenue trend from client bookings (RM)"
                  height={280}
                  color="#8e6e7d"
                />
              </div>
              
              <div className="lg:col-span-5">
                <D3DonutBreakdownChart
                  data={realServiceBreakdown}
                  labelKey="label"
                  valueKey="value"
                  title="Therapy Distribution"
                  subtitle="Service demand & catalog breakdown"
                  height={280}
                />
              </div>
            </div>

            {/* Active Therapy Services Table */}
            <div className="bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#1d1d1f]">Active Therapy Services & Rates</h3>
                  <p className="text-xs text-[#6e6e73]">Cupping (Hijama), recovery massage, and stress-relief treatments.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('services')} 
                  className="text-xs font-bold text-[#8e6e7d] hover:text-[#1d1d1f] transition-colors"
                >
                  Manage Services &rarr;
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold border-b border-[#e8e8ed]">
                    <tr>
                      <th className="p-3.5">Service Name</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5">Session Rate</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eaed]">
                    {services.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">
                          No services found. Click "Manage Services" to add your therapy menu.
                        </td>
                      </tr>
                    ) : (
                      services.map((service) => (
                        <tr key={service.service_id} className="hover:bg-[#fbfbfd]">
                          <td className="p-3.5 font-bold text-[#1d1d1f] flex items-center space-x-2">
                            <HandHeart size={16} weight="duotone" className="text-[#8e6e7d] shrink-0" />
                            <span>{service.service_name}</span>
                          </td>
                          <td className="p-3.5 text-[#6e6e73] max-w-xs truncate">{service.service_desc || 'Campus therapy session'}</td>
                          <td className="p-3.5 font-bold text-[#1d1d1f]">RM {Number(service.service_price).toFixed(2)}</td>
                          <td className="p-3.5 text-right">
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Available</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Appointments Overview */}
            <div className="bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#1d1d1f]">Recent Appointment Schedule</h3>
                  <p className="text-xs text-[#6e6e73]">Recent student and staff bookings for therapy sessions.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('appointments')} 
                  className="text-xs font-bold text-[#8e6e7d] hover:text-[#1d1d1f] transition-colors"
                >
                  View All Appointments &rarr;
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-10 bg-[#fbfbfd] rounded-2xl border border-dashed border-[#e8e8ed]">
                  <CalendarCheck size={32} weight="duotone" className="mx-auto text-[#8e6e7d] mb-2" />
                  <p className="text-sm font-bold text-[#1d1d1f]">No appointments scheduled yet</p>
                  <p className="text-xs text-[#86868b] max-w-sm mx-auto mt-1">
                    When campus students and faculty book therapy or cupping sessions, they will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold border-b border-[#e8e8ed]">
                      <tr>
                        <th className="p-3.5">Client</th>
                        <th className="p-3.5">Service</th>
                        <th className="p-3.5">Booking Date & Time</th>
                        <th className="p-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0eaed]">
                      {appointments.slice(0, 5).map((appt) => (
                        <tr key={appt.appointment_id} className="hover:bg-[#fbfbfd]">
                          <td className="p-3.5 font-bold text-[#1d1d1f]">{appt.customer_name || 'Client'}</td>
                          <td className="p-3.5 text-[#594951] font-medium">{appt.service_name}</td>
                          <td className="p-3.5 text-[#6e6e73]">{appt.booking_date} {appt.booking_time ? `at ${appt.booking_time}` : ''}</td>
                          <td className="p-3.5 text-right">
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{appt.status || 'Pending'}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7] font-sans">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        shopName={storeName}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      
      <div className={`flex-1 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} flex flex-col transition-all duration-300 relative h-full`}>
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f5f5f7] p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-200">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MassageDashboard;
