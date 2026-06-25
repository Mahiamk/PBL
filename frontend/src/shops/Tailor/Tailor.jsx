import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createAppointment, fetchServices } from '../../lib/api';
import ShopTemplate from '../../components/ShopTemplate';
import AppointmentConfirmation from './AppointmentConfirmation';
import tailorImg from '../../assets/tailor/tailor.webp';
import tailorTeamImg from '../../assets/tailor/tailor-info/tailor-team.png';
import { Scissors, Ruler, Shirt, Truck, MessageSquare, Calendar as CalendarIcon, X, Clock, User } from 'lucide-react';
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
          <p className="text-gray-500">Please login to book an appointment with our master tailors.</p>
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
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-auto animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 className="font-bold text-lg text-gray-900">Book Appointment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Scissors className="w-4 h-4 mr-2 text-green-700" />
              Select Service
            </label>
            <select 
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {services && services.map((service) => (
                <option key={service.service_id} value={service.service_name}>
                  {service.service_name}
                </option>
              ))}
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
              {[
                '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', 
                '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', 
                '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', 
                '09:00 PM', '09:30 PM'
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`px-3 py-2 text-sm rounded-md border transition-all ${
                    time === t 
                      ? 'bg-green-700 text-white border-green-700 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-700 hover:text-green-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            className="w-full py-6 text-lg bg-green-700 hover:bg-green-800 text-white" 
            disabled={!date || !time} 
            onClick={() => { 
              onConfirm({
                service: serviceType,
                date: date,
                time: time
              });
            }}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

const Tailor = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [services, setServices] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices(3);
        setServices(data);
      } catch (error) {
        console.error("Failed to load services", error);
      }
    };
    loadServices();
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
      // Combine date and time into a single Date object
      const { date, time } = bookingDetails;
      const [timeStr, period] = time.split(' ');
      let [hours, minutes] = timeStr.split(':');
      hours = parseInt(hours);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const bookingDate = new Date(date);
      bookingDate.setHours(hours, parseInt(minutes), 0, 0);

      const appointmentData = {
        store_id: 3, // Tailor Shop ID
        service_name: bookingDetails.service,
        barber_name: "Master Tailor", // Default or selectable
        booking_date: bookingDate.toISOString()
      };

      await createAppointment(appointmentData);
      
      setConfirmedBooking({
        ...bookingDetails,
        date: bookingDate // Use the combined date object for the confirmation page
      });
      setIsBookingOpen(false);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const calculateExperience = (startYear) => {
    const currentYear = new Date().getFullYear();
    return `${currentYear - startYear} Years Experience`;
  };

  const tailors = [
    { 
      name: "Master Tailor", 
      role: "Head Tailor", 
      exp: calculateExperience(2022), // Starts at 3 years in 2025
      image: tailorTeamImg 
    },
    { 
      name: "Sarah Chen", 
      role: "Dress Specialist", 
      exp: calculateExperience(2023), // Starts at 2 years in 2025
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
    },
    { 
      name: "Michael Rossi", 
      role: "Suit Specialist", 
      exp: calculateExperience(2024), // Starts at 1 year in 2025
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
    }
  ];

  return (
    <ShopTemplate 
      storeId={3}
      title="Tailor Shop"
      description="Where elegance meets precision. Experience the art of bespoke tailoring."
      bannerImage={tailorImg}
    >
      {/* Booking Call to Action - Top of Shop */}
      <div className="flex justify-center py-8">
        <Button 
          onClick={handleBookingClick}
          className="bg-green-900 text-white hover:bg-green-800 px-10 py-6 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
        >
          <CalendarIcon className="w-5 h-5 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">The Art of Tailoring</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We believe that every garment tells a story. Our dedicated team of master tailors combines traditional craftsmanship with modern style to create pieces that are uniquely yours.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {services.map((service, index) => (
            <div key={service.service_id || index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
              {service.image_url ? (
                  <img src={service.image_url} alt={service.service_name} className="w-16 h-16 rounded-full object-cover mb-6 mx-auto" />
              ) : (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-700 mb-6 group-hover:bg-green-700 group-hover:text-white transition-colors mx-auto">
                    <Scissors className="w-8 h-8" />
                  </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.service_name}</h3>
              <p className="text-gray-500">{service.service_desc}</p>
              <p className="text-green-700 font-bold mt-2">${service.service_price}</p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Master Tailors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {tailors.map((tailor, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="relative w-48 h-48 mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={tailor.image} 
                    alt={tailor.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{tailor.name}</h3>
                <p className="text-green-700 font-medium mb-2">{tailor.role}</p>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {tailor.exp}
                </span>
              </div>
            ))}
          </div>
        </div>
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

export default Tailor;
