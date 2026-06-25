import React from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import thermosYellow from '../assets/thermos-yellow.jpg';
import thermosBlack from '../assets/thermos-black.jpg';
import vaseGreen from '../assets/vase-green.jpg';
import bowlWhite from '../assets/bowl-white.jpg';
import barberCut from '../assets/barber-shop/coolcut.jpg';
import barberFade from '../assets/barber-shop/fade.webp';

const imageMap = {
  3: thermosYellow,
  4: thermosBlack,
  5: vaseGreen,
  6: barberCut,
};

const CartDrawer = () => {
  const { cart, isCartOpen, closeCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0transition-opacity" onClick={closeCart}></div>
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">Your Cart</h2>
                <div className="ml-3 h-7 flex items-center">
                  <button
                    type="button"
                    className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={closeCart}
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {cart.map((product) => {
                        const image = product.image_url || (product.product_id === 6 
                            ? (product.selectedOption === 'Fade' ? barberFade : barberCut)
                            : (imageMap[product.product_id] || bowlWhite));
                        
                        return (
                          <li key={product.product_id} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                              <img
                                src={image}
                                alt={product.product_name}
                                className="w-full h-full object-center object-cover"
                              />
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>
                                    <a href="#">{product.product_name}</a>
                                  </h3>
                                  <p className="ml-4">${product.product_price.toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {product.product_id === 6 ? 'Style' : 'Color'}: {product.selectedOption || 'Default'}
                                </p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <p className="text-gray-500">Qty {product.quantity}</p>
                              </div>
                            </div>
                          </li>
                        );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal:</p>
                <p>${cartTotal.toFixed(2)}</p>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleViewCart}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-secondary"
                >
                  View Cart ({cartCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
