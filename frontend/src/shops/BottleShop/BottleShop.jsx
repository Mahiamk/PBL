import React from 'react';
import ShopTemplate from '../../components/ShopTemplate';
import bottleImg from '../../assets/thermos-yellow.jpg';
import { fetchProducts } from '../../lib/api';

const BottleShop = () => {
    
  const categories = [
    "All Categories",
    "Water Bottle",
    "Thermos",
    "Glass Bottle",
    "Plastic Bottle",
    "Travel Mug",
    "Accessories"
  ];

  // const categoryDescriptions = {
  //   "Water Bottle": "Stay hydrated with our durable and stylish water bottles.",
  //   "Thermos": "Keep your drinks hot or cold for hours with our premium thermoses.",
  //   "Glass Bottle": "Eco-friendly and elegant glass bottles for everyday use.",
  //   "Plastic Bottle": "Lightweight and BPA-free plastic bottles for active lifestyles.",
  //   "Travel Mug": "The perfect companion for your daily commute or road trip.",
  //   "Accessories": "Caps, straws, and cleaning brushes to maintain your bottles."
  // };

  const fetchLogic = async () => {
      const all = await fetchProducts();
      
      return all.filter(p => {
          const text = (p.product_name + (p.product_desc||"")).toLowerCase();
          
          // Heuristic for bottle inventory
          const isBottle = /bottle|thermos|flask|mug|cup|glass|container|tumbler/i.test(text);
          // Safety check to exclude obviously wrong categories
          const isTech = /laptop|mouse|keyboard|screen|ram|ssd/i.test(text);
          const isClothing = /shirt|pant|dress|shoe/i.test(text);

          // Include Store ID 4 (Seeded shop) OR keywords
          return (p.store_id === 4 || isBottle) && !isTech && !isClothing;
      });
  };

  return (
    <ShopTemplate 
      customFetch={fetchLogic}
      title="Bottle Shop"
      description="Premium bottles, thermos, and containers for every occasion."
      bannerImage={bottleImg}
      categories={categories}
      // categoryDescriptions={categoryDescriptions}
    />
  );
};

export default BottleShop;
