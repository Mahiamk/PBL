import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../lib/api';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';

const ShopTemplate = ({ 
  storeId, 
  title, 
  description, 
  bannerImage, 
  children, 
  customFetch, 
  categories, 
  categoryDescriptions,
  themeColor = 'amber' // Default theme color
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories && categories.length > 0 ? categories[0] : null);

  // Sync selectedCategory when categories prop loads
  useEffect(() => {
    if (categories && categories.length > 0 && (!selectedCategory || !categories.includes(selectedCategory))) {
        setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    setLoading(true);
    if (customFetch) {
        customFetch()
            .then(setProducts)
            .catch(console.error)
            .finally(() => setLoading(false));
    } else if (storeId) {
      fetchProducts(storeId)
        .then(setProducts)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [storeId, customFetch]);

  // Combined Searching + Filtering Logic
  const filteredProducts = products.filter(product => {
    // 1. Search Match
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.product_desc && product.product_desc.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    // 2. Category Match (if active)
    if (categories && selectedCategory && selectedCategory !== 'All Categories') {
        const catName = selectedCategory.toLowerCase();
        
        // Priority: Check explicit backend Category match
        if (product.category && product.category.category_name) {
            if (product.category.category_name.toLowerCase() === catName) {
                return true;
            }
        }
        
        // Fallback: Check text content (legacy behavior)
        const textToSearch = (product.product_name + (product.product_desc || "")).toLowerCase();
        if (textToSearch.includes(catName)) {
            return true;
        }
        
        return false;
    }
    return true;
  });

  const getCurrentDescription = () => {
    if (categoryDescriptions && categoryDescriptions[selectedCategory]) {
      return categoryDescriptions[selectedCategory];
    }
    return `Explore our selection of ${selectedCategory}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // --- Theme Logic ---
  // We construct class strings based on the themeColor prop.
  // Note: Tailwind must see full class names to purge correctly. 
  // If 'blue-gray' maps to slate/gray, or we use a map.
  
  const themeMap = {
      'amber': {
          activeBg: 'bg-amber-600',
          activeText: 'text-amber-600',
          activeBorder: 'border-amber-600',
          hoverBorder: 'hover:border-amber-300',
          hoverText: 'hover:text-amber-600',
          lightBg: 'bg-amber-50',
          gradientFrom: 'from-amber-400',
          gradientTo: 'to-amber-600',
          ring: 'focus:ring-amber-500',
          border: 'focus:border-amber-500',
          loading: 'border-amber-600'
      },
      'blue-gray': {
          activeBg: 'bg-slate-600', 
          activeText: 'text-slate-600',
          activeBorder: 'border-slate-600',
          hoverBorder: 'hover:border-slate-300',
          hoverText: 'hover:text-slate-600',
          lightBg: 'bg-slate-50',
          gradientFrom: 'from-slate-400',
          gradientTo: 'to-slate-600',
          ring: 'focus:ring-slate-500',
          border: 'focus:border-slate-500',
          loading: 'border-slate-600'
      },
      'green': {
          activeBg: 'bg-green-600', 
          activeText: 'text-green-600',
          activeBorder: 'border-green-600',
          hoverBorder: 'hover:border-green-300',
          hoverText: 'hover:text-green-600',
          lightBg: 'bg-green-50',
          gradientFrom: 'from-green-400',
          gradientTo: 'to-green-600',
          ring: 'focus:ring-green-500',
          border: 'focus:border-green-500',
          loading: 'border-green-600'
      }
  };

  const theme = themeMap[themeColor] || themeMap['amber'];

  return (
    <div className="bg-white min-h-screen">
      {/* Banner Section */}
      <div className="relative bg-gray-900 text-white">
        {bannerImage && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={bannerImage} alt={title} className="w-full h-full object-cover opacity-40" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 text-xl max-w-3xl mx-auto text-gray-300">{description}</p>
        </div>
      </div>

      {children && (
        <div className="bg-gray-50 border-b border-gray-200">
          {children}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar (Width reduced to w-48) */}
            {categories && categories.length > 0 && (
                <div className="hidden lg:block w-48 flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 sticky top-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Categories</h3>
                        <div className="flex flex-col space-y-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedCategory === cat
                                        ? `${theme.lightBg} ${theme.activeText}`
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1">

                {/* --- Combined Categories + Search Bar (Flex Row) --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-0 gap-4">
                    
                    {/* Category Pills */}
                    {categories && categories.length > 0 ? (
                        <div className="flex-1 w-full sm:w-auto">
                            <div className="flex flex-wrap gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                                            selectedCategory === cat
                                            ? `${theme.activeBg} text-white ${theme.activeBorder} shadow-md`
                                            : `bg-white text-gray-600 border-gray-200 ${theme.hoverBorder} ${theme.hoverText}`
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : <div className="flex-1"></div>}

                    {/* Search Bar (Aligned right) */}
                    <div className="relative w-full sm:w-64 flex-shrink-0 self-start sm:self-center">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 ${theme.ring} ${theme.border} sm:text-sm`}
                            placeholder={`Search in ${title}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- Dynamic Category Header --- */}
                {selectedCategory && selectedCategory !== 'All Categories' && (
                  <div className="flex flex-col items-center justify-center py-10 mb-6">
                    <h2 className="text-4xl font-semibold text-gray-800 tracking-tight">
                      {selectedCategory}
                    </h2>
                    <div className={`h-1 w-20 bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} rounded-full my-4`}></div>
                    <p className="text-gray-500 text-lg max-w-2xl text-center leading-relaxed">
                      {getCurrentDescription()}
                    </p>
                  </div>
                )}

                {/* --- Products Grid --- */}
                {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-8">
                    <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                </div>
                ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-6 mt-6">
                    {filteredProducts.map((product) => (
                    <ProductCard 
                        key={product.product_id} 
                        product={product} 
                        image={product.image_url || 'https://via.placeholder.com/300'} 
                    />
                    ))}
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShopTemplate;
