import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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

  // Generate time slots from 4:00 PM to 11:00 PM
  const timeSlots = [
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', 
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', 
    '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
    '10:00 PM', '10:30 PM', '11:00 PM'
  ];

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
              <User className="w-4 h-4 mr-2 text-gray-900" />
              Select Barber
            </label>
            <select 
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="">Any Professional</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name} ({barber.role})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Scissors className="w-4 h-4 mr-2 text-gray-900" />
              Select Service
            </label>
            <select 
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
            >
              {availableServices.length > 0 ? (
                  availableServices.map((service) => (
                    <option key={service.service_id} value={service.service_name}>
                      {service.service_name} ({service.service_price ? `${service.service_price} RM` : ''})
                    </option>
                  ))
              ) : (
                ['Classic Haircut', 'Beard Trim', 'Full Service (Cut + Beard)', 'Hot Towel Shave', ...haircutStyles.map(s => s.title)].map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))
              )}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-900" />
              Select Date
            </label>
            <div className="border rounded-md p-2 flex justify-center bg-white">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-0"
                classNames={{
                  selected: "bg-gray-900 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-900 focus:text-white",
                  today: "bg-gray-100 text-gray-900",
                }}
                disabled={(date) => date < new Date().setHours(0,0,0,0)} 
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-900" />
              Select Time (4 PM - 11 PM)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`px-2 py-2 text-xs sm:text-sm rounded-md border transition-all ${
                    time === t 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            className="w-full py-6 text-lg bg-gray-900 hover:bg-black text-white" 
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
          >
            Confirm Booking
          </Button>
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
          {selectedBarber 
            ? `Booking with ${selectedBarber.name}` 
            : 'Choose your professional barber'}
        </p>
      </div>

      {!selectedBarber ? (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {barbers.map((barber) => (
            <div 
              key={barber.id}
              onClick={() => handleBarberSelect(barber)}
              className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary"
            >
              <div className="h-80 overflow-hidden">
                <img 
                  src={barber.image} 
                  alt={barber.name} 
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{barber.name}</h3>
                <p className="text-primary font-medium mb-4">{barber.role}</p>
                
                <div className="flex justify-center items-center space-x-1 mb-4 text-yellow-400">
                  <Star className="fill-current w-5 h-5" />
                  <span className="text-gray-700 font-bold ml-1">{barber.rating}</span>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {barber.specialties.map((specialty, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <button className="mt-6 w-full py-3 bg-gray-900 text-white rounded-lg font-medium group-hover:bg-primary transition-colors">
                  Select Barber
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Haircut Styles Section */}
        <div className="mt-20">
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
                    src={style.image_url ? (style.image_url.startsWith('http') ? style.image_url : `http://localhost:8000${style.image_url}`) : style1} 
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
                                    <span className="font-bold text-gray-900 mr-4">${25 + (idx * 10)}</span>
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
