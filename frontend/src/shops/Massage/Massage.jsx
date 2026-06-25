import React from 'react';
import ShopTemplate from '../../components/ShopTemplate';
import massageImg from '../../assets/massage/cupping.jpg';
import { fetchProducts } from '../../lib/api';

const Massage = () => {

  const categories = [
    "All Services",
    "Relaxation",
    "Therapeutic",
    "Cupping Therapy",
    "Sports Massage",
    "Acupuncture",
    "Reflexology"
  ];

  const categoryDescriptions = {
    "Relaxation": "Gentle techniques to soothe your mind and body.",
    "Therapeutic": "Targeted relief for chronic pain and muscle tension.",
    "Cupping Therapy": "Ancient technique to improve circulation and reduce inflammation.",
    "Sports Massage": "Optimize recovery and performance for athletes.",
    "Acupuncture": "Traditional healing using fine needles to balance energy.",
    "Reflexology": "Pressure point therapy for hands and feet to restore balance."
  };

  const fetchLogic = async () => {
    const all = await fetchProducts();
    
    return all.filter(p => {
        const text = (p.product_name + (p.product_desc||"")).toLowerCase();
        const isMassage = /massage|therapy|cupping|acupuncture|reflexology|spa|relax|healing/i.test(text);
        
        // Exclude retail items
        const isRetail = /laptop|shirt|bottle|drink/i.test(text);

        return (p.store_id === 6 || isMassage) && !isRetail;
    });
  }

  return (
    <ShopTemplate 
      customFetch={fetchLogic}
      title="Massage & Therapy"
      description="Holistic healing, massage therapy, and traditional Chinese medicine."
      bannerImage={massageImg}
      categories={categories}
      categoryDescriptions={categoryDescriptions}
      themeColor="green" // Valid values: 'amber' (default) or 'blue-gray'
    />
  );
};

export default Massage;
