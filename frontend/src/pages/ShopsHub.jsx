import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Monitor, Shirt, Coffee, Wine, Activity, MapPin, ShoppingBag } from 'lucide-react';
import { fetchStores } from '../lib/api';

import barberImg from '../assets/barber-shop/coolcut.jpg';
import tailorImg from '../assets/tailor/tailor.webp';
import computerImg from '../assets/computershop/computer-shop.jpg';
import drinkImg from '../assets/drinkshop/drink.webp';
import massageImg from '../assets/massage/cupping.jpg';
import bottleImg from '../assets/thermos-yellow.jpg';
import clothingImg from '../assets/banner-one.png';

// Configuration helper
const getStoreConfig = (type) => {
    const t = (type || "").toLowerCase();
    
    if (t.includes('barber')) return { icon: Scissors, image: barberImg, path: '/shops/barber', desc: 'Professional haircuts and styling', dynamicPath: (id) => `/shops/barber/${id}` };
    if (t.includes('tailor')) return { icon: Shirt, image: tailorImg, path: '/shops/tailor', desc: 'Custom fitting and alterations' };
    if (t.includes('computer') || t === 'electronics') return { icon: Monitor, image: computerImg, path: '/shops/computer', desc: 'Tech gear and repairs' };
    if (t.includes('bottle')) return { icon: Wine, image: bottleImg, path: '/shops/bottle', desc: 'Premium bottles and containers' };
    if (t.includes('cloth') || t === 'fashion') return { icon: Shirt, image: clothingImg, path: '/shops/clothing', desc: 'Fashion for everyone', dynamicPath: (id) => `/shops/clothing/${id}` };
    if (t.includes('drink') || t.includes('food')) return { icon: Coffee, image: drinkImg, path: '/shops/drink', desc: 'Refreshing beverages' };
    if (t.includes('massage')) return { icon: Activity, image: massageImg, path: '/shops/massage', desc: 'Relax and rejuvenate' };
    
    return { icon: ShoppingBag, image: clothingImg, path: '/shop', desc: 'Quality products' };
};

const checkIsOpen = (schedule) => {
  if (!schedule) return true; // Default to open if no schedule
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  if (!schedule.days.includes(currentDay)) return false;
  if (currentHour >= schedule.start && currentHour < schedule.end) return true;
  
  return false;
};

const ShopsHub = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores()
      .then(data => {
        // If data is empty (first run), maybe use seeds? Backend should return seeds.
        setStores(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  // Deduplicate stores if seeds + dynamic overlap? 
  // We will trust backend returns the accurate list including seeds (IDs 1-7).

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Shops</h1>
        <p className="text-xl text-gray-600">Explore our wide range of services and stores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stores.map((store) => {
          const config = getStoreConfig(store.store_type);
          
          // Determine path: use dynamic path if available and not one of the base seed stores (IDs 1-7)
          // Actually, for Clothing Shop, we want dynamic behavior even for ID 7? 
          // Current ClothingShop.jsx handles ID 7 internally.
          // For new stores (ID > 7), we MUST use dynamic path.
          
          let linkPath = config.path;
          if (config.dynamicPath && store.store_id > 7) {
             linkPath = config.dynamicPath(store.store_id);
          }

          // Default schedule (mocked for now as it's not in DB model yet)
          const isOpen = true; 

          return (
            <Link 
              key={store.store_id} 
              to={linkPath}
              className="group block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-primary overflow-hidden relative"
            >
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={store.image_url ? `http://localhost:8000${store.image_url}` : config.image} 
                  alt={store.store_name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <config.icon className="h-5 w-5" />
                    </div>
                    <h3 className="ml-3 text-lg font-bold text-gray-900">{store.store_name}</h3>
                  </div>
                  
                  {/* Open Status Indicator */}
                  <span className={`text-sm font-medium ${isOpen ? 'text-green-500' : 'text-red-500'}`}>
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{config.desc}</p>
                
                {/* Location Icon */}
                <div className="flex items-center justify-end">
                    <div className="p-1 rounded-full text-green-600 hover:bg-green-50 transition-colors" title="View Location">
                        <MapPin className="h-5 w-5" />
                    </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ShopsHub;
