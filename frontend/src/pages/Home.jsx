import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchServices, getImageUrl } from '../lib/api';
import ProductCard from '../components/ProductCard';
import {
  ArrowRight,
  Scissors,
  ShoppingBagOpen,
  Storefront,
  ShieldCheck,
  Lightning,
  Star,
  CheckCircle,
  EnvelopeSimple,
  CalendarCheck,
  Sparkle,
} from '@phosphor-icons/react';
import bannerOne from '../assets/banner-one.png';
import bowlWhite from '../assets/bowl-white.jpg';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);

  // Newsletter state and handler
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();
    setError("");
    try {
      const { subscribeNewsletter } = await import('../lib/api');
      await subscribeNewsletter(email);
      setConfirmation(true);
      setEmail("");
      setTimeout(() => setConfirmation(false), 5000);
    } catch (err) {
      setError(err?.response?.data?.detail || "Subscription failed. Try again.");
    }
  }

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
    fetchServices().then(setServices).catch(console.error);
  }, []);

  // Get the newest 6 products (backend sorts by ID desc)
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      {/* Apple-Style Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-[#e8e8ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#f5edf0] border border-[#e6dadf] text-[#594951] text-[10px] sm:text-[11px] font-semibold mb-3">
            <span>AIU Official Campus Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1d1d1f] leading-tight mb-3 max-w-4xl">
            Elevate Your <br className="hidden sm:inline" />
            Campus Lifestyle.
          </h1>

          <p className="text-xs sm:text-base text-[#6e6e73] font-normal max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            The curated marketplace for student essentials, grooming appointments, custom tailoring, tech diagnostics, and campus refreshments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-md px-2 sm:px-0">
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 rounded-full bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-medium text-xs sm:text-sm transition-all duration-200 shadow-xs"
            >
              <ShoppingBagOpen size={16} weight="duotone" />
              <span>Shop Collection</span>
            </Link>
            <Link
              to="/shops"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 rounded-full bg-[#f5edf0] hover:bg-[#eee0e5] border border-[#e6dadf] active:scale-95 text-[#594951] font-medium text-xs sm:text-sm transition-all duration-200"
            >
              <Storefront size={16} weight="duotone" />
              <span>Explore All Shops</span>
            </Link>
          </div>

          {/* Hero Image Showcase */}
          <div className="mt-10 sm:mt-14 w-full max-w-5xl rounded-3xl overflow-hidden border border-[#e8e8ed] shadow-lg shadow-[#1d1d1f]/5 bg-[#fbfbfd]">
            <img
              src={bannerOne}
              alt="AIU Microstore Official Collection"
              className="w-full h-[220px] sm:h-[380px] lg:h-[440px] object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
            />
          </div>

          {/* Apple Value Props Bar */}
          <div className="mt-8 sm:mt-12 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-[#6e6e73] pt-6 sm:pt-8 border-t border-[#e8e8ed]">
            <div className="flex items-center justify-center space-x-2 bg-[#fbfbfd] py-2.5 px-3.5 rounded-2xl border border-[#f0eaed]">
              <ShieldCheck size={18} weight="duotone" className="text-[#8e6e7d]" />
              <span className="font-medium text-[#1d1d1f]">Verified Campus Merchants</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-[#fbfbfd] py-2.5 px-3.5 rounded-2xl border border-[#f0eaed]">
              <Lightning size={18} weight="duotone" className="text-[#8e6e7d]" />
              <span className="font-medium text-[#1d1d1f]">Instant Booking & Pickup</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-[#fbfbfd] py-2.5 px-3.5 rounded-2xl border border-[#f0eaed]">
              <Star size={18} weight="duotone" className="text-[#8e6e7d]" />
              <span className="font-medium text-[#1d1d1f]">Direct Student Pricing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 sm:py-20 px-3.5 sm:px-6 lg:px-8 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8e6e7d] mb-1 block">
                The Latest
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">
                Featured Arrivals.
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-[#1d1d1f] hover:text-[#594951] group transition-colors"
            >
              <span>See all products</span>
              <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                image={product.image_url || bowlWhite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-12 sm:py-20 px-3.5 sm:px-6 lg:px-8 bg-white border-y border-[#e8e8ed]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8e6e7d] mb-1 block">
                On-Demand
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">
                Campus Appointments & Services.
              </h2>
            </div>
            <Link
              to="/shops"
              className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-[#1d1d1f] hover:text-[#594951] group transition-colors"
            >
              <span>Explore all stores</span>
              <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {services.slice(0, 8).map((service) => (
              <div
                key={service.service_id}
                className="group bg-[#fbfbfd] hover:bg-white rounded-3xl border border-[#e8e8ed] hover:border-[#dfd5da] hover:shadow-xl hover:shadow-[#6b535d]/5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f7] relative">
                  {service.image_url ? (
                    <img
                      src={getImageUrl(service.image_url)}
                      alt={service.service_name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8e6e7d] bg-[#f5edf0]">
                      <Scissors size={36} weight="duotone" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-[#1d1d1f] shadow-xs border border-[#e8e8ed]">
                    RM {Number(service.service_price).toFixed(2)}
                  </span>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-[#1d1d1f] text-xs sm:text-sm line-clamp-1 group-hover:text-[#594951] transition-colors">
                      {service.service_name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#6e6e73] mt-1 line-clamp-2 leading-relaxed">
                      {service.service_desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#f0eaed] flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-medium text-[#86868b] truncate max-w-[110px]">
                      {service.store_name || 'AIU Service'}
                    </span>
                    <Link
                      to={
                        service.store_name?.toLowerCase().includes('barber')
                          ? `/shops/barber/${service.store_id}`
                          : service.store_name?.toLowerCase().includes('tailor')
                          ? `/shops/tailor`
                          : service.store_name?.toLowerCase().includes('computer')
                          ? `/shops/computer`
                          : service.store_name?.toLowerCase().includes('massage')
                          ? `/shops/massage`
                          : `/shops/${service.store_id}`
                      }
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-[11px] font-semibold transition-all active:scale-95 shadow-xs"
                    >
                      <CalendarCheck size={13} weight="duotone" />
                      <span>Book</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div className="col-span-full text-center text-[#86868b] py-10 text-xs">
                No services available at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Apple-Style Newsletter Section */}
      <section className="py-20 bg-[#f5edf0]/70 border-t border-[#e6dadf] px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#6b535d] border border-[#e6dadf] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <EnvelopeSimple size={24} weight="duotone" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight mb-2">
            Get updates on new releases.
          </h2>
          <p className="text-[#6e6e73] mb-8 text-sm max-w-md mx-auto">
            Stay informed about campus collection drops, flash vendor promotions, and exclusive student rates.
          </p>

          {confirmation ? (
            <div className="inline-flex items-center space-x-2 bg-white border border-[#e6dadf] text-[#594951] px-6 py-3 rounded-full font-medium text-sm shadow-sm">
              <CheckCircle size={18} weight="duotone" className="text-emerald-600" />
              <span>Thank you for subscribing to AIU Microstore updates.</span>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {error && (
                <div className="text-rose-600 text-xs font-medium mb-3">{error}</div>
              )}
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  placeholder="Enter your student email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-[#dfd5da] rounded-full text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-[#1d1d1f] focus:ring-2 focus:ring-[#1d1d1f]/10 text-sm shadow-xs transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-7 py-3 bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-medium text-sm rounded-full shadow-sm transition-all duration-200 shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
