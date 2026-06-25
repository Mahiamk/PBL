import React, { useState, useEffect } from 'react';
import { fetchProducts, deleteProduct, updateProduct } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import ProductNewForm from './ProductNewForm';
import { Search, Filter, MoreHorizontal, Trash2, Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

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
      // If vendor, load their store's products. If admin (no storeId), load all.
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts(user?.storeId);
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products");
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
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isCreating) {
    return <ProductNewForm onSuccess={handleSuccess} onCancel={() => setIsCreating(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Create a new product</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
        >
          New Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Status</option>
                <option value="active">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                <option>Product Type</option>
                <option>Physical</option>
                <option>Digital</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <button 
              onClick={() => {setSearchTerm(''); setStatusFilter('all');}}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  onChange={toggleSelectAll}
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">THUMBNAIL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                NAME <span className="inline-block ml-1">↕</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                PRICE <span className="inline-block ml-1">↕</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                STOCK <span className="inline-block ml-1">↕</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                STATUS <span className="inline-block ml-1">↕</span>
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.product_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={selectedProducts.includes(product.product_id)}
                    onChange={() => toggleSelectProduct(product.product_id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-10 w-10 flex-shrink-0">
                    {product.image_url ? (
                      <img className="h-10 w-10 rounded object-cover border border-gray-200" src={product.image_url} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{product.product_name}</div>
                </td>
                
                {/* Editable Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === product.product_id ? (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">$</span>
                      <input
                        type="number"
                        name="product_price"
                        value={editForm.product_price}
                        onChange={handleInputChange}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-green-500 focus:border-green-500"
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900">${product.product_price.toFixed(2)}</div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{product.sku || '-'}</div>
                </td>

                {/* Editable Stock */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === product.product_id ? (
                    <input
                      type="number"
                      name="stock_quantity"
                      value={editForm.stock_quantity}
                      onChange={handleInputChange}
                      className="w-20 px-2 py-1 text-sm border rounded focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <div className={`text-sm font-medium ${product.stock_quantity <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock_quantity || 0}
                    </div>
                  )}
                </td>

                {/* Editable Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === product.product_id ? (
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleInputChange}
                      className="text-sm border rounded px-2 py-1 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' : 
                      product.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status || 'active'}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === product.product_id ? (
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleSaveEdit(product.product_id)}
                        className="text-green-600 hover:text-green-900"
                        title="Save"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-gray-600"
                        title="Cancel"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="text-blue-400 hover:text-blue-600"
                        title="Edit Product"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.product_id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete Product"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No products found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;

