import React, { useState, useEffect, useRef } from 'react';
import { createProduct, fetchCategories, uploadImage, fetchStoreById, getImageUrl } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { 
  Camera, 
  Plus, 
  Trash, 
  X, 
  CheckCircle, 
  WarningCircle, 
  Image as ImageIcon,
  Tag,
  CurrencyDollar,
  Package
} from '@phosphor-icons/react';

export default function ProductNewForm({ onSuccess, onCancel, storeId }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    product_price: '',
    weight: '',
    category_id: '',
    tax_class: 'Taxable Goods',
    product_desc: '',
    images: [],
    url_key: '',
    meta_title: '',
    meta_desc: '',
    status: 'active',
    visibility: 'catalog_search',
    manage_stock: true,
    stock_availability: 'in_stock',
    stock_quantity: '',
    store_id: storeId || user?.storeId || '',
  });
  
  // Custom Options State (Drink Shops)
  const [hasSweetness, setHasSweetness] = useState(true);
  const [addOns, setAddOns] = useState([]);
  const [newAddOn, setNewAddOn] = useState({ name: '', price: '' });

  // Upload State
  const [activeUploadUrl, setActiveUploadUrl] = useState('');
  const [activeColor, setActiveColor] = useState('');
  const [productImages, setProductImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDrinkShop = storeInfo?.store_type?.toLowerCase().includes('food') || 
                      storeInfo?.store_type?.toLowerCase().includes('drink') ||
                      storeInfo?.store_name?.toLowerCase().includes('drink');

  useEffect(() => {
    const currentStoreId = storeId || user?.storeId;
    if (currentStoreId) {
      fetchCategories(currentStoreId).then(setCategories).catch(console.error);
      fetchStoreById(currentStoreId).then(setStoreInfo).catch(console.error);
    } else {
      fetchCategories().then(setCategories).catch(console.error);
    }
  }, [storeId, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
  const handleAddOnAdd = () => {
    if(newAddOn.name && newAddOn.price) {
      setAddOns([...addOns, { ...newAddOn, price: parseFloat(newAddOn.price) }]);
      setNewAddOn({ name: '', price: '' });
    }
  };

  const handleRemoveAddOn = (index) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await uploadImage(file);
        setActiveUploadUrl(data.url);
        setActiveColor(''); 
      } catch (err) {
        console.error("Upload failed", err);
        setError("Failed to upload image");
      }
    }
  };

  const handleConfirmImageWithColor = () => {
    if (!activeUploadUrl) return;
    const finalColor = activeColor.trim() ? activeColor.trim() : 'Default';
    
    setProductImages(prev => [
      ...prev,
      {
        image_url: activeUploadUrl,
        color: finalColor,
        is_main: prev.length === 0
      }
    ]);
    setActiveUploadUrl('');
    setActiveColor('');
  };

  const removeImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let customOptions = null;
      if (isDrinkShop) {
        customOptions = {
          sweetness_levels: hasSweetness ? ["Normal", "Less Sweet", "No Sugar"] : [],
          add_ons: addOns
        };
      }

      const payload = {
        ...formData,
        product_price: parseFloat(formData.product_price),
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity, 10) : 0,
        weight: formData.weight ? parseFloat(formData.weight) : 0,
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        store_id: parseInt(formData.store_id || user?.storeId, 10),
        images: productImages.map(img => img.image_url),
        image_url: productImages.length > 0 ? productImages[0].image_url : null,
        product_images: productImages,
        custom_options: customOptions
      };

      await createProduct(payload);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs p-6 md:p-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center pb-6 border-b border-[#e8e8ed] mb-6">
        <div>
          <span className="text-[10px] font-bold text-[#8e6e7d] uppercase tracking-widest block mb-1">
            New Listing
          </span>
          <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">Create Product / Item</h2>
          <p className="text-xs text-[#6e6e73]">Add catalog items with photos, variants, stock, and pricing.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">Product Name *</label>
              <input
                type="text"
                name="product_name"
                required
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-2xl text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:border-[#8e6e7d] transition-all"
                placeholder="e.g. AIU Heritage Navy Hoodie"
                value={formData.product_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">Price (RM) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="product_price"
                  required
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-2xl text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:border-[#8e6e7d] transition-all font-bold"
                  placeholder="0.00"
                  value={formData.product_price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-2xl text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:border-[#8e6e7d] transition-all"
                  placeholder="25"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">SKU Code</label>
                <input
                  type="text"
                  name="sku"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-2xl text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:border-[#8e6e7d] transition-all"
                  placeholder="AIU-PRD-001"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">Category</label>
                <select
                  name="category_id"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-2xl text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:border-[#8e6e7d] transition-all cursor-pointer"
                  value={formData.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">Description</label>
              <textarea
                name="product_desc"
                rows="4"
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-2xl text-xs bg-[#f5f5f7] focus:bg-white focus:outline-none focus:border-[#8e6e7d] transition-all"
                placeholder="Details, specifications, ingredients, or sizing guide..."
                value={formData.product_desc}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* Right Column: Media Upload & Variants */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">Product Photos</label>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />

              {!activeUploadUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e8e8ed] rounded-3xl p-6 text-center cursor-pointer hover:border-[#8e6e7d] hover:bg-[#fbfbfd] transition-all"
                >
                  <Camera size={32} weight="duotone" className="mx-auto text-[#8e6e7d] mb-2" />
                  <span className="text-xs font-bold text-[#1d1d1f] block">Upload Product Image</span>
                  <span className="text-[10px] text-[#86868b]">PNG, JPG, WebP up to 5MB</span>
                </div>
              ) : (
                <div className="p-4 bg-[#f5edf0]/40 rounded-3xl border border-[#e8e8ed] space-y-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={getImageUrl(activeUploadUrl)} 
                      alt="Uploaded" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/bowl-white.jpg';
                      }}
                      className="w-14 h-14 object-cover rounded-2xl border border-[#e8e8ed]" 
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#1d1d1f] block">Image Uploaded</span>
                      <input 
                        type="text" 
                        placeholder="Color or Variant tag (e.g. Navy, Black)" 
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 border border-[#e8e8ed] rounded-xl text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button 
                      type="button" 
                      onClick={() => setActiveUploadUrl('')} 
                      className="px-3 py-1 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f]"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleConfirmImageWithColor}
                      className="px-3 py-1 bg-[#1d1d1f] text-white rounded-full text-xs font-semibold hover:bg-[#333336]"
                    >
                      Add to Gallery
                    </button>
                  </div>
                </div>
              )}

              {/* Gallery List */}
              {productImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {productImages.map((img, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed]">
                      <div className="flex items-center space-x-2 truncate">
                        <img 
                          src={getImageUrl(img.image_url)} 
                          alt="" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/bowl-white.jpg';
                          }}
                          className="w-8 h-8 rounded-xl object-cover" 
                        />
                        <span className="text-xs font-semibold text-[#1d1d1f] truncate">{img.color}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)} 
                        className="text-[#86868b] hover:text-rose-600 p-1"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drink custom options */}
            {isDrinkShop && (
              <div className="p-4 bg-[#fbfbfd] rounded-3xl border border-[#e8e8ed] space-y-3">
                <span className="text-xs font-bold text-[#1d1d1f] block">Beverage Customizations</span>
                <label className="flex items-center space-x-2 text-xs text-[#6e6e73] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasSweetness} 
                    onChange={(e) => setHasSweetness(e.target.checked)}
                    className="rounded text-[#1d1d1f]"
                  />
                  <span>Enable Sweetness Levels (Normal / Less / No Sugar)</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-end items-center space-x-3 pt-6 border-t border-[#e8e8ed]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#1d1d1f] text-white rounded-full text-xs font-semibold hover:bg-[#333336] transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? 'Creating Listing...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
