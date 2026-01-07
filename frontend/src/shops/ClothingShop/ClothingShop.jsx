import React from 'react';
import { useParams } from 'react-router-dom';
import ShopTemplate from '../../components/ShopTemplate';
import clothingImg from '../../assets/banner-one.jpg';
import { fetchProducts } from '../../lib/api';

const ClothingShop = () => {
  const { storeId } = useParams();

  const categories = [
    "All Categories",
    "Men's Wear",
    "Women's Wear",
    "Kids' Fashion",
    "Shoes",
    "Accessories",
    "Sportswear"
  ];

  const categoryDescriptions = {
    "Men's Wear": "Stylish and comfortable clothing designed for the modern man.",
    "Women's Wear": "Elegant and trendy fashion choices for every occasion.",
    "Kids' Fashion": "Durable, fun, and comfortable styles for your little ones.",
    "Shoes": "Step up your game with our wide range of footwear.",
    "Accessories": "Complete your look with the perfect bags, belts, and hats.",
    "Sportswear": "High-performance gear for your active lifestyle."
  };

  const fetchLogic = async () => {
      const all = await fetchProducts();
      
      return all.filter(p => {
          const text = (p.product_name + (p.product_desc || "")).toLowerCase();
          
          // Heuristics for clothing items
          const isClothing = /shirt|pant|dress|shoe|hat|belt|jacket|sock|tuxedo|saree|kurta|scarf|textile|fabric|cloth/i.test(text);
          const isTech = /laptop|mouse|keyboard|screen|ssd|ram/i.test(text);

          // Return items from Store 7 or matching keywords, excluding tech
          return (p.store_id === 7 || isClothing) && !isTech;
      });
  }

  return (
    <ShopTemplate 
      storeId={storeId}
      customFetch={storeId ? null : fetchLogic}
      title={storeId ? "Clothing Store" : "Clothing Shop"}
      description="Fashion for men, women, and children. Discover the latest trends."
      bannerImage={clothingImg}
      categories={categories}
      categoryDescriptions={categoryDescriptions}
    />
  );
};

export default ClothingShop;
