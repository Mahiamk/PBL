import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBackendBaseUrl, getImageUrl } from '../lib/api';
import {
  Scissors,
  CoatHanger,
  Desktop,
  Coffee,
  Wine,
  Heartbeat,
  MapPin,
  ShoppingBagOpen,
  Storefront,
  ArrowRight,
  CheckCircle,
  Clock,
  Phone,
  CalendarCheck,
  MagnifyingGlass,
  Sparkle,
} from '@phosphor-icons/react';
import { fetchStores } from '../lib/api';

import barberImg from '../assets/barber-shop/coolcut.jpg';
import tailorImg from '../assets/tailor/tailor.webp';
import computerImg from '../assets/computershop/computer-shop.jpg';
import drinkImg from '../assets/drinkshop/drink.webp';
import massageImg from '../assets/massage/cupping.jpg';
import bottleImg from '../assets/thermos-yellow.jpg';
import clothingImg from '../assets/banner-one.png';

// Configuration helper for store types
const getStoreConfig = (type) => {
  const t = (type || "").toLowerCase();

  if (t.includes('barber'))
    return {
      icon: Scissors,
      image: barberImg,
      badge: 'Grooming',
      category: 'barber',
      path: (id) => `/shops/barber${id ? `/${id}` : ''}`,
      desc: 'Haircuts, precision fades, beard sculpting, and hot towel treatments.',
      bookingType: 'appointment',
      startingPrice: 'RM 12.00',
    };
  if (t.includes('tailor'))
    return {
      icon: CoatHanger,
      image: tailorImg,
      badge: 'Tailoring',
      category: 'tailor',
      path: (id) => `/shops/tailor`,
      desc: 'Bespoke tailoring, alterations, garment repairs, and graduation robes.',
      bookingType: 'appointment',
      startingPrice: 'RM 8.00',
    };
  if (t.includes('computer') || t.includes('tech') || t === 'electronics')
    return {
      icon: Desktop,
      image: computerImg,
      badge: 'Tech & Repair',
      category: 'tech',
      path: (id) => `/shops/computer`,
      desc: 'Laptop diagnostics, formatting, hardware upgrades, and PC peripherals.',
      bookingType: 'appointment',
      startingPrice: 'RM 25.00',
    };
  if (t.includes('bottle'))
    return {
      icon: Wine,
      image: bottleImg,
      badge: 'Drinkware',
      category: 'bottles',
      path: (id) => `/shops/bottle`,
      desc: 'Thermal flasks, insulated tumblers, and custom laser name engraving.',
      bookingType: 'order',
      startingPrice: 'RM 32.00',
    };
  if (t.includes('cloth') || t.includes('apparel') || t === 'fashion')
    return {
      icon: CoatHanger,
      image: clothingImg,
      badge: 'Apparel',
      category: 'clothing',
      path: (id) => `/shops/clothing${id ? `/${id}` : ''}`,
      desc: 'Official AIU collegiate hoodies, varsity jackets, polos, and tote bags.',
      bookingType: 'order',
      startingPrice: 'RM 29.00',
    };
  if (t.includes('drink') || t.includes('cafe') || t.includes('food'))
    return {
      icon: Coffee,
      image: drinkImg,
      badge: 'Cafe & Drinks',
      category: 'cafe',
      path: (id) => `/shops/drink`,
      desc: 'Specialty coffee, iced lattes, boba fresh milk, and baked pastries.',
      bookingType: 'order',
      startingPrice: 'RM 5.00',
    };
  if (t.includes('massage') || t.includes('wellness'))
    return {
      icon: Heartbeat,
      image: massageImg,
      badge: 'Wellness',
      category: 'wellness',
      path: (id) => `/shops/massage`,
      desc: 'Traditional Hijama cupping, deep tissue sports therapy, and reflexology.',
      bookingType: 'appointment',
      startingPrice: 'RM 30.00',
    };

  return {
    icon: ShoppingBagOpen,
    image: clothingImg,
    badge: 'Campus Store',
    category: 'general',
    path: (id) => `/shops/${id || ''}`,
    desc: 'Quality products and student essentials directly on campus.',
    bookingType: 'order',
    startingPrice: 'RM 10.00',
  };
};

const CATEGORY_TABS = [
  { id: 'all', label: 'All Campus Shops' },
  { id: 'barber', label: 'Hair & Grooming' },
  { id: 'tailor', label: 'Tailoring & Alterations' },
  { id: 'tech', label: 'Tech & Laptop Repair' },
  { id: 'wellness', label: 'Wellness & Therapy' },
  { id: 'cafe', label: 'Cafe & Refreshments' },
  { id: 'clothing', label: 'Collegiate Apparel' },
  { id: 'bottles', label: 'Flasks & Drinkware' },
];

