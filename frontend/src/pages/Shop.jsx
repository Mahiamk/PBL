import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import thermosYellow from '../assets/thermos-yellow.jpg';
import thermosBlack from '../assets/thermos-black.jpg';
import vaseGreen from '../assets/vase-green.jpg';
import bowlWhite from '../assets/bowl-white.jpg';
import barberCut from '../assets/barber-shop/coolcut.jpg';
import massageCupping from '../assets/massage/cupping.jpg';
import tailorService from '../assets/tailor/tailor.webp';

const imageMap = {
  3: thermosYellow,
  4: thermosBlack,
  5: vaseGreen,
  6: barberCut,
  7: massageCupping,
  8: tailorService,
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchQuery = searchParams.get('q') || '';

  // const setSearchQuery = (query) => {
  //   if (query) {
  //     setSearchParams({ q: query });
  //   } else {
  //     setSearchParams({});
  //   }
  // };

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(product => 
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">All Products</h2>
          {/* <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
                image={product.image_url || imageMap[product.product_id] || bowlWhite} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
