import React from 'react';
import { X, ShoppingBagOpen, ArrowRight, ShoppingCart } from '@phosphor-icons/react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../lib/api';
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1d1d1f]/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#e8e8ed] flex items-center justify-between bg-[#fbfbfd]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-[#f5edf0] text-[#6b535d] flex items-center justify-center">
                  <ShoppingBagOpen size={18} weight="duotone" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1d1d1f]">Review Bag</h2>
                  <span className="text-xs text-[#86868b]">{cartCount} items</span>
                </div>
              </div>
              <button
                type="button"
                className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5edf0] transition-colors active:scale-95"
                onClick={closeCart}
                aria-label="Close cart drawer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 py-6 px-6 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#f5edf0] text-[#6b535d] flex items-center justify-center mb-4">
                    <ShoppingCart size={28} weight="duotone" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1d1d1f] mb-1">Your bag is empty</h3>
                  <p className="text-xs text-[#86868b] max-w-[200px]">
                    Explore the catalog and add campus items to your bag.
                  </p>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-[#f0eaed]">
                    {cart.map((product) => {
                      const rawImage =
                        product.image_url ||
                        (product.product_id === 6
                          ? product.selectedOption === 'Fade'
                            ? barberFade
                            : barberCut
                          : imageMap[product.product_id] || bowlWhite);
                      const image = getImageUrl(rawImage, bowlWhite);

                      return (
                        <li key={product.cartId || product.product_id} className="py-5 flex space-x-4">
                          <div className="shrink-0 w-20 h-20 rounded-2xl bg-[#f5f5f7] border border-[#e8e8ed] overflow-hidden">
                            <img
                              src={image}
                              alt={product.product_name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = bowlWhite;
                              }}
                              className="w-full h-full object-center object-cover"
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between text-xs font-bold text-[#1d1d1f]">
                                <h3 className="line-clamp-1">{product.product_name}</h3>
                                <p className="ml-3 font-extrabold text-[#1d1d1f]">
                                  RM {(Number(product.product_price) * Number(product.quantity)).toFixed(2)}
                                </p>
                              </div>
                              <p className="mt-1 text-xs text-[#86868b]">
                                {product.product_id === 6 ? 'Style' : 'Option'}:{' '}
                                <span className="font-medium text-[#1d1d1f]">
                                  {product.selectedOption || 'Default'}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#86868b] pt-2">
                              <span className="font-medium">Qty: {product.quantity}</span>
                              <span>
                                RM {Number(product.product_price).toFixed(2)} each
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="border-t border-[#e8e8ed] py-6 px-6 bg-[#fbfbfd] space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#86868b] font-medium">Subtotal</span>
                  <span className="text-lg font-extrabold text-[#1d1d1f]">
                    RM {cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleViewCart}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-full bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-medium text-xs shadow-sm transition-all duration-200"
                >
                  <span>Checkout</span>
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
