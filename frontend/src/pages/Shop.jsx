import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchServices, fetchStores, getImageUrl } from '../lib/api';
import { useCart } from '../context/CartContext';
import {
  MagnifyingGlass,
  ShoppingBagOpen,
  Scissors,
  CalendarCheck,
  ShoppingCart,
  Tag,
  Storefront,
  Sparkle,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';
import bowlWhite from '../assets/bowl-white.jpg';

const storeRoutes = {
  1: '/shops/computer',
  2: '/shops/barber',
  3: '/shops/tailor',
  4: '/shops/bottle',
  5: '/shops/drink',
  6: '/shops/massage',
  7: '/shops/clothing',
};

const storeNames = {
  1: 'AIU Tech & Repair Hub',
  2: 'AIU Campus Barber Shop',
  3: 'AIU Tailor & Alterations',
  4: 'AIU Flask & Bottle Shop',
  5: 'AIU Campus Cafe & Brews',
  6: 'AIU Wellness & Cupping',
  7: 'AIU Official Apparel',
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'product', 'service'
  const [selectedStore, setSelectedStore] = useState('all'); // 'all' or store_id
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [productsData, servicesData, storesData] = await Promise.all([
        fetchProducts().catch(() => []),
        fetchServices().catch(() => []),
        fetchStores().catch(() => []),
      ]);

      setStores(storesData || []);

      const normalizedProducts = (productsData || []).map((p) => ({
        id: `prod_${p.product_id}`,
        rawId: p.product_id,
        item_type: 'product',
        title: p.product_name,
        desc: p.product_desc || 'Campus verified product',
        price: Number(p.product_price || 0),
        image_url: p.image_url,
        store_id: p.store_id,
        stock_quantity: p.stock_quantity !== undefined ? p.stock_quantity : 10,
        sku: p.sku || `SKU-${p.product_id}`,
        rawProduct: p,
      }));

      const normalizedServices = (servicesData || []).map((s) => ({
        id: `serv_${s.service_id}`,
        rawId: s.service_id,
        item_type: 'service',
        title: s.service_name,
        desc: s.service_desc || 'Campus verified booking service',
        price: Number(s.service_price || 0),
        image_url: s.image_url,
        store_id: s.store_id,
        stock_quantity: 999, // services are appointment-based
        sku: `SRV-${s.service_id}`,
        rawService: s,
      }));

      // Combine both products and services into a single catalog list
      setItems([...normalizedProducts, ...normalizedServices]);
    } catch (error) {
      console.error('Failed to load campus catalog', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.item_type === 'product') {
      addToCart({
        ...item.rawProduct,
        image_url: getImageUrl(item.image_url),
      });
    } else {
      // For service, navigate to store booking page
      const targetRoute = storeRoutes[item.store_id] || `/shops/${item.store_id}`;
      navigate(targetRoute, { state: { preSelectedService: item.title } });
    }
  };

  const handleCardClick = (item) => {
    if (item.item_type === 'product') {
      navigate(`/product/${item.rawId}`);
    } else {
      const targetRoute = storeRoutes[item.store_id] || `/shops/${item.store_id}`;
      navigate(targetRoute, { state: { preSelectedService: item.title } });
    }
  };

  // Filter items based on type, store, and search query
  const filteredItems = items.filter((item) => {
    // Type Filter
    if (selectedType !== 'all' && item.item_type !== selectedType) {
      return false;
    }

    // Store Filter
    if (selectedStore !== 'all' && Number(item.store_id) !== Number(selectedStore)) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const storeName = (storeNames[item.store_id] || '').toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = (item.desc || '').toLowerCase().includes(q);
      const matchStore = storeName.includes(q);
      return matchTitle || matchDesc || matchStore;
    }

    return true;
  });

  const productsCount = items.filter((i) => i.item_type === 'product').length;
  const servicesCount = items.filter((i) => i.item_type === 'service').length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-10 h-10 rounded-full border-3 border-[#dfd5da] border-t-[#1d1d1f] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl sm:rounded-[32px] border border-[#e8e8ed] p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#f5edf0] text-[#594951] text-[10px] sm:text-[11px] font-bold">
                <span>Complete Campus Marketplace</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">
                All Products & Services.
              </h1>
              <p className="text-xs sm:text-sm text-[#6e6e73]">
                Browse every merchandise item, grooming haircut, custom alteration, and tech diagnostic across all 7 campus vendors.
              </p>
            </div>

            {/* Inline Filter Search Box */}
            <div className="w-full md:w-80">
              <div className="relative">
                <MagnifyingGlass
                  size={16}
                  weight="bold"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search products & services..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setSearchParams({ q: val });
                    } else {
                      setSearchParams({});
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Filtering Controls Bar */}
          <div className="mt-8 pt-6 border-t border-[#e8e8ed] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Category / Offering Type Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedType === 'all'
                    ? 'bg-[#1d1d1f] text-white shadow-xs'
                    : 'bg-[#f5f5f7] hover:bg-[#f5edf0] text-[#6e6e73]'
                }`}
              >
                All Offerings ({items.length})
              </button>

              <button
                onClick={() => setSelectedType('product')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedType === 'product'
                    ? 'bg-[#1d1d1f] text-white shadow-xs'
                    : 'bg-[#f5f5f7] hover:bg-[#f5edf0] text-[#6e6e73]'
                }`}
              >
                Physical Products ({productsCount})
              </button>

              <button
                onClick={() => setSelectedType('service')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedType === 'service'
                    ? 'bg-[#1d1d1f] text-white shadow-xs'
                    : 'bg-[#f5f5f7] hover:bg-[#f5edf0] text-[#6e6e73]'
                }`}
              >
                Bookable Services ({servicesCount})
              </button>
            </div>

            {/* Store Dropdown Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868b] shrink-0">
                Filter by Store:
              </span>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-3.5 py-2 bg-[#f5f5f7] hover:bg-white text-xs font-semibold text-[#1d1d1f] rounded-full border border-[#e8e8ed] outline-none cursor-pointer transition-all"
              >
                <option value="all">All 7 Campus Stores</option>
                <option value="1">AIU Tech & Repair Hub</option>
                <option value="2">AIU Campus Barber Shop</option>
                <option value="3">AIU Tailor & Alterations</option>
                <option value="4">AIU Flask & Bottle Shop</option>
                <option value="5">AIU Campus Cafe & Brews</option>
                <option value="6">AIU Wellness & Cupping</option>
                <option value="7">AIU Official Apparel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl sm:rounded-[32px] border border-[#e8e8ed] py-16 sm:py-20 px-6 text-center max-w-md mx-auto shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f5edf0] text-[#6b535d] flex items-center justify-center mx-auto">
              <ShoppingBagOpen size={24} weight="duotone" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f]">No listings found</h3>
            <p className="text-xs text-[#6e6e73]">
              We couldn't find any products or services matching your active filters.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedStore('all');
                setSearchParams({});
              }}
              className="px-5 py-2 bg-[#1d1d1f] hover:bg-[#333336] text-white font-medium text-xs rounded-full active:scale-95 transition-all shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const isService = item.item_type === 'service';
              const resolvedImage = getImageUrl(item.image_url, bowlWhite);
              const storeLabel = storeNames[item.store_id] || 'Campus Store';
              const isOutOfStock = !isService && item.stock_quantity <= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-[#e8e8ed] shadow-xs hover:shadow-xl hover:shadow-[#6b535d]/6 hover:border-[#dfd5da] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Image Frame */}
                  <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f7] relative">
                    <img
                      src={resolvedImage}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = bowlWhite;
                      }}
                      className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
                        isOutOfStock ? 'opacity-40 grayscale' : ''
                      }`}
                      loading="lazy"
                    />

                    {/* Offering Badge (Service vs Product) */}
                    <div className="absolute top-3 left-3">
                      {isService ? (
                        <span className="inline-flex items-center space-x-1 bg-[#1d1d1f]/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs">
                          <CalendarCheck size={12} weight="duotone" className="text-amber-400" />
                          <span>Service</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#594951] border border-[#e6dadf] shadow-xs">
                          <Tag size={11} weight="duotone" className="text-[#8e6e7d]" />
                          <span>Merchandise</span>
                        </span>
                      )}
                    </div>

                    {/* Stock or Store Badge */}
                    <div className="absolute top-3 right-3">
                      {isOutOfStock ? (
                        <span className="bg-rose-500 text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-md">
                          Sold Out
                        </span>
                      ) : (
                        <span className="bg-white/90 backdrop-blur-xs text-[#1d1d1f] px-2 py-0.5 text-[9px] font-semibold rounded-full border border-[#e8e8ed] shadow-2xs">
                          {storeLabel.replace('AIU ', '')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="flex flex-col p-3.5 sm:p-5 flex-1 justify-between space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-[#86868b] uppercase tracking-wider mb-1">
                        {item.sku}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#1d1d1f] line-clamp-1 group-hover:text-[#594951] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[11px] sm:text-xs text-[#6e6e73] line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    {/* Price & Action Button */}
                    <div className="pt-3 border-t border-[#f0eaed] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#86868b]">
                          {isService ? 'Rate' : 'Price'}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#1d1d1f] tracking-tight">
                          RM {item.price.toFixed(2)}
                        </span>
                      </div>

                      {isService ? (
                        <button
                          onClick={(e) => handleAddToCart(e, item)}
                          className="px-3 py-1.5 rounded-full bg-[#f5edf0] hover:bg-[#1d1d1f] text-[#594951] hover:text-white text-[11px] font-bold transition-all duration-200 active:scale-95 shadow-2xs flex items-center space-x-1"
                        >
                          <CalendarCheck size={14} weight="duotone" />
                          <span>Book</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(e, item)}
                          disabled={isOutOfStock}
                          aria-label="Add to cart"
                          className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-xs ${
                            isOutOfStock
                              ? 'bg-[#f5f5f7] text-[#86868b] cursor-not-allowed'
                              : 'bg-[#1d1d1f] text-white hover:bg-[#333336] hover:shadow-sm'
                          }`}
                        >
                          <ShoppingCart size={16} weight="duotone" />
                        </button>
                      )}
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

export default Shop;
