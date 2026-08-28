import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchStoreDetail,
  fetchProducts,
  fetchServices,
  createAppointment,
  getBackendBaseUrl,
  getImageUrl,
} from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import {
  Storefront,
  MapPin,
  Clock,
  Phone,
  CalendarCheck,
  CheckCircle,
  Tag,
  Sparkle,
  ShoppingBagOpen,
  ArrowRight,
  User,
  X,
  ShieldCheck,
} from '@phosphor-icons/react';

const BookingModal = ({ isOpen, onClose, store, initialService, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState(initialService?.service_name || '');
  const [providerName, setProviderName] = useState('Staff Specialist');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookedSuccess, setBookedSuccess] = useState(false);

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService.service_name);
    }
  }, [initialService]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-12 h-12 rounded-full bg-[#f5edf0] text-[#594951] flex items-center justify-center mx-auto mb-3">
            <User size={24} weight="duotone" />
          </div>
          <h3 className="text-base font-bold text-[#1d1d1f] mb-1">Sign in Required</h3>
          <p className="text-xs text-[#6e6e73] mb-5">
            Please sign in to book an appointment with {store?.store_name || 'this campus shop'}.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-full border border-[#e8e8ed] text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              Cancel
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2 rounded-full bg-[#1d1d1f] text-white text-xs font-medium hover:bg-[#333336]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!bookingDate || !bookingTime) {
      setError('Please select a valid date and time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedDateTime = new Date(`${bookingDate}T${bookingTime}:00`);

      await createAppointment({
        store_id: store.store_id,
        barber_name: providerName,
        service_name: selectedService || 'General Consultation',
        booking_date: combinedDateTime.toISOString(),
      });

      setBookedSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment. Please choose another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
        >
          <X size={18} weight="bold" />
        </button>

        {bookedSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} weight="duotone" />
            </div>
            <h3 className="text-lg font-bold text-[#1d1d1f]">Appointment Confirmed!</h3>
            <p className="text-xs text-[#6e6e73] leading-relaxed max-w-xs mx-auto">
              Your appointment for <strong className="text-[#1d1d1f]">{selectedService}</strong> at{' '}
              <strong className="text-[#1d1d1f]">{store?.store_name}</strong> on {bookingDate} at {bookingTime} has been submitted.
            </p>
            <div className="pt-3">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-full bg-[#1d1d1f] text-white text-xs font-medium hover:bg-[#333336]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#f5edf0] text-[#594951] text-[10px] font-semibold mb-1.5">
                <CalendarCheck size={13} weight="duotone" />
                <span>{store?.store_name}</span>
              </div>
              <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                Book an Appointment
              </h2>
              <p className="text-xs text-[#6e6e73]">
                Select your service, date, and preferred time slot.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-[#fff5f5] border border-[#fed7d7] rounded-2xl text-xs text-[#c53030]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                Selected Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] rounded-full border border-transparent focus:border-[#dfd5da] outline-none cursor-pointer"
              >
                {store?.services && store.services.length > 0 ? (
                  store.services.map((s) => (
                    <option key={s.service_id} value={s.service_name}>
                      {s.service_name} — RM {Number(s.service_price).toFixed(2)}
                    </option>
                  ))
                ) : (
                  <option value={selectedService || 'General Appointment'}>
                    {selectedService || 'General Appointment'}
                  </option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Booking Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] rounded-full border border-transparent focus:border-[#dfd5da] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Time Slot
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] rounded-full border border-transparent focus:border-[#dfd5da] outline-none cursor-pointer"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                  <option value="19:00">07:00 PM</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-full bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-medium text-xs shadow-xs transition-all disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ShopTemplate = ({
  storeId: propStoreId,
  title: propTitle,
  description: propDescription,
  bannerImage: propBannerImage,
  children,
  customFetch,
  categories,
  categoryDescriptions,
}) => {
  const params = useParams();
  const storeId = propStoreId || params.storeId;

  const [storeDetail, setStoreDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'services', 'products'
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);

  useEffect(() => {
    setLoading(true);

    if (customFetch) {
      customFetch()
        .then(setProducts)
        .catch(console.error)
        .finally(() => setLoading(false));
      return;
    }

    if (storeId) {
      fetchStoreDetail(storeId)
        .then((data) => {
          setStoreDetail(data);
          setServices(data.services || []);
          setProducts(data.products || []);
        })
        .catch(() => {
          // Fallback to fetchProducts
          fetchProducts(storeId).then(setProducts).catch(console.error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [storeId, customFetch]);

  const handleOpenBooking = (service = null) => {
    setSelectedServiceForModal(service);
    setBookingModalOpen(true);
  };

  const storeName = storeDetail?.store_name || propTitle || 'Campus Store';
  const storeDesc =
    storeDetail?.description || propDescription || 'Official AIU campus shop & service vendor.';
  const storeLocation = storeDetail?.location || 'AIU Student Center';
  const storeHours = storeDetail?.working_hours || '09:00 AM - 08:00 PM';
  const storePhone = storeDetail?.phone || '+60 11-2345 6789';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-9 h-9 rounded-full border-2 border-[#dfd5da] border-t-[#1d1d1f] animate-spin"></div>
      </div>
    );
  }

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();
    return (
      product.product_name.toLowerCase().includes(q) ||
      (product.product_desc && product.product_desc.toLowerCase().includes(q))
    );
  });

  const filteredServices = services.filter((service) => {
    const q = searchQuery.toLowerCase();
    return (
      service.service_name.toLowerCase().includes(q) ||
      (service.service_desc && service.service_desc.toLowerCase().includes(q))
    );
  });

  const bannerImage = storeDetail?.image_url || propBannerImage;

  return (
    <div className="bg-[#f5f5f7] min-h-screen pb-16">
      {/* Storefront Hero Banner */}
      {bannerImage && (
        <div className="w-full h-44 sm:h-60 md:h-72 overflow-hidden bg-[#1d1d1f] relative border-b border-[#e8e8ed]">
          <img
            src={getImageUrl(bannerImage)}
            alt={storeName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/banner-one.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white border-b border-[#e8e8ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Link
                  to="/shops"
                  className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Stores
                </Link>
                <span className="text-[#dfd5da]">/</span>
                <span className="text-xs font-semibold text-[#1d1d1f]">{storeName}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
                {storeName}
              </h1>

              <p className="text-xs sm:text-sm text-[#6e6e73] max-w-2xl leading-relaxed">
                {storeDesc}
              </p>
            </div>

            {/* Quick action for appointment stores */}
            {services.length > 0 && (
              <div className="shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleOpenBooking()}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-medium text-xs shadow-xs transition-all"
                >
                  <CalendarCheck size={16} weight="duotone" />
                  <span>Book Appointment</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-6 pt-6 border-t border-[#f0eaed]">
            <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-[#fbfbfd] border border-[#e8e8ed]">
              <div className="w-8 h-8 rounded-xl bg-[#f5edf0] text-[#594951] flex items-center justify-center shrink-0">
                <MapPin size={16} weight="duotone" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-[#86868b] uppercase font-bold tracking-wider">
                  Campus Location
                </span>
                <span className="text-xs font-semibold text-[#1d1d1f] truncate block">
                  {storeLocation}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-[#fbfbfd] border border-[#e8e8ed]">
              <div className="w-8 h-8 rounded-xl bg-[#f5edf0] text-[#594951] flex items-center justify-center shrink-0">
                <Clock size={16} weight="duotone" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-[#86868b] uppercase font-bold tracking-wider">
                  Working Hours
                </span>
                <span className="text-xs font-semibold text-[#1d1d1f] truncate block">
                  {storeHours}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-[#fbfbfd] border border-[#e8e8ed]">
              <div className="w-8 h-8 rounded-xl bg-[#f5edf0] text-[#594951] flex items-center justify-center shrink-0">
                <Phone size={16} weight="duotone" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-[#86868b] uppercase font-bold tracking-wider">
                  Contact Phone
                </span>
                <span className="text-xs font-semibold text-[#1d1d1f] truncate block">
                  {storePhone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {children && <div>{children}</div>}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Services & Pricing Menu */}
        {services.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e6e7d]">
                  Services & Pricing
                </span>
                <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                  Available Services & Bookings
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.service_id}
                  className="bg-white rounded-2xl border border-[#e8e8ed] hover:border-[#dfd5da] p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#1d1d1f]">{service.service_name}</h3>
                      <span className="text-xs font-extrabold text-[#1d1d1f] bg-[#f5edf0] text-[#594951] px-2 py-0.5 rounded-full shrink-0">
                        RM {Number(service.service_price).toFixed(2)}
                      </span>
                    </div>
                    {service.service_desc && (
                      <p className="text-[11px] text-[#6e6e73] leading-relaxed">
                        {service.service_desc}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0eaed] flex items-center justify-between">
                    <span className="text-[10px] text-[#86868b] flex items-center space-x-1">
                      <Clock size={12} weight="duotone" />
                      <span>~30-45 mins</span>
                    </span>

                    <button
                      onClick={() => handleOpenBooking(service)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-[11px] font-medium transition-all"
                    >
                      <CalendarCheck size={12} weight="duotone" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products & Menu Section */}
        {products.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e6e7d]">
                  Products & Inventory
                </span>
                <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                  Shop Products & Menu Items
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  image={product.image_url || 'https://via.placeholder.com/300'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        store={storeDetail || { store_id: storeId, store_name: storeName, services }}
        initialService={selectedServiceForModal}
      />
    </div>
  );
};

export default ShopTemplate;
