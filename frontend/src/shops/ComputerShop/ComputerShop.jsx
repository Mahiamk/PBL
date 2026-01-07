import React from 'react';
import ShopTemplate from '../../components/ShopTemplate';
import computerImg from '../../assets/computershop/computer-shop.jpg';
import { fetchProducts } from '../../lib/api';

const ComputerShop = () => {
  const fetchLogic = async () => {
      const all = await fetchProducts();
      
      // Filter logic:
      // 1. Explicitly from Computer Shop (Store ID 1)
      // 2. OR matches tech-related keywords (for new vendors)
      return all.filter(p => {
          const text = (p.product_name + (p.product_desc || "")).toLowerCase();
          const isTech = /macbook|laptop|computer|dell|hp|asus|acer|mouse|keyboard|monitor|screen|ram|ssd|usb/i.test(text);
          
          return p.store_id === 1 || isTech;
      });
  } 

  return (
    <ShopTemplate 
      customFetch={fetchLogic}
      title="Computer Shop"
      description="Laptops, desktops, components, and repairs. Your one-stop shop for tech."
      bannerImage={computerImg}
    />
  );
};

export default ComputerShop;
