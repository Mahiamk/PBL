import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShoppingCart, Package, Tag, Check } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addOrder } = useOrder();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  
  // Drink Customization State
  const [customOptions, setCustomOptions] = useState(null);
  const [sweetness, setSweetness] = useState('Original');
  const [selectedAddOns, setSelectedAddOns] = useState([]); // [{name, price}]
  const [specialNotes, setSpecialNotes] = useState('');

  // Color State
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorImageMap, setColorImageMap] = useState({});

  const AVAILABLE_COLORS_MAP = {
    'White': '#FFFFFF',
    'Black': '#000000',
    'Yellow': '#FCD34D',
    'Red': '#EF4444',
    'Blue': '#3B82F6',
    'Green': '#10B981',
    'Gray': '#6B7280',
    'Navy': '#000080',
    'Pink': '#FFC0CB',
    'Purple': '#800080',
    'Orange': '#FFA500',
    'Brown': '#A52A2A',
    'Beige': '#F5F5DC',
    'Maroon': '#800000'
  };

  useEffect(() => {
    fetchProductById(id)
      .then((data) => {
        setProduct(data);
        
        // Parse Custom Options (For Drink Shops)
        if (data.custom_options) {
            try {
                const parsed = JSON.parse(data.custom_options);
                setCustomOptions(parsed);
                // Reset defaults
                setSweetness('Original'); 
                setSelectedAddOns([]);
            } catch (e) {
                console.error("Failed to parse custom options", e);
            }
        }
        
        let foundColors = [];
        let map = {};

        // 1. Check Product Images (Backend Support)
        if (data.images_rel && Array.isArray(data.images_rel) && data.images_rel.length > 0) {
            data.images_rel.forEach(img => {
                if (img.color) {
                    if (!foundColors.includes(img.color)) {
                        foundColors.push(img.color);
                    }
                    // Prioritize manually uploaded images for colors
                    // If multiple images for same color, use the one marked is_main or first one
                    if (!map[img.color] || img.is_main) {
                        map[img.color] = img.image_url;
                    }
                }
            });
        }

        // 2. Parse Colors from Description (Legacy/Fallback)
        if (data.product_desc) {
            const match = data.product_desc.match(/<!-- COLORS:(.*?) -->/);
            if (match && match[1]) {
                try {
                    const parsedColors = JSON.parse(match[1]);
                    if (Array.isArray(parsedColors)) {
                       parsedColors.forEach(c => {
                           if (!foundColors.includes(c)) foundColors.push(c);
                       });
                    }
                } catch (e) {
                    console.error("Failed to parse colors", e);
                }
            }
        }

        // 3. Defaults for Clothing Store if no colors found
        if (foundColors.length === 0 && data.store_id === 7) {
            foundColors = ['White', 'Black', 'Red', 'Blue', 'Green', 'Gray'];
        }

        if (foundColors.length > 0) {
            setAvailableColors(foundColors);
            setSelectedColor(foundColors[0]); 
        }
        
        setColorImageMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddOnToggle = (addon) => {
    if (selectedAddOns.some(a => a.name === addon.name)) {
        setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name));
    } else {
        setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
      const finalUnitPrice = Number(product.product_price) + addOnsTotal;

      const productToAdd = {
          ...product,
          product_price: finalUnitPrice, // Override price for cart
          selectedOption: selectedColor, // Legacy clothing support
          // New Drink Shop support
          customization: customOptions ? {
              sweetness,
              addOns: selectedAddOns,
              notes: specialNotes
          } : null
      };
      
      addToCart(productToAdd, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (!user) {
        navigate('/login', { state: { from: `/product/${id}` } });
        return;
    }

    try {
        const imageToUse = (selectedColor && colorImageMap[selectedColor]) ? colorImageMap[selectedColor] : (product.image_url || 'https://via.placeholder.com/400');
        const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
        const finalUnitPrice = Number(product.product_price) + addOnsTotal;

        const itemToBuy = {
            // Ensure we use correct field names matching the API response
            product_id: Number(product.product_id || product.id),
            product_name: product.product_name || product.name,
            product_price: finalUnitPrice,
            quantity: Number(quantity),
            image_url: imageToUse,
            selected_option: selectedColor, // Map to snake_case for consistency if needed by backend, though backend usually takes standardized OrderItem
            selectedOption: selectedColor, // Legacy prop
            cartId: `buynow-${product.product_id || product.id}-${Date.now()}`,
            customization: customOptions ? {
                sweetness,
                addOns: selectedAddOns,
                notes: specialNotes
            } : null
        };

        const orderData = {
            items: [itemToBuy],
            paymentMethod: 'Online Payment' 
        };

        // Create the order immediately as per "Direct Checkout" requirement
        await addOrder(orderData);
        
        navigate('/invoice', { 
            state: { 
                order: {
                    ...orderData,
                    items: [itemToBuy].map(i => ({...i, price: i.product_price})),
                    customer_name: user?.fullName || "Valued Customer",
                    email: user?.email,
                    order_id: "NEW"
                }
            } 
        });
    } catch (error) {
        console.error("Buy Now failed:", error);
        alert("Failed to process order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <button 
          onClick={() => navigate(-1)}
          className="text-primary hover:text-primary-dark flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  // Hide the technical metadata from the visible description
  const cleanDescription = product.product_desc 
    ? product.product_desc.replace(/<!-- COLORS:(.*?) -->/g, '')
    : '';

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Shop
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden lg:flex">
          {/* Image Section */}
          <div className="lg:w-1/2 bg-gray-100 relative min-h-[400px]">
            <img 
              src={(selectedColor && colorImageMap[selectedColor]) ? colorImageMap[selectedColor] : (product.image_url || 'https://via.placeholder.com/600x600')} 
              alt={`${product.product_name} - ${selectedColor || 'Default'}`} 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            />
          </div>

          {/* Details Section */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.product_name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  In Stock
                </span>
              </div>
              
              <p className="text-2xl font-bold text-primary mb-6">${product.product_price}</p>
              
              <div className="prose prose-sm text-gray-500 mb-8 whitespace-pre-wrap">
                {cleanDescription || "No description available."}
              </div>

              {/* --- DRINK CUSTOMIZATIONS --- */}
              {customOptions && (
                  <div className="mb-8 space-y-8 animate-fade-in-up">
                      {/* Sweetness */}
                      {customOptions.sweetness && (
                          <div>
                              <h3 className="text-sm font-bold text-gray-900 mb-3">Sweetness Level</h3>
                              <div className="flex flex-wrap gap-2">
                                  {['Original', 'Sweet', 'Less Sweet', 'No Sugar'].map(level => (
                                      <button
                                          key={level}
                                          onClick={() => setSweetness(level)}
                                          className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                                              sweetness === level 
                                              ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-md transform scale-105' 
                                              : 'bg-gray-100/80 text-gray-600 border-transparent hover:bg-gray-200'
                                          }`}
                                      >
                                          {level}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* Add-ons */}
                      {customOptions.addOns && customOptions.addOns.length > 0 && (
                          <div>
                              <h3 className="text-sm font-bold text-gray-900 mb-3">Available Add-ons</h3>
                              <div className="space-y-3">
                                  {customOptions.addOns.map((addon, idx) => {
                                      const isSelected = selectedAddOns.some(a => a.name === addon.name);
                                      return (
                                          <div 
                                            key={idx}
                                            onClick={() => handleAddOnToggle(addon)}
                                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${
                                                isSelected ? 'border-[#E67E22] bg-[#FFF8F0] ring-1 ring-[#E67E22]' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                          >
                                              <div className="flex items-center">
                                                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-[#E67E22] border-[#E67E22]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                                  </div>
                                                  <div>
                                                      <span className={`font-medium block ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{addon.name}</span>
                                                  </div>
                                              </div>
                                              <span className="font-bold text-[#E67E22]">+RM {addon.price.toFixed(2)}</span>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      )}
                      
                      {/* Special Notes */}
                      <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-3">Special Notes (Optional)</h3>
                          <textarea 
                            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all resize-none text-sm"
                            rows="3"
                            placeholder="Add any special requests or notes..."
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                          />
                      </div>
                  </div>
              )}

              {/* --- COLOR SELECTION UI --- */}
              {!customOptions && availableColors.length > 0 && (
                  <div className="mb-8">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                      <div className="flex items-center space-x-3">
                          {availableColors.map(colorName => {
                              const hex = AVAILABLE_COLORS_MAP[colorName] || '#CCCCCC';
                              const isSelected = selectedColor === colorName;
                              
                              return (
                                  <button
                                      key={colorName}
                                      onClick={() => setSelectedColor(colorName)}
                                      className={`
                                          w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                                          ${isSelected ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-105'}
                                          ${colorName === 'White' ? 'border-gray-200' : 'border-transparent'}
                                      `}
                                      style={{ backgroundColor: hex }}
                                      title={colorName}
                                  >
                                      {isSelected && (
                                          <Check className={`w-5 h-5 ${colorName === 'White' || colorName === 'Yellow' ? 'text-black' : 'text-white'}`} />
                                      )}
                                  </button>
                              );
                          })}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Selected: <span className="font-medium text-gray-900">{selectedColor}</span></p>
                  </div>
              )}

              <div className="border-t border-gray-200 pt-8 mt-8">
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-gray-700 font-medium">Quantity</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 border-r border-gray-300 hover:bg-gray-50 text-gray-600"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      className="w-12 text-center border-none focus:ring-0 text-gray-900 py-1"
                      value={quantity}
                      readOnly
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 border-l border-gray-300 hover:bg-gray-50 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
