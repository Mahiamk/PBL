import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  User,
  X,
  Calendar,
  Menu,
  MoreHorizontal,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { fetchMyAppointments, cancelAppointment, fetchCustomerDashboard, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../lib/api';
import AppointmentConfirmation from '../../shops/Tailor/AppointmentConfirmation';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import Chat from '../../components/Chat';

const translations = {
  en: {
    dashboard: 'Dashboard',
    overview: 'Overview',
    orders: 'Orders',
    appointments: 'Appointments',
    messages: 'Messages',
    settings: 'Settings',
    logout: 'Sign Out',
    totalSpent: 'Total Revenue',
    totalOrders: 'Subscriptions',
    pending: 'Sales',
    recentOrders: 'Recent Sales',
    orderId: 'Order ID',
    store: 'Store',
    status: 'Status',
    total: 'Total',
    action: 'Action',
    searchPlaceholder: 'Search...',
    welcome: 'Welcome back',
    paymentMethod: 'Payment Method',
    online: 'Online',
    cod: 'COD',
    sendMessage: 'Type a message...',
    language: 'Language',
    selectLanguage: 'Select Language',
    profile: 'Profile',
    editProfile: 'Edit Profile',
    uploadPhoto: 'Upload Photo',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    activeNow: 'Active Now'
  },
  ms: {
    dashboard: 'Papan Pemuka',
    overview: 'Gambaran',
    orders: 'Pesanan',
    appointments: 'Temujanji',
    messages: 'Mesej',
    settings: 'Tetapan',
    logout: 'Log Keluar',
    totalSpent: 'Jumlah Hasil',
    totalOrders: 'Langganan',
    pending: 'Jualan',
    recentOrders: 'Jualan Terkini',
    orderId: 'ID Pesanan',
    store: 'Kedai',
    status: 'Status',
    total: 'Jumlah',
    action: 'Tindakan',
    searchPlaceholder: 'Cari...',
    welcome: 'Selamat kembali',
    paymentMethod: 'Kaedah Pembayaran',
    online: 'Dalam Talian',
    cod: 'Tunai',
    sendMessage: 'Taip mesej...',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa',
    profile: 'Profil',
    editProfile: 'Sunting Profil',
    uploadPhoto: 'Muat Naik Foto',
    saveChanges: 'Simpan Perubahan',
    cancel: 'Batal',
    activeNow: 'Aktif Sekarang'
  }
};

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const { orders } = useOrder();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [selectedChat, setSelectedChat] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTimeframe, setActiveTimeframe] = useState('monthly');

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  
  // Graph Data
  const chartData = useMemo(() => {
    const current = new Date();
    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();
    let data = [];

    if (activeTimeframe === 'yearly') {
        const years = Array.from({length: 5}, (_, i) => currentYear - 4 + i);
        data = years.map(year => ({ name: year.toString(), revenue: 0, orders: 0 }));

        orders.forEach(order => {
             if (!order?.date) return;
             const d = new Date(order.date);
             if (isNaN(d.getTime())) return;
             const yr = d.getFullYear();
             if (years.includes(yr)) {
                 const idx = years.indexOf(yr);
                 data[idx].revenue += (order.total || 0);
                 data[idx].orders += 1;
             }
        });

    } else if (activeTimeframe === 'monthly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = months.map(name => ({ name, revenue: 0, orders: 0 }));

        orders.forEach(order => {
             if (!order?.date) return;
             const d = new Date(order.date);
             if (isNaN(d.getTime())) return;
             if (d.getFullYear() === currentYear) {
                 data[d.getMonth()].revenue += (order.total || 0);
                 data[d.getMonth()].orders += 1;
             }
        });
    } else {
        // Daily (Current Month)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        data = Array.from({ length: daysInMonth }, (_, i) => ({ 
            name: (i + 1).toString(), 
            revenue: 0, 
            orders: 0 
        }));

        orders.forEach(order => {
             if (!order?.date) return;
             const d = new Date(order.date);
             if (isNaN(d.getTime())) return;
             if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
                 const day = d.getDate();
                 if (data[day - 1]) {
                    data[day - 1].revenue += (order.total || 0);
                    data[day - 1].orders += 1;
                 }
             }
        });
    }

    return data;
  }, [orders, activeTimeframe]);

  // Poll Notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      if (document.visibilityState === 'visible' && user) {
        try {
          const data = await fetchNotifications();
          setNotifications(data);
        } catch (error) {
          console.error("Failed to load notifications", error);
        }
      }
    };

    // Initial load
    loadNotifications();
    
    // Poll every 60 seconds
    const interval = setInterval(loadNotifications, 60000); 
    
    // Also reload when window regains focus
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            loadNotifications();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Close notifications on click outside
    const handleClickOutside = (event) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setIsNotificationsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user?.userId]); // Depend on ID, not full object reference

  const handleNotificationClick = async (notif) => {
    try {
        if (!notif.is_read) {
            await markNotificationAsRead(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, is_read: true} : n));
        }

        if (notif.type === 'message') {
            setTargetChatUser({ id: notif.related_id }); 
            setActiveTab('messages');
        } else if (notif.type === 'order') {
            setActiveTab('orders');
        } else if (notif.type === 'appointment') {
             setActiveTab('appointments');
        }
        setIsNotificationsOpen(false);
    } catch (error) {
        console.error("Error handling notification click", error);
    }
  };

  const markAllRead = async () => {
      try {
          await markAllNotificationsAsRead();
          setNotifications(prev => prev.map(n => ({...n, is_read: true})));
      } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await fetchMyAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to load appointments", error);
      }
    };
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const handleCancelAppointment = async (appointmentId, bookingDate) => {
    const now = new Date();
    const apptDate = new Date(bookingDate);
    const diffHours = (apptDate - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
      alert("Cannot cancel appointment within 24 hours due to penalty policy.");
      return;
    }

    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelAppointment(appointmentId);
        const data = await fetchMyAppointments();
        setAppointments(data);
        alert("Appointment cancelled successfully.");
      } catch (error) {
        console.error("Failed to cancel appointment", error);
        alert("Failed to cancel appointment.");
      }
    }
  };
  
  const [profileImage, setProfileImage] = useState("https://ui-avatars.com/api/?name=Customer&background=000000&color=fff");
  const [profileName, setProfileName] = useState("Customer");
  const [targetChatUser, setTargetChatUser] = useState(null);
  const profileMenuRef = useRef(null);
  const t = translations[language];

  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.userId) {
        try {
          const data = await fetchCustomerDashboard(user.userId);
          if (data.profile) {
            if (data.profile.customer_name) {
               setProfileName(data.profile.customer_name);
            }
            if (data.profile.profile_image) {
              setProfileImage(`http://localhost:8000${data.profile.profile_image}`);
            } else if (data.profile.customer_name) {
              setProfileImage(`https://ui-avatars.com/api/?name=${data.profile.customer_name}&background=000000&color=fff`);
            }
          }
        } catch (error) {
          console.error("Failed to load dashboard profile data", error);
        }
      }
    };
    
    loadProfileData();
  }, [user]);

  const handleProfileUpdate = () => {
     window.location.reload();
  };

  const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrdersCount = orders.length;

  // Render Helpers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Modern Status Badge
  const StatusBadge = ({ status }) => {
    const s = status.toLowerCase();
    let classes = "bg-gray-100 text-gray-700 border-gray-200";
    
    if (s === 'completed' || s === 'confirmed') classes = "bg-white text-black border-black";
    else if (s === 'processing' || s === 'pending') classes = "bg-gray-900 text-white border-transparent";
    else if (s === 'cancelled') classes = "bg-white text-red-600 border-red-200";

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
        {status}
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">{t.totalSpent}</p>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">${totalSpent.toFixed(2)}</h3>
            </div>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <span className="text-black font-medium flex items-center mr-1">
               <ArrowUpRight className="w-3 h-3 mr-0.5" /> +20.1%
            </span>
             from last month
          </div>
        </div>

        {/* Card 2: Subscriptions (Orders Count) */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">{t.totalOrders}</p>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">+{totalOrdersCount}</h3>
            </div>
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-xs text-gray-500 flex items-center">
             <span className="text-black font-medium flex items-center mr-1">
               <ArrowUpRight className="w-3 h-3 mr-0.5" /> +180.1%
             </span>
             from last month
          </div>
        </div>

        {/* Card 3: Pending/Sales */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
               <p className="text-sm font-medium text-gray-500">{t.pending}</p>
               <h3 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">+{orders.length}</h3>
            </div>
            <CreditCard className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-xs text-gray-500 flex items-center">
             <span className="text-black font-medium flex items-center mr-1">
               <ArrowUpRight className="w-3 h-3 mr-0.5" /> +19%
             </span>
             from last month
          </div>
        </div>

          {/* Card 4: Active Now */}
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-sm font-medium text-gray-500">{t.activeNow}</p>
               <h3 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">+573</h3>
             </div>
             <div className="w-4 h-4 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
             </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center">
             <span className="text-black font-medium flex items-center mr-1">
               +201
             </span>
             since last hour
          </div>
        </div>
      </div>

      {/* Main Content Area: Chart & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        
        {/* Overview Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Overview</h3>
             <div className="flex bg-gray-100 rounded-lg p-1">
                {['daily', 'monthly', 'yearly'].map((tf) => (
                <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                    activeTimeframe === tf 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                    {tf}
                </button>
                ))}
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                />
                <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                />
                <Tooltip 
                    cursor={{stroke: '#e4e4e7'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: 'none' }}
                     formatter={(value, name) => [
                      name === 'revenue' ? `$${value.toFixed(2)}` : value, 
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                />
                <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#18181B" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 6, fill: '#18181B' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales / Activity */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">You made {orders.length} purchases this month.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-4">
                          <div className="relative">
                            <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 items-center justify-center border border-gray-200">
                                <span className="font-semibold text-xs text-gray-600">
                                    {order.store_name ? order.store_name.substring(0,2).toUpperCase() : 'ST'}
                                </span>
                            </span>
                          </div>
                          <div className="space-y-1">
                              <p className="text-sm font-medium leading-none text-gray-900">{order.store_name || "Unknown Store"}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{order.items[0]?.product_name || "Product"}</p>
                          </div>
                      </div>
                      <div className="font-medium text-sm text-gray-900">
                          +${order.total.toFixed(2)}
                      </div>
                  </div>
              ))}
              {orders.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-10">
                      No recent sales found
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => {
    const filteredOrders = orders.filter(order => 
      String(order.store_order_id || order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t.recentOrders}</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your recent purchases and invoices.</p>
        </div>
        <button className="text-sm font-medium text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors">
            Download
        </button>
      </div>
      <div className="overflow-x-auto">
        {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                {orders.length === 0 ? "No orders found." : "No matching orders."}
            </div>
        ) : (
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase tracking-wider">{t.orderId}</th>
              <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase tracking-wider">{t.paymentMethod}</th>
              <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase tracking-wider">{t.total}</th>
              <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-4 font-medium text-xs text-gray-500 uppercase tracking-wider text-right">{t.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.store_order_id || order.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600 lg:max-w-xs truncate">
                    {order.items.map(item => `${item.product_name} (x${item.quantity})`).join(', ')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    {order.paymentMethod === 'online' ? (
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    )}
                    <span>{order.paymentMethod === 'online' ? t.online : t.cod}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">${order.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (order.vendor_user_id) {
                        setTargetChatUser({
                            id: order.vendor_user_id,
                            full_name: order.store_name || "Store Owner",
                            role: "vendor"
                        });
                        setActiveTab('messages');
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors opacity-90 group-hover:opacity-100"
                    title="Chat with Vendor"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          navigate('/invoice', { 
                              state: { 
                                  order: {
                                      ...order,
                                      customer_name: user?.fullName,
                                      email: user?.email,
                                      order_id: order.store_order_id || order.id,
                                      items: order.items || [],
                                      paymentMethod: order.paymentMethod
                                  }
                              } 
                          });
                      }}
                      className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors opacity-90 group-hover:opacity-100"
                      title="View Invoice"
                  >
                      <FileText className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
  };

  const renderMessages = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in h-[600px]">
         <Chat preSelectedUser={targetChatUser} />
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-fade-in max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">{t.settings}</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language}</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2.5 bg-white text-gray-900 focus:ring-black focus:border-black transition-colors"
          >
            <option value="en">English (US)</option>
            <option value="ms">Bahasa Melayu</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">Select your preferred interface language.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex text-gray-900 font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-gray-200 fixed h-full z-40 flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">Dashboard</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: t.overview },
            { id: 'orders', icon: ShoppingBag, label: t.orders },
            { id: 'appointments', icon: Calendar, label: t.appointments },
            { id: 'messages', icon: MessageSquare, label: t.messages },
            { id: 'settings', icon: Settings, label: t.settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-black text-white' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-8 h-16 flex justify-between items-center">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 text-gray-500 hover:bg-gray-100 p-2 rounded-md md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs / Page Title */}
            <div className="hidden md:flex items-center text-sm font-medium text-gray-500">
                <span className="text-gray-900">Dashboard</span>
                <span className="mx-2">/</span>
                <span className="capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
               <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
               >
                 <Bell className="w-5 h-5" />
                 {unreadCount > 0 && (
                   <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 border border-white"></span>
                 )}
               </button>
               {/* Notifications Dropdown (Simplified styling) */}
               {isNotificationsOpen && (
                 <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-semibold">Notifications</span>
                        {unreadCount > 0 && <span className="text-xs text-blue-600 cursor-pointer" onClick={markAllRead}>Mark read</span>}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? <p className="px-4 py-4 text-xs text-center text-gray-400">No new notifications</p> : 
                        notifications.map(n => (
                            <div key={n.id} onClick={() => handleNotificationClick(n)} className={`px-4 py-3 border-b border-gray-50 text-sm cursor-pointer hover:bg-gray-50 ${!n.is_read ? 'bg-gray-50/50' : ''}`}>
                                <p className="font-medium text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-1 truncate">{n.message}</p>
                            </div>
                        ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                 <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center overflow-hidden border border-gray-200">
                    <img src={profileImage} alt="User" className="h-full w-full object-cover" />
                 </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{profileName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'customer@example.com'}</p>
                  </div>
                  <button onClick={() => { setIsProfileMenuOpen(false); setIsEditProfileOpen(true); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Profile Settings
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 bg-white">
          <div className="flex justify-between items-end mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
               {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            {activeTab === 'overview' && (
                <div className="hidden sm:flex space-x-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-900">
                        Download
                    </button>
                </div>
            )}
          </div>

          {activeTab === 'overview' && renderDashboard()}
          {activeTab === 'orders' && renderOrders()}
          
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Appointments</h2>
                <p className="text-sm text-gray-500 mt-1">View and manage your scheduled services.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No appointments scheduled.</td>
                      </tr>
                    ) : (
                      appointments.map((appt) => (
                        <tr key={appt.appointment_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{appt.service_name}</div>
                            <div className="text-xs text-gray-500">{appt.barber_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(appt.booking_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(appt.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={appt.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                            {appt.status === 'Confirmed' && (
                              <>
                                <button 
                                  onClick={() => setSelectedAppointment({
                                    service: appt.service_name,
                                    date: new Date(appt.booking_date),
                                    time: new Date(appt.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  })}
                                  className="text-gray-600 hover:text-black hover:underline"
                                >
                                  Invoice
                                </button>
                                <button 
                                  onClick={() => handleCancelAppointment(appt.appointment_id, appt.booking_date)}
                                  className="text-red-500 hover:text-red-700 hover:underline"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'messages' && renderMessages()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
      
      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        t={t}
        profileImage={profileImage}
        onImageUpload={handleImageUpload}
        onProfileUpdate={handleProfileUpdate}
      />
      
      {selectedAppointment && (
        <AppointmentConfirmation 
        appointmentDetails={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
