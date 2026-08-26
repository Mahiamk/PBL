import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, getImageUrl } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ShoppingCart,
  Lightning,
  ShieldCheck,
  Check,
  Truck,
  Minus,
  Plus,
  CheckCircle,
} from '@phosphor-icons/react';

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
  const [selectedAddOns, setSelectedAddOns] = useState([]);
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
    'Maroon': '#800000',
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
          data.images_rel.forEach((img) => {
            if (img.color) {
              if (!foundColors.includes(img.color)) {
                foundColors.push(img.color);
              }
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
                parsedColors.forEach((c) => {
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
    if (selectedAddOns.some((a) => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
      const finalUnitPrice = Number(product.product_price) + addOnsTotal;
      const imageToUse = (selectedColor && colorImageMap[selectedColor]) || product.image_url;
      const resolvedImage = getImageUrl(imageToUse);

      const productToAdd = {
        ...product,
        image_url: resolvedImage,
        product_price: finalUnitPrice,
        selectedOption: selectedColor,
        customization: customOptions
          ? {
              sweetness,
              addOns: selectedAddOns,
              notes: specialNotes,
            }
          : null,
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
      const imageToUse =
        selectedColor && colorImageMap[selectedColor]
          ? colorImageMap[selectedColor]
          : product.image_url || 'https://via.placeholder.com/400';
      const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
      const finalUnitPrice = Number(product.product_price) + addOnsTotal;

      const itemToBuy = {
        product_id: Number(product.product_id || product.id),
        product_name: product.product_name || product.name,
        product_price: finalUnitPrice,
        quantity: Number(quantity),
        image_url: imageToUse,
        selected_option: selectedColor,
        selectedOption: selectedColor,
        cartId: `buynow-${product.product_id || product.id}-${Date.now()}`,
        customization: customOptions
          ? {
              sweetness,
              addOns: selectedAddOns,
              notes: specialNotes,
            }
          : null,
      };

      const orderData = {
        items: [itemToBuy],
        paymentMethod: 'Online Payment',
      };

      await addOrder(orderData);

      navigate('/invoice', {
        state: {
          order: {
            ...orderData,
            items: [itemToBuy].map((i) => ({ ...i, price: i.product_price })),
            customer_name: user?.fullName || 'Valued Customer',
            email: user?.email,
            order_id: 'NEW',
          },
        },
      });
    } catch (error) {
      console.error('Buy Now failed:', error);
      alert('Failed to process order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#dfd5da] border-t-[#1d1d1f] animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Product Not Found</h2>
        <p className="text-xs text-[#86868b] mb-6">The product you are looking for is no longer available.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold active:scale-95 transition-all shadow-xs"
        >
          <ArrowLeft size={16} weight="duotone" />
          <span>Back to Catalog</span>
        </button>
      </div>
    );
  }

  const cleanDescription = product.product_desc
    ? product.product_desc.replace(/<!-- COLORS:(.*?) -->/g, '')
    : '';

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 sm:mb-8 inline-flex items-center space-x-2 text-xs font-bold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
        >
          <ArrowLeft size={15} weight="bold" />
          <span>Back to Products</span>
        </button>

        <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Product Image Section */}
          <div className="lg:col-span-6 bg-[#fbfbfd] p-6 sm:p-10 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#e8e8ed]">
            <img
              src={
                selectedColor && colorImageMap[selectedColor]
                  ? getImageUrl(colorImageMap[selectedColor])
                  : getImageUrl(product.image_url)
              }
              alt={`${product.product_name} - ${selectedColor || 'Default'}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/bowl-white.jpg';
              }}
              className="max-h-[280px] sm:max-h-[380px] lg:max-h-[420px] w-auto max-w-full object-contain mx-auto transition-all duration-300 drop-shadow-xs hover:scale-105"
            />
          </div>

          {/* Product Details Section */}
          <div className="lg:col-span-6 p-5 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f5edf0] text-[#594951] border border-[#e6dadf]">
                  <CheckCircle size={14} weight="duotone" className="text-emerald-600" />
                  <span>In Stock</span>
                </span>
                <span className="text-xs text-[#86868b] font-medium">SKU: AIU-{product.product_id}</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight mb-2">
                {product.product_name}
              </h1>

              <div className="flex items-baseline space-x-3 mb-5 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-black text-[#1d1d1f] tracking-tight">
                  RM {Number(product.product_price).toFixed(2)}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed mb-6 sm:mb-8 whitespace-pre-wrap">
                {cleanDescription || 'High-quality product curated for the AIU campus community.'}
              </div>

              {/* Custom Options (For Drink Shops) */}
              {customOptions && (
                <div className="mb-6 sm:mb-8 space-y-5">
                  {customOptions.sweetness && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-2.5">
                        Sweetness Level
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Original', 'Sweet', 'Less Sweet', 'No Sugar'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setSweetness(level)}
                            className={`py-2 px-3 rounded-full text-xs font-semibold border transition-all ${
                              sweetness === level
                                ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs'
                                : 'bg-[#f5f5f7] text-[#594951] border-[#e8e8ed] hover:bg-[#f5edf0]'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {customOptions.addOns && customOptions.addOns.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-2.5">
                        Available Add-ons
                      </h3>
                      <div className="space-y-2">
                        {customOptions.addOns.map((addon, idx) => {
                          const isSelected = selectedAddOns.some((a) => a.name === addon.name);
                          return (
                            <div
                              key={idx}
                              onClick={() => handleAddOnToggle(addon)}
                              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#1d1d1f] bg-[#f5edf0]/60 ring-1 ring-[#1d1d1f]'
                                  : 'border-[#e8e8ed] hover:border-[#dfd5da]'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                                      : 'border-[#dfd5da]'
                                  }`}
                                >
                                  {isSelected && <Check size={12} weight="bold" />}
                                </div>
                                <span className="text-xs font-medium text-[#1d1d1f]">{addon.name}</span>
                              </div>
                              <span className="text-xs font-bold text-[#8e6e7d]">+RM {addon.price.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-2">
                      Special Notes (Optional)
                    </h3>
                    <textarea
                      className="w-full p-3.5 border border-[#dfd5da] rounded-2xl bg-[#f5f5f7] focus:bg-white focus:ring-2 focus:ring-[#1d1d1f]/10 focus:border-[#1d1d1f] outline-none text-xs text-[#1d1d1f] resize-none transition-all"
                      rows="2"
                      placeholder="Add any specific preparation requests..."
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Color Selection UI */}
              {!customOptions && availableColors.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f]">Color Option</h3>
                    <span className="text-xs text-[#86868b] font-medium">{selectedColor}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    {availableColors.map((colorName) => {
                      const hex = AVAILABLE_COLORS_MAP[colorName] || '#CCCCCC';
                      const isSelected = selectedColor === colorName;

                      return (
                        <button
                          key={colorName}
                          onClick={() => setSelectedColor(colorName)}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-[#1d1d1f] ring-offset-2 scale-110'
                              : 'hover:scale-105 border-[#e8e8ed]'
                          }`}
                          style={{ backgroundColor: hex }}
                          title={colorName}
                          aria-label={colorName}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              weight="bold"
                              className={colorName === 'White' || colorName === 'Yellow' ? 'text-black' : 'text-white'}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bottom Bar */}
            <div className="border-t border-[#f0eaed] pt-5 sm:pt-6 mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6e6e73]">Quantity</span>
                <div className="inline-flex items-center border border-[#dfd5da] rounded-full overflow-hidden bg-[#f5f5f7]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 sm:p-2.5 hover:bg-[#eee0e5] text-[#1d1d1f] active:scale-95 transition-all"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} weight="bold" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-[#1d1d1f]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 sm:p-2.5 hover:bg-[#eee0e5] text-[#1d1d1f] active:scale-95 transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-full bg-[#f5edf0] hover:bg-[#eee0e5] text-[#594951] border border-[#e6dadf] font-semibold text-xs active:scale-95 transition-all shadow-xs"
                >
                  <ShoppingCart size={16} weight="duotone" />
                  <span>Add to Bag</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white font-semibold text-xs active:scale-95 transition-all shadow-xs"
                >
                  <Lightning size={16} weight="duotone" />
                  <span>Direct Checkout</span>
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-[#f0eaed] grid grid-cols-2 gap-3 text-[#86868b] text-[10px] sm:text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <Truck size={15} weight="duotone" className="text-[#8e6e7d] shrink-0" />
                  <span>Campus Pickup / Delivery</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck size={15} weight="duotone" className="text-[#8e6e7d]" />
                  <span>Verified AIU Merchant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
