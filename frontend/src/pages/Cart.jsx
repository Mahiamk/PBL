import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import thermosYellow from '../assets/thermos-yellow.jpg';
import thermosBlack from '../assets/thermos-black.jpg';
import vaseGreen from '../assets/vase-green.jpg';
import bowlWhite from '../assets/bowl-white.jpg';
import barberCut from '../assets/barber-shop/coolcut.jpg';
import barberFade from '../assets/barber-shop/fade.webp';
import massageCupping from '../assets/massage/cupping.jpg';
import tailorService from '../assets/tailor/tailor.webp';
import Navbar from '../components/Navbar';

const imageMap = {
  3: thermosYellow,
  4: thermosBlack,
  5: vaseGreen,
  6: barberCut,
  7: massageCupping,
  8: tailorService,
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrder();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('online');

  // Initialize selection with all items when cart loads
  useEffect(() => {
    setSelectedItems(prev => {
      const validIds = prev.filter(id => cart.some(item => item.cartId === id));
      if (prev.length === 0 && cart.length > 0 && validIds.length === 0) {
        return cart.map(item => item.cartId);
      }
      return validIds;
    });
  }, [cart]);

  const toggleSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.cartId));
    }
  };

  const selectedTotal = cart
    .filter(item => selectedItems.includes(item.cartId))
    .reduce((acc, item) => acc + item.product_price * item.quantity, 0);

  const processCheckout = async (itemsToCheckout) => {
    console.log("Processing checkout for:", itemsToCheckout);
    if (!user) {
      console.log("User not logged in, redirecting to login");
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      console.log("Creating order...");
      const orderData = {
        items: itemsToCheckout,
        paymentMethod: paymentMethod
      };

      const result = await addOrder(orderData);
      console.log("Order created successfully:", result);
      
      // Remove checked out items from cart
      itemsToCheckout.forEach(item => removeFromCart(item.cartId));
      
      // Navigate to dashboard
      console.log("Navigating to invoice...");
      
      // Ensure navigation happens even if there's a race condition
      setTimeout(() => {
          navigate('/invoice', { 
            state: { 
                order: {
                ...orderData,
                items: itemsToCheckout.map(i => ({...i, price: i.product_price, product_name: i.product_name})),
                customer_name: user.fullName || "Valued Customer",
                email: user.email,
                order_id: "NEW" 
                }
            } 
          });
      }, 100);
      
    } catch (error) {
      console.error("Checkout failed:", error);
      
      // Parse error message for clarity
      let errorMessage = "An unexpected error occurred during checkout.";
      
      if (error.response?.data?.detail) {
          // FastAPI error response
          errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
      } else if (error.message) {
          // Fallback to Axios error message if explicit response data isn't available
          // but avoid "Request failed with status code 400" if we can help it
          if (error.response?.status === 400 && !errorMessage) {
              errorMessage = "Invalid request. Please check your cart and try again.";
          } else {
              errorMessage = error.message;
          }
      }

      // Check specifically for stock errors
      if (errorMessage.toLowerCase().includes('stock') || errorMessage.toLowerCase().includes('inventory')) {
          // Check if multiple items are listed
          let errorItems = [];
          if (errorMessage.includes("Not enough stock for:")) {
              const itemsPart = errorMessage.split("Not enough stock for:")[1];
              if (itemsPart) {
                  errorItems = itemsPart.split(',').map(item => item.trim());
              }
          } else {
               errorItems = [errorMessage];
          }

          // Create a toast for each item
          errorItems.forEach((itemError, index) => {
               const message = itemError.includes("stock") ? itemError : `⚠️ Not enough stock for: ${itemError}`;
               createToast(message, index);
          });
          return; // Exit here as we handled the specific stock errors
      }

      // Default single toast for other errors
      createToast(errorMessage);
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert("Please select items to checkout");
      return;
    }

    const itemsToCheckout = cart.filter(item => selectedItems.includes(item.cartId));
    await processCheckout(itemsToCheckout);
  };

  const handleBuyNow = async (item) => {
    await processCheckout([item]);
  };

  // Helper function to create toast
  const createToast = (message, index = 0) => {
        const toastId = `checkout-error-toast-${Date.now()}-${index}`;
        
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = "fixed right-4 max-w-md bg-white border-l-4 border-red-500 text-gray-800 px-6 py-4 rounded shadow-xl z-50 flex items-start animate-fade-in-down";
        // Stack toasts vertically with offset
        toast.style.top = `${80 + (index * 90)}px`; 
        toast.style.animation = "slideIn 0.3s ease-out";
        
        toast.innerHTML = `
        <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <div class="ml-3">
            <h3 class="text-sm font-bold text-red-600">Checkout Failed</h3>
            <p class="text-sm mt-1">${message}</p>
        </div>
        <button onclick="document.getElementById('${toastId}').remove()" class="ml-4 text-gray-400 hover:text-gray-500">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
        const t = document.getElementById(toastId);
        if (t) {
            t.style.opacity = '0';
            t.style.transition = 'opacity 1.0s ease';
            setTimeout(() => t.remove(), 500);
        }
        }, 5000 + (index * 500)); // Stagger removal slightly
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Link to="/shop" className="text-sm text-gray-500 hover:text-gray-900 underline mt-2 inline-block">
          Continue Shopping
        </Link>
      </div>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
            <input
              type="checkbox"
              checked={selectedItems.length === cart.length && cart.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Select All ({cart.length} items)</span>
          </div>
          
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 text-sm font-medium text-gray-500 border-b border-gray-200 pb-4">
            <div className="sm:col-span-6">Product</div>
            <div className="sm:col-span-3 text-center">Quantity</div>
            <div className="sm:col-span-3 text-right">Total</div>
          </div>

          <ul className="divide-y divide-gray-200">
            {cart.map((item) => {
                const image = item.image_url || (item.product_id === 6 
                    ? (item.selectedOption === 'Fade' ? barberFade : barberCut)
                    : (imageMap[item.product_id] || bowlWhite));

                return (
                  <li key={item.cartId} className="py-6 sm:py-10">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.cartId)}
                            onChange={() => toggleSelect(item.cartId)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-4"
                        />
                        
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-x-6">
                            {/* Product Column */}
                            <div className="sm:col-span-6 flex">
                                <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                    <img
                                        src={image}
                                        alt={item.product_name}
                                        className="w-full h-full object-center object-cover"
                                    />
                                </div>
                                <div className="ml-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">
                                            <Link to={`/product/${item.product_id}`}>{item.product_name}</Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {item.product_id === 6 ? 'Style' : 'Color'}: {item.selectedOption || 'Default'}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-gray-900 sm:hidden">
                                            ${item.product_price} x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log("Buy Now clicked for:", item);
                                                handleBuyNow(item);
                                            }}
                                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-10 relative"
                                        >
                                            Buy Now
                                        </button>
                                        <div className="h-4 w-px bg-gray-300"></div>
                                        <button 
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="text-sm font-medium text-red-600 hover:text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Column */}
                            <div className="sm:col-span-3 flex items-center justify-center mt-4 sm:mt-0">
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button 
                                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                        className="p-2 hover:bg-gray-100 text-gray-600"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="px-4 py-1 text-gray-900 text-sm">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                        className="p-2 hover:bg-gray-100 text-gray-600"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Total Column */}
                            <div className="sm:col-span-3 flex items-center justify-end mt-4 sm:mt-0">
                                <p className="text-base font-medium text-gray-900">
                                    ${(item.product_price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                  </li>
                );
            })}
          </ul>
        </div>

        <div className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:col-span-4 lg:mt-0 lg:p-8">
          <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between pt-4">
              <div className="text-base font-medium text-gray-900">Sub total</div>
              <div className="text-base font-medium text-gray-900">${selectedTotal.toFixed(2)}</div>
            </div>
            
            <div className="pt-4">
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Enter coupon code" 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                        Apply
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                    <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value="online" 
                            checked={paymentMethod === 'online'}
                            onChange={() => setPaymentMethod('online')}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                            <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="block text-sm font-medium text-gray-900">Online Payment</span>
                        </div>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value="cod" 
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                            <Banknote className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="block text-sm font-medium text-gray-900">Cash on Delivery</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-base font-medium text-gray-900">Total</div>
              <div className="text-base font-medium text-gray-900">${selectedTotal.toFixed(2)}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">(Inclusive of tax $0.00)</p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className={`w-full border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-primary ${
                selectedItems.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
