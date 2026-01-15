import React, { useState, useEffect, useRef } from 'react';
import { createProduct, fetchCategories, uploadImage, fetchStoreById } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Camera, HelpCircle, X, Plus, Trash } from 'lucide-react';

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

  // New state for handling active upload
  const [activeUploadUrl, setActiveUploadUrl] = useState('');
  const [activeColor, setActiveColor] = useState('');
  const [productImages, setProductImages] = useState([]); // Array of { image_url, color }

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
      // Fallback for admin or if no storeId yet
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

  const handleAddImage = () => {
    if (imageUrl) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
      setImageUrl('');
    }
  };

  // 1. Upload the file first
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await uploadImage(file);
        setActiveUploadUrl(data.url);
        // Reset color input so they have to type it
        setActiveColor(''); 
      } catch (err) {
        console.error("Upload failed", err);
        setError("Failed to upload image");
      }
    }
  };

  // 2. Confirm the image + color pair
  const confirmImageAdd = () => {
    if (!activeUploadUrl) return;
    
    // Auto-fill color for Drink Shops if not specified
    let colorToUse = activeColor;
    if (isDrinkShop && !activeColor.trim()) {
        colorToUse = "General";
    }

    if (!colorToUse.trim()) {
      alert("Please enter a color for this image.");
      return;
    }

    setProductImages(prev => [
      ...prev, 
      { image_url: activeUploadUrl, color: colorToUse, is_main: prev.length === 0 }
    ]);
    
    // Reset temporary state
    setActiveUploadUrl('');
    setActiveColor('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (productImages.length === 0) {
        throw new Error("Please add at least one image.");
      }
      
      let customOptionsJson = null;
      if (isDrinkShop) {
          customOptionsJson = JSON.stringify({
              sweetness: hasSweetness,
              addOns: addOns
          });
      }

      const payload = {
        ...formData,
        product_price: parseFloat(formData.product_price),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category_id: parseInt(formData.category_id),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        store_id: parseInt(formData.store_id || storeId || user?.storeId || 1),
        // Send the structured image data
        product_images: productImages,
        custom_options: customOptionsJson
      };

      await createProduct(payload);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">New Product</h2>
        <button onClick={onCancel}><X className="h-6 w-6" /></button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Essentials */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                name="product_name"
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={formData.product_name}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="product_price"
                    required
                    step="0.01"
                    className="w-full pl-8 p-2 border rounded"
                    value={formData.product_price}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  name="stock_quantity"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category_id"
                required
                className="w-full p-2 border rounded"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {!isDrinkShop && (
             <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                className="w-full p-2 border rounded"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>
            )}
            
            {isDrinkShop && (
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-3">Drink Configuration</h3>
                    
                    <div className="mb-4">
                        <label className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                checked={hasSweetness}
                                onChange={(e) => setHasSweetness(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm font-medium">Enable Sweetness Levels</span>
                        </label>
                        <p className="text-xs text-gray-500 ml-6">Adds (Original, Sweet, Less Sweet, No Sugar)</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Available Add-ons</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                placeholder="Name (e.g. Cheese)" 
                                className="flex-1 p-2 border rounded text-sm"
                                value={newAddOn.name}
                                onChange={(e) => setNewAddOn({...newAddOn, name: e.target.value})}
                            />
                            <input 
                                type="number" 
                                placeholder="Price" 
                                className="w-24 p-2 border rounded text-sm"
                                value={newAddOn.price}
                                onChange={(e) => setNewAddOn({...newAddOn, price: e.target.value})}
                            />
                            <button type="button" onClick={handleAddOnAdd} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <ul className="space-y-1">
                            {addOns.map((addon, idx) => (
                                <li key={idx} className="flex justify-between bg-white p-2 rounded text-sm border shadow-sm">
                                    <span>{addon.name} (+RM {addon.price.toFixed(2)})</span>
                                    <button type="button" onClick={() => handleRemoveAddOn(idx)} className="text-red-500 hover:text-red-700">
                                        <X className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
          </div>

          {/* Right Column - Images & Colors */}
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium mb-2">Product Images & Colors</label>
              
              {/* Image Input Area */}
              <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50 mb-4">
                {!activeUploadUrl ? (
                  <div className="text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-500"
                    >
                      <Camera className="h-8 w-8 mb-2" />
                      <span className="text-sm">Click to upload image</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <img src={activeUploadUrl} alt="Preview" className="h-32 w-auto object-contain mx-auto rounded" />
                    
                    {!isDrinkShop ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Select Color for this Image <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Red, Blue, Matte Black"
                          value={activeColor}
                          onChange={(e) => setActiveColor(e.target.value)}
                          className="flex-1 p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={confirmImageAdd}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    ) : (
                        <button
                          type="button"
                          onClick={() => { setActiveColor('General'); confirmImageAdd(); }} // Hack to trigger add but confirmImageAdd handles 'General' if called directly, but here we invoke it. 
                          // Actually confirmImageAdd checks activeColor state or isDrinkShop logic. We just need to trigger it.
                          // Wait, confirmImageAdd checks isDrinkShop. So we just need a button to "Confirm Image".
                          // onClick={confirmImageAdd}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                        >
                          Confirm Image Use
                        </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => { setActiveUploadUrl(''); setActiveColor(''); }}
                      className="text-xs text-red-500 underline text-center"
                    >
                      Cancel this upload
                    </button>
                  </div>
                )}
              </div>

              {/* List of Added Images */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {productImages.map((img, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded bg-white shadow-sm">
                    <img src={img.image_url} alt="" className="h-12 w-12 object-cover rounded" />
                    <div className="flex-1">
                      <span className="text-sm font-medium block">{img.color}</span>
                      {img.is_main && <span className="text-xs text-green-600 bg-green-50 px-1 rounded">Main Image</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {productImages.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-2">
                    No images added yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="product_desc"
                rows="4"
                className="w-full p-2 border rounded"
                value={formData.product_desc}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Product...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
