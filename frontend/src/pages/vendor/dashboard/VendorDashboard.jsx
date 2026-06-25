import React, { useEffect, useState } from 'react';
import { fetchVendorDashboard } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import TechDashboard from '../tech/Dashboard';
import BarberDashboard from '../barber/Dashboard';
import TailorDashboard from '../tailor/Dashboard';
import BottleShopDashboard from '../bottleshop/BottleShopDashboard';
import DrinkShopDashboard from '../drinkshop/Dashboard';
import MassageDashboard from '../massage/Dashboard';
import ClothesShopDashboard from '../clothesshop/Dashboard';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.userId) {
      fetchVendorDashboard(user.userId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!data) return <div>Error loading dashboard</div>;

  const store = data.store_info || {};
  const storeId = store.store_id;
  const storeType = store.store_type;

  // Route based on Store Type (Registration Value) or ID (Legacy/Seed Value)
  // Passing 'initialData' prevents the child dashboard from double-fetching API
  
  if (storeType === 'ComputerShop' || storeId === 1) 
    return <TechDashboard initialData={data} />;
  
  if (storeType === 'BarberShop' || storeId === 2) 
    return <BarberDashboard initialData={data} />;
  
  if (storeType === 'Tailor' || storeId === 3) 
    return <TailorDashboard initialData={data} />;
  
  if (storeType === 'BottleShop' || storeId === 4) 
    return <BottleShopDashboard initialData={data} />;
  
  if (storeType === 'DrinkShop' || storeId === 5) 
    return <DrinkShopDashboard initialData={data} />;
  
  if (storeType === 'Massage' || storeId === 6) 
    return <MassageDashboard initialData={data} />;
  
  if (storeType === 'ClothingShop' || storeId === 7) 
    return <ClothesShopDashboard initialData={data} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Unknown Store Type</h2>
        <p className="text-gray-500">Store ID: {storeId}</p>
        <p className="text-gray-400">Type: {storeType}</p>
      </div>
    </div>
  );
};

export default VendorDashboard;
