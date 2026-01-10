import React from 'react';
import ShopTemplate from '../../components/ShopTemplate';
import drinkImg from '../../assets/drinkshop/drink.webp';
import { fetchProducts } from '../../lib/api';

const DrinkShop = () => {
    
  const categories = [
    "All Categories",
    "Coffee",
    "Tea",
    "Cocoa",
    "Milk",
    "Soda",
    "Waffle",
    "Water"
  ];

  const categoryDescriptions = {
    "All Categories": "Discover our carefully selected coffee made with premium ingredients",
    "Coffee": "Discover our carefully selected coffee made with premium ingredients",
    "Tea": "Aromatic tea blends to soothe your soul and awaken your senses",
    "Cocoa": "Rich and velvety cocoa drinks for the ultimate chocolate experience",
    "Milk": "Fresh and creamy milk beverages, perfect for any time of day",
    "Soda": "Fizzy and refreshing sodas in a variety of exciting flavors",
    "Waffle": "Crispy on the outside, fluffy on the inside - the perfect treat",
    "Water": "Pure and refreshing hydration for a healthy lifestyle"
  };

  const fetchLogic = async () => {
      const all = await fetchProducts();
      
      return all.filter(p => {
          const text = (p.product_name + (p.product_desc || "")).toLowerCase();
          const isDrink = /drink|juice|soda|water|bottle|wine|beer|alcohol|beverage|coffee|tea|cocoa|milk|waffle|dessert|latte|cappuccino/i.test(text);
          const isTech = /laptop|unifi|computer|mouse|keyboard/i.test(text);

          // Allow implicit drink shop IDs (5, 12, 22) or if Store Type matches 'Drink' / 'Food'
          const isDrinkStore = [5, 12, 22].includes(p.store_id) || (p.store && /drink|food|waffle|dessert/i.test(p.store.store_type || ""));

          return (isDrinkStore || isDrink) && !isTech;
      });
  }
  return (
    <ShopTemplate 
      customFetch={fetchLogic}
      title="Drink Shop"
      description="Refreshing beverages, juices, and smoothies to quench your thirst."
      bannerImage={drinkImg}
      categories={categories} // Enables sidebar
      categoryDescriptions={categoryDescriptions} // Pass custom descriptions 
    />
  );
};

export default DrinkShop;