const ShopsHub = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStores()
      .then((data) => {
        setStores(data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const config = getStoreConfig(store.store_type);
      const matchesTab = activeTab === 'all' || config.category === activeTab;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        store.store_name?.toLowerCase().includes(q) ||
        store.location?.toLowerCase().includes(q) ||
        store.description?.toLowerCase().includes(q) ||
        config.desc?.toLowerCase().includes(q) ||
        config.badge?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [stores, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-9 h-9 rounded-full border-2 border-[#dfd5da] border-t-[#1d1d1f] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-8 sm:py-14 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#f5edf0] border border-[#e6dadf] text-[#594951] text-[10px] sm:text-[11px] font-semibold">
            <Storefront size={14} weight="duotone" />
            <span>AIU Campus Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1d1d1f] tracking-tight">
            Explore Campus Stores.
          </h1>
          <p className="text-xs sm:text-sm text-[#6e6e73] max-w-xl mx-auto leading-relaxed px-2">
            Find registered on-campus shops, check live working hours & locations, explore service menus with pricing, and book your appointments in seconds.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-3.5">
          {/* Search Box */}
          <div className="max-w-md mx-auto relative px-1 sm:px-0">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search shop, service, or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-[#e8e8ed] focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none shadow-xs transition-all"
            />
          </div>

          {/* Category Tabs with Mobile Swipe */}
          <div className="flex items-center overflow-x-auto sm:flex-wrap sm:justify-center gap-1.5 sm:gap-2 pb-2 sm:pb-0 scrollbar-none no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#1d1d1f] text-white shadow-xs'
                      : 'bg-white border border-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f] hover:border-[#dfd5da] hover:bg-[#fbfbfd]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Store Grid */}
        {filteredStores.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#e8e8ed] max-w-md mx-auto p-8">
            <Storefront size={36} weight="duotone" className="text-[#86868b] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1d1d1f]">No campus shops found</h3>
            <p className="text-xs text-[#6e6e73] mt-1">Try adjusting your search query or selecting a different category tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredStores.map((store) => {
              const config = getStoreConfig(store.store_type);
              const IconComponent = config.icon;
              const linkPath = config.path(store.store_id);

              const workingHours = store.working_hours || "09:00 AM - 08:00 PM";
              const campusLocation = store.location || "Student Center";
              const isOpen = true; // Campus default active schedule

              return (
                <div
                  key={store.store_id}
                  className="group relative flex flex-col bg-white rounded-3xl border border-[#e8e8ed] hover:border-[#dfd5da] shadow-xs hover:shadow-xl hover:shadow-[#6b535d]/6 transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  {/* Store Header Image & Banner */}
                  <div className="h-48 w-full overflow-hidden bg-[#f5f5f7] relative">
                    <img
                      src={getImageUrl(store.image_url, config.image)}
                      alt={store.store_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = config.image;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f]/70 via-[#1d1d1f]/20 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#1d1d1f] shadow-xs backdrop-blur-md border border-white/40">
                        <CheckCircle size={12} weight="duotone" className="text-emerald-600" />
                        <span>{isOpen ? 'Open Today' : 'Closed'}</span>
                      </span>
                    </div>

                    {/* Category pill on image */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#1d1d1f]/80 text-white backdrop-blur-md">
                        {config.badge}
                      </span>
                    </div>

                    {/* Floating Icon Pill */}
                    <div className="absolute -bottom-3.5 left-5">
                      <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center shadow-md ring-4 ring-white">
                        <IconComponent size={20} weight="duotone" />
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 pt-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f] group-hover:text-[#594951] transition-colors leading-snug">
                          {store.store_name}
                        </h3>
                        <span className="text-[10px] font-bold text-[#594951] bg-[#f5edf0] px-2 py-0.5 rounded-full shrink-0">
                          {config.startingPrice ? `From ${config.startingPrice}` : 'Verified'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#6e6e73] line-clamp-2 leading-relaxed">
                        {store.description || config.desc}
                      </p>
                    </div>

                    {/* Meta chips: Location and Working Hours */}
                    <div className="space-y-1.5 pt-2 border-t border-[#f0eaed] text-[11px] text-[#6e6e73]">
                      <div className="flex items-center space-x-1.5">
                        <MapPin size={14} weight="duotone" className="text-[#8e6e7d] shrink-0" />
                        <span className="font-medium text-[#1d1d1f] truncate">{campusLocation}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock size={14} weight="duotone" className="text-[#8e6e7d] shrink-0" />
                        <span className="text-[#6e6e73]">{workingHours}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        to={linkPath}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-full bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-medium text-xs shadow-xs transition-all"
                      >
                        {config.bookingType === 'appointment' ? (
                          <>
                            <CalendarCheck size={14} weight="duotone" />
                            <span>Book Appointment</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBagOpen size={14} weight="duotone" />
                            <span>View Store & Menu</span>
                          </>
                        )}
                      </Link>

                      <Link
                        to={linkPath}
                        className="p-2 rounded-full border border-[#e8e8ed] hover:border-[#dfd5da] hover:bg-[#f5edf0] text-[#1d1d1f] transition-all"
                        title="View details"
                      >
                        <ArrowRight size={14} weight="bold" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopsHub;

