import React, { useState, useEffect } from 'react';
import { fetchProducts, deleteProduct, updateProduct, getImageUrl } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import ProductNewForm from './ProductNewForm';
import { 
  MagnifyingGlass, 
  Plus, 
  Trash, 
  PencilSimple, 
  FloppyDisk, 
  X, 
  CheckCircle, 
  WarningCircle,
  Package,
  ArrowClockwise,
  SlidersHorizontal
} from '@phosphor-icons/react';

const ProductManager = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleEditClick = (product) => {
    setEditingId(product.product_id);
    setEditForm({
      product_price: product.product_price,
      stock_quantity: product.stock_quantity,
      status: product.status || 'active'
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setError(null);
  };

  const handleSaveEdit = async (productId) => {
    try {
      await updateProduct(productId, editForm);
      setSuccess('Product updated successfully');
      setEditingId(null);
      loadProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to update product", err);
      setError('Failed to update product');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'product_price' || name === 'stock_quantity' ? parseFloat(value) : value
    }));
  };

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts(user?.storeId);
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        loadProducts();
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleSuccess = () => {
    setIsCreating(false);
    loadProducts();
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.product_id));
    } else {
      setSelectedProducts([]);
    }
  };

  const toggleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isCreating) {
    return <ProductNewForm onSuccess={handleSuccess} onCancel={() => setIsCreating(false)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-[#8e6e7d] uppercase tracking-widest block mb-1">
            Catalog Management
          </span>
          <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">Products & Inventory</h2>
          <p className="text-xs text-[#6e6e73]">
            Manage items, pricing, inventory stock, and availability.
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center space-x-2 bg-[#1d1d1f] text-white px-4 py-2.5 rounded-full text-xs font-semibold hover:bg-[#333336] transition-all shadow-xs"
        >
          <Plus size={15} weight="bold" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle size={18} weight="fill" className="text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <WarningCircle size={18} weight="fill" className="text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#e8e8ed] shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
            <MagnifyingGlass size={16} weight="bold" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3.5 py-2 border border-[#e8e8ed] rounded-full text-xs bg-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:bg-white focus:border-[#8e6e7d] transition-all duration-200"
            placeholder="Search by name, SKU, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1.5 bg-[#f5f5f7] px-3 py-1.5 rounded-full border border-[#e8e8ed] text-xs">
            <SlidersHorizontal size={14} className="text-[#86868b]" />
            <select 
              className="bg-transparent text-xs font-bold text-[#1d1d1f] focus:outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active & In Stock</option>
              <option value="disabled">Disabled / Inactive</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="text-xs font-semibold text-[#8e6e7d] hover:text-[#1d1d1f] px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f0eaed] text-left text-xs">
            <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3.5 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#e8e8ed] text-[#1d1d1f] focus:ring-[#8e6e7d]"
                    onChange={toggleSelectAll}
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  />
                </th>
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Stock Quantity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eaed] text-[#1d1d1f]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#86868b]">
                    <Package size={36} weight="duotone" className="mx-auto mb-2 opacity-50" />
                    No products found in your inventory catalog.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isEditing = editingId === product.product_id;

                  return (
                    <tr key={product.product_id} className="hover:bg-[#fbfbfd] transition-colors">
                      <td className="px-5 py-3.5">
                        <input 
                          type="checkbox" 
                          className="rounded border-[#e8e8ed] text-[#1d1d1f] focus:ring-[#8e6e7d]"
                          checked={selectedProducts.includes(product.product_id)}
                          onChange={() => toggleSelectProduct(product.product_id)}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          {product.image_url ? (
                            <img 
                              src={getImageUrl(product.image_url)} 
                              alt={product.product_name} 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/assets/bowl-white.jpg';
                              }}
                              className="w-10 h-10 object-cover rounded-xl border border-[#e8e8ed] shrink-0" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#f5edf0] flex items-center justify-center text-[#8e6e7d] shrink-0">
                              <Package size={20} weight="duotone" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-[#1d1d1f] block">{product.product_name}</span>
                            <span className="text-[10px] text-[#86868b]">SKU: {product.sku || `AIU-${product.product_id}`}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <input 
                            type="number" 
                            name="product_price" 
                            value={editForm.product_price} 
                            onChange={handleInputChange} 
                            className="w-24 px-2 py-1 border border-[#e8e8ed] rounded-lg text-xs font-bold"
                          />
                        ) : (
                          <span className="font-bold">RM {Number(product.product_price).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <input 
                            type="number" 
                            name="stock_quantity" 
                            value={editForm.stock_quantity} 
                            onChange={handleInputChange} 
                            className="w-20 px-2 py-1 border border-[#e8e8ed] rounded-lg text-xs"
                          />
                        ) : (
                          <span className="font-semibold text-[#6e6e73]">{product.stock_quantity || 0} units</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <select 
                            name="status" 
                            value={editForm.status} 
                            onChange={handleInputChange} 
                            className="px-2 py-1 border border-[#e8e8ed] rounded-lg text-xs"
                          >
                            <option value="active">Active</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{product.status || 'Active'}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={() => handleSaveEdit(product.product_id)} 
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Save changes"
                            >
                              <FloppyDisk size={16} weight="bold" />
                            </button>
                            <button 
                              onClick={handleCancelEdit} 
                              className="p-1.5 text-[#86868b] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X size={16} weight="bold" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEditClick(product)} 
                              className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                              title="Quick edit"
                            >
                              <PencilSimple size={16} weight="duotone" />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.product_id)} 
                              className="p-1.5 text-[#86868b] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash size={16} weight="duotone" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
