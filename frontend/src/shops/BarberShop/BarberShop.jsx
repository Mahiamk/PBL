import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getBackendBaseUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import anasImg from '../../assets/barber-shop/barbers/Anas.webp';
import alaaImg from '../../assets/barber-shop/barbers/Alaa.webp';
import { User, Star, Scissors, MessageSquare, Tag, X, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../../components/ui/calendar';
import { Button } from '../../components/ui/button';
import AppointmentConfirmation from './AppointmentConfirmation';

// Import Haircut Styles
import style1 from '../../assets/barber-shop/barber-styles/WhatsApp Image 2025-12-29 at 16.25.39.jpeg';
import style2 from '../../assets/barber-shop/barber-styles/WhatsApp Image 2025-12-29 at 16.25.40 (2).jpeg';
import style3 from '../../assets/barber-shop/barber-styles/WhatsApp Image 2025-12-29 at 16.25.40 (3).jpeg';
import style4 from '../../assets/barber-shop/barber-styles/WhatsApp Image 2025-12-29 at 16.25.40.jpeg';
import style5 from '../../assets/barber-shop/barber-styles/WhatsApp Image 2025-12-29 at 16.25.41 (1).jpeg';
import style6 from '../../assets/barber-shop/barber-styles/WhatsApp Image 2025-12-29 at 16.25.41 (2).jpeg';
import style7 from '../../assets/barber-shop/barber-styles/WhatsApp Image 2025-12-29 at 16.25.41.jpeg';

const haircutStyles = [
  { id: 1, image: style1, title: "Modern Fade", price: 15 },
  { id: 2, image: style2, title: "Classic Cut", price: 16 },
  { id: 3, image: style3, title: "Textured Crop", price: 17 },
  { id: 4, image: style4, title: "Pompadour", price: 15 },
  { id: 5, image: style5, title: "Buzz Cut", price: 15 },
  { id: 6, image: style6, title: "Side Part", price: 16 },
  { id: 7, image: style7, title: "Undercut", price: 17 },
];

const barbers = [
  {
    id: 1,
    name: 'Anas',
    role: 'Master Barber',
    image: anasImg,
    rating: 4.9,
    specialties: ['Fades', 'Beard Sculpting', 'Classic Cuts'],
    reviews: [
      { id: 1, user: 'John D.', rating: 5, comment: 'Best fade in town! Anas is a true artist.', date: '2023-12-15' },
      { id: 2, user: 'Mike R.', rating: 5, comment: 'Great attention to detail. Highly recommend.', date: '2023-12-10' }
    ]
  },
  {
    id: 2,
    name: 'Alaa',
    role: 'Senior Stylist',
    image: alaaImg,
    rating: 4.8,
    specialties: ['Modern Styling', 'Hair Coloring', 'Hot Towel Shaves'],
    reviews: [
      { id: 1, user: 'Sarah M.', rating: 5, comment: 'Alaa is amazing with color! Love my new look.', date: '2023-12-12' },
      { id: 2, user: 'David K.', rating: 4, comment: 'Very professional and skilled.', date: '2023-12-05' }
    ]
  }
];

const LoginPromptModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-gray-900" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500">Please login to book an appointment with our professional barbers.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onLogin} className="flex-1 bg-gray-900 hover:bg-black text-white">
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, onConfirm, initialService, preSelectedBarber, availableServices = [] }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState(initialService || (availableServices.length > 0 ? availableServices[0].service_name : 'Classic Haircut'));
  const [selectedBarberId, setSelectedBarberId] = useState(preSelectedBarber?.id || '');
  
  // Update service type if initialService changes
  React.useEffect(() => {
    if (initialService) setServiceType(initialService);
    else if (availableServices.length > 0 && !serviceType) {
        setServiceType(availableServices[0].service_name);
    }
  }, [initialService, availableServices]);

  // Update selected barber if preSelectedBarber changes
  React.useEffect(() => {
    if (preSelectedBarber) setSelectedBarberId(preSelectedBarber.id);
    else setSelectedBarberId('');
  }, [preSelectedBarber]);

  if (!isOpen) return null;

  // Afternoon & Evening time slots (4:00 PM to 10:30 PM)
  const afternoonSlots = ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'];
  const eveningSlots = ['07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM'];

  // Current selected barber info
  const selectedBarberObj = barbers.find(b => b.id === selectedBarberId);
  const selectedServiceObj = availableServices.find(s => s.service_name === serviceType) || haircutStyles.find(s => s.title === serviceType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-auto overflow-hidden border border-[#e8e8ed] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#e8e8ed] flex justify-between items-center bg-[#fbfbfd]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center shadow-xs">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block">
                Appointment Reservation
              </span>
              <h3 className="font-extrabold text-base text-[#1d1d1f]">Book Haircut Session</h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#ebebef] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          
          {/* Step 1: Select Barber */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-[#8e6e7d]" />
                <span>1. Select Stylist</span>
              </label>
              <span className="text-[10px] text-[#86868b]">Optional</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedBarberId('')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedBarberId === ''
                    ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white shadow-xs'
                    : 'border-[#e8e8ed] bg-[#fbfbfd] hover:bg-white text-[#1d1d1f]'
                }`}
              >
                <div className="text-[11px] font-bold block truncate">Any Barber</div>
                <div className={`text-[9px] ${selectedBarberId === '' ? 'text-white/70' : 'text-[#86868b]'}`}>Next available</div>
              </button>

              {barbers.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedBarberId === b.id
                      ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white shadow-xs'
                      : 'border-[#e8e8ed] bg-[#fbfbfd] hover:bg-white text-[#1d1d1f]'
                  }`}
                >
                  <div className="text-[11px] font-bold block truncate">{b.name}</div>
                  <div className={`text-[9px] truncate ${selectedBarberId === b.id ? 'text-white/70' : 'text-[#86868b]'}`}>{b.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Service */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] flex items-center space-x-1.5 mb-2">
              <Scissors className="w-3.5 h-3.5 text-[#8e6e7d]" />
              <span>2. Select Haircut / Service</span>
            </label>
            <div className="relative">
              <select 
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-3 text-xs font-semibold bg-[#f5f5f7] hover:bg-white border border-[#e8e8ed] rounded-2xl focus:border-[#8e6e7d] focus:bg-white outline-none transition-all appearance-none cursor-pointer text-[#1d1d1f]"
              >
                {availableServices.length > 0 ? (
                    availableServices.map((service) => (
                      <option key={service.service_id} value={service.service_name}>
                        {service.service_name} • RM {parseFloat(service.service_price || 15).toFixed(2)}
                      </option>
                    ))
                ) : (
                  ['Classic Haircut', 'Modern Fade', 'Beard Trim', 'Full Service (Cut + Beard)', 'Hot Towel Shave', ...haircutStyles.map(s => s.title)].map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b] text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Step 3: Select Date */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] flex items-center space-x-1.5 mb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-[#8e6e7d]" />
              <span>3. Select Date</span>
            </label>
            <div className="border border-[#e8e8ed] rounded-3xl p-3 flex justify-center bg-[#fbfbfd] shadow-2xs">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-2xl border-0"
                classNames={{
                  selected: "bg-[#1d1d1f] text-white hover:bg-[#333336] hover:text-white focus:bg-[#1d1d1f] focus:text-white rounded-full font-bold",
                  today: "bg-[#f5edf0] text-[#8e6e7d] font-bold rounded-full",
                }}
                disabled={(d) => d < new Date().setHours(0,0,0,0)} 
              />
            </div>
          </div>
          
          {/* Step 4: Select Time Slot */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8e6e7d]" />
                <span>4. Select Time Slot</span>
              </label>
              {time && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Selected: {time}
                </span>
              )}
            </div>

            {/* Afternoon */}
            <div className="mb-2">
              <span className="text-[10px] font-semibold text-[#86868b] block mb-1.5">Afternoon Sessions (4 PM - 7 PM)</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {afternoonSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      time === t 
                        ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs' 
                        : 'bg-[#fbfbfd] text-[#1d1d1f] border-[#e8e8ed] hover:border-[#8e6e7d] hover:bg-white'
                    }`}
                  >
                    {t.replace(':00', '').replace(':30', '.30')}
                  </button>
                ))}
              </div>
            </div>

            {/* Evening */}
            <div>
              <span className="text-[10px] font-semibold text-[#86868b] block mb-1.5">Evening & Night Sessions (7 PM - 11 PM)</span>
              <div className="grid grid-cols-4 gap-1.5">
                {eveningSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      time === t 
                        ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs' 
                        : 'bg-[#fbfbfd] text-[#1d1d1f] border-[#e8e8ed] hover:border-[#8e6e7d] hover:bg-white'
                    }`}
                  >
                    {t.replace(':00', '').replace(':30', '.30')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="p-4 bg-[#f5edf0]/60 rounded-2xl border border-[#e6dadf] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6e6e73]">Service:</span>
              <span className="font-bold text-[#1d1d1f]">{serviceType}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6e6e73]">Stylist:</span>
              <span className="font-bold text-[#1d1d1f]">{selectedBarberObj ? `${selectedBarberObj.name} (${selectedBarberObj.role})` : 'Any Available Barber'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6e6e73]">Appointment Date & Time:</span>
              <span className="font-bold text-[#1d1d1f]">
                {date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a date'} 
                {time ? ` at ${time}` : ' (Pick time)'}
              </span>
            </div>
            {selectedServiceObj?.service_price && (
              <div className="pt-2 border-t border-[#e0d0d8] flex justify-between items-center text-xs">
                <span className="font-bold text-[#1d1d1f]">Estimated Price:</span>
                <span className="font-extrabold text-[#1d1d1f] text-sm">RM {parseFloat(selectedServiceObj.service_price).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-[#e8e8ed] bg-[#fbfbfd] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-[#f5f5f7] hover:bg-[#ebebef] text-[#1d1d1f] text-xs font-bold rounded-2xl transition-colors"
          >
            Cancel
          </button>
          
          <button 
            type="button"
            disabled={!date || !time} 
            onClick={() => { 
              const barber = barbers.find(b => b.id === selectedBarberId);
              onConfirm({
                service: serviceType,
                date: date,
                time: time,
                barber: barber
              });
            }}
            className={`flex-2 py-3 text-xs font-bold rounded-2xl transition-all shadow-xs ${
              !date || !time 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#1d1d1f] hover:bg-[#333336] text-white active:scale-98'
            }`}
          >
            {!time ? 'Select Time Slot' : 'Confirm Haircut Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

import { createAppointment, createReview, fetchReviews, fetchServices } from '../../lib/api';

const BarberShop = () => {
  const { storeId } = useParams();
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'reviews'
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If storeId is provided via URL, use it. Otherwise default to 2 (Barber Shop default seed ID).
    const targetStoreId = storeId || 2; 
    
    fetchServices(targetStoreId).then(data => {
        if (data && data.length > 0) {
            setServices(data);
        } else {
            // Fallback to hardcoded if nothing found
            setServices(haircutStyles.map(s => ({
                service_id: s.id,
                service_name: s.title,
                service_price: s.price,
                image_url: s.image,
                service_desc: "Classic style"
            })));
        }
    }).catch(err => {
        console.error("Failed to fetch services", err);
         // Fallback
         setServices(haircutStyles.map(s => ({
                service_id: s.id,
                service_name: s.title,
                service_price: s.price,
                image_url: s.image,
                service_desc: "Classic style"
            })));
    });
  }, [storeId]);


  const handleBarberSelect = async (barber) => {
    setSelectedBarber(barber);
    setActiveTab('services');
    try {
      const fetchedReviews = await fetchReviews(2, barber.name); // Store ID 2 for Barber Shop
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    }
  };

  const handleBook = (serviceName) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedService(serviceName);
    setIsBookingOpen(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleBookingConfirm = async (bookingDetails) => {
    try {
      const { date, time, barber } = bookingDetails;
      const [timeStr, period] = time.split(' ');
      let [hours, minutes] = timeStr.split(':');
      hours = parseInt(hours);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const bookingDate = new Date(date);
      bookingDate.setHours(hours, parseInt(minutes), 0, 0);

      const barberName = barber ? barber.name : (selectedBarber ? selectedBarber.name : "Any Professional");

      const appointmentData = {
        store_id: 2, // Barber Shop ID
        service_name: bookingDetails.service,
        barber_name: barberName,
        booking_date: bookingDate.toISOString()
      };

      await createAppointment(appointmentData);
      
      setConfirmedBooking({
        ...bookingDetails,
        barberName: barberName,
        date: bookingDate
      });
      setIsBookingOpen(false);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Failed to book appointment. Please try again.");
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    try {
      const reviewData = {
        store_id: 2, // Barber Shop ID
        barber_name: selectedBarber.name,
        user_name: user.name || 'User',
        rating: newReview.rating,
        comment: newReview.comment
      };

      await createReview(reviewData);
      
      // Refresh reviews
      const updatedReviews = await fetchReviews(2, selectedBarber.name);
      setReviews(updatedReviews);
      
      setNewReview({ rating: 5, comment: '' });
      alert('Review submitted successfully!');
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert('Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Barber Shop</h1>
        <p className="text-xl text-gray-600">
          Professional Grooming & Haircut Styling
        </p>
      </div>

      {!selectedBarber ? (
        <>
        {/* Haircut Styles Section */}
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Trending Styles</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((style) => (
              <div 
                key={style.service_id} 
                onClick={() => handleBook(style.service_name)}
                className="group rounded-xl shadow-sm hover:shadow-md transition-all bg-white overflow-hidden cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={style.image_url ? (style.image_url.startsWith('http') ? style.image_url : `${getBackendBaseUrl()}${style.image_url}`) : style1} 
                    alt={style.service_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{style.service_name}</h3>
                  <div className="flex items-center justify-center text-gray-500 font-mono">
                    <Tag className="w-4 h-4 mr-2" />
                    <span>{style.service_price} RM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      ) : (
        <div className="animate-fade-in">
          <button 
            onClick={() => setSelectedBarber(null)}
            className="mb-8 text-gray-500 hover:text-gray-900 flex items-center"
          >
            ← Back to Barbers
          </button>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24">
                <img 
                  src={selectedBarber.image} 
                  alt={selectedBarber.name} 
                  className="w-full h-64 object-cover object-top"
                />
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBarber.name}</h2>
                  <p className="text-primary font-medium">{selectedBarber.role}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                    <ul className="space-y-1">
                      {selectedBarber.specialties.map((s, i) => (
                        <li key={i} className="text-gray-600 flex items-center">
                          <Scissors className="w-4 h-4 mr-2 text-primary" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button 
                        className={`flex-1 py-4 text-center font-medium ${activeTab === 'services' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Services
                    </button>
                    <button 
                        className={`flex-1 py-4 text-center font-medium ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({reviews.length})
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'services' ? (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Select a Service</h3>
                            {['Classic Haircut', 'Beard Trim', 'Full Service (Cut + Beard)', 'Hot Towel Shave'].map((service, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 cursor-pointer transition-colors">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{service}</h4>
                                    <p className="text-sm text-gray-500">30-45 mins</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-bold text-gray-900 mr-4">RM {25 + (idx * 10)}</span>
                                    <button 
                                        onClick={() => handleBook(service)}
                                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-primary transition-colors"
                                    >
                                    Book
                                    </button>
                                </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
                                {user ? (
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                            <div className="flex space-x-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewReview({...newReview, rating: star})}
                                                        className={`focus:outline-none ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        <Star className="w-6 h-6 fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                            <textarea
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                                                rows="3"
                                                placeholder="Share your experience..."
                                                required
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors">
                                            Submit Review
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-600 mb-2">Please login to leave a review</p>
                                        <button 
                                            onClick={() => navigate('/login', { state: { from: location.pathname } })}
                                            className="text-primary font-medium hover:underline"
                                        >
                                            Login now
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.review_id || review.id} className="border-b border-gray-100 pb-6 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mr-3">
                                                    {(review.customer_name || review.user || 'U').charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{review.customer_name || review.user}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {review.created_at 
                                                    ? new Date(review.created_at).toLocaleDateString() 
                                                    : (review.date || 'Unknown Date')}
                                            </span>
                                        </div>
                                        <div className="flex text-yellow-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <p className="text-gray-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onConfirm={handleBookingConfirm}
        initialService={selectedService}
        preSelectedBarber={selectedBarber}
        availableServices={services}
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
    </div>
  );
};

export default BarberShop;
