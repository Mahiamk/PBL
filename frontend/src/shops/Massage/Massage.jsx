import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createAppointment, fetchServices, fetchCategories } from '../../lib/api';
import ShopTemplate from '../../components/ShopTemplate';
import AppointmentConfirmation from './AppointmentConfirmation';
import massageImg from '../../assets/massage/cupping.jpg';
import { Sparkles, Calendar as CalendarIcon, X, Clock, User, AlertCircle } from 'lucide-react';
import { Calendar } from '../../components/ui/calendar';
import { Button } from '../../components/ui/button';

const LoginPromptModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500">Please login to book a session with our therapists.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onLogin} className="flex-1 bg-green-700 hover:bg-green-800 text-white">
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, onConfirm, services }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState(services && services.length > 0 ? services[0].service_name : '');
  
  // Update serviceType when services change or modal opens
  useEffect(() => {
    if (services && services.length > 0 && !serviceType) {
        setServiceType(services[0].service_name);
    }
  }, [services, serviceType]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-auto animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 className="font-bold text-lg text-gray-900">Book Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-green-700" />
              Select Service
            </label>
            <select 
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {services && services.length > 0 ? services.map((service) => (
                <option key={service.service_id} value={service.service_name}>
                  {service.service_name} (RM {service.service_price})
                </option>
              )) : <option>No services available</option>}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-green-700" />
              Select Date
            </label>
            <div className="border rounded-md p-2 flex justify-center bg-white">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-0"
                classNames={{
                  selected: "bg-green-700 text-white hover:bg-green-700 hover:text-white focus:bg-green-700 focus:text-white",
                  today: "bg-green-100 text-green-900",
                }}
                disabled={(date) => date < new Date().setHours(0,0,0,0)} 
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-green-700" />
              Select Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`p-2 text-sm rounded-md transition-all ${
                    time === t 
                      ? 'bg-green-700 text-white shadow-md transform scale-105' 
                      : 'bg-gray-50 text-gray-600 hover:bg-green-50 border border-gray-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl shrink-0">
          <Button 
            onClick={() => {
              if (date && time && serviceType) {
                onConfirm({ date: date, time, service: serviceType });
              } else {
                alert('Please select date, time and service');
              }
            }}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-6 text-lg font-semibold shadow-lg shadow-green-200"
            disabled={!date || !time || !serviceType}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

const Massage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const categoryDescriptions = {
    "Relaxation": "Gentle techniques to soothe your mind and body.",
    "Therapeutic": "Targeted relief for chronic pain and muscle tension.",
    "Cupping Therapy": "Ancient technique to improve circulation and reduce inflammation.",
    "Sports Massage": "Optimize recovery and performance for athletes.",
    "Acupuncture": "Traditional healing using fine needles to balance energy.",
    "Reflexology": "Pressure point therapy for hands and feet to restore balance.",
    "Cupping": "Traditional suction cup therapy for pain relief and blood flow."
  };

  const fetchServicesAndCategories = React.useCallback(async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        fetchServices(6),
        fetchCategories(6)
      ]);

      const catNames = categoriesData.map(c => c.category_name);
      setCategories(["All Categories", ...catNames]); // ShopTemplate strictly expects 'All Categories' key for 'Show All' logic

      const catMap = {};
      categoriesData.forEach(c => {
        catMap[c.category_id] = c.category_name;
      });

      setServices(servicesData); // Keep raw services for modal

      // Map services to look like products for ShopTemplate
      // ShopTemplate filters by product.category.category_name
      return servicesData.map(s => ({
         ...s,
         product_id: s.service_id, 
         product_name: s.service_name,
         product_desc: s.service_desc,
         product_price: s.service_price,
         category: {
             category_name: catMap[s.category_id] || "Other"
         }
      }));

    } catch (error) {
      console.error("Failed to load services", error);
      return [];
    }
  }, []);

  const handleBookingClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setIsBookingOpen(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    navigate('/login');
  };

  const handleBookingConfirm = async (bookingDetails) => {
    try {
      const { date, time } = bookingDetails;
      const [timeStr, period] = time.split(' ');
      let [hours, minutes] = timeStr.split(':');
      hours = parseInt(hours);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const bookingDate = new Date(date);
      bookingDate.setHours(hours, parseInt(minutes), 0, 0);

      const appointmentData = {
        store_id: 6, 
        service_name: bookingDetails.service,
        barber_name: "Professional Therapist", 
        booking_date: bookingDate.toISOString()
      };

      await createAppointment(appointmentData);
      
      setConfirmedBooking({
        ...bookingDetails,
        date: bookingDate,
        orderId: Math.floor(Math.random() * 10000) 
      });
      setIsBookingOpen(false);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  return (
    <ShopTemplate 
      storeId={6}
      customFetch={fetchServicesAndCategories}
      title="Massage & Therapy"
      description="Holistic healing, massage therapy, and traditional Chinese medicine."
      bannerImage={massageImg}
      categories={categories}
      categoryDescriptions={categoryDescriptions}
      themeColor="green"
    >
      {/* Booking Call to Action */}
      <div className="flex justify-center py-8">
        <Button 
          onClick={handleBookingClick}
          className="bg-green-700 text-white hover:bg-green-800 px-10 py-6 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
        >
          <CalendarIcon className="w-5 h-5 mr-2" />
          Book Appointment
        </Button>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onConfirm={handleBookingConfirm}
        services={services}
      />

      <LoginPromptModal 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLoginRedirect}
      />

      {confirmedBooking && (
        <AppointmentConfirmation 
          appointmentDetails={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )}
    </ShopTemplate>
  );
};

export default Massage;
