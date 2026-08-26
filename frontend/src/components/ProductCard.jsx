import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Tag } from '@phosphor-icons/react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../lib/api';

const ProductCard = ({ product, image }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock_quantity <= 0;
  const resolvedImage = getImageUrl(image || product.image_url);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart({
        ...product,
        image_url: resolvedImage
      });
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-[#e8e8ed] shadow-xs hover:shadow-xl hover:shadow-[#6b535d]/6 hover:border-[#dfd5da] transition-all duration-300 hover:-translate-y-1">
      {/* Image Frame */}
      <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f7] relative">
        <img
          src={resolvedImage}
          alt={product.product_name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/bowl-white.jpg';
          }}
          className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-40 grayscale' : ''
          }`}
          loading="lazy"
        />

        {/* Status badges */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1d1d1f]/40 backdrop-blur-xs">
            <span className="bg-[#1d1d1f] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
              Sold Out
            </span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="inline-flex items-center space-x-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#594951] border border-[#e6dadf] shadow-xs">
              <Tag size={12} weight="duotone" className="text-[#8e6e7d]" />
              <span>Available</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-3.5 sm:p-5 flex-1 justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#1d1d1f] line-clamp-1 group-hover:text-[#594951] transition-colors">
            <Link to={`/product/${product.product_id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.product_name}
            </Link>
          </h3>
          <p className="mt-1 text-[11px] sm:text-xs text-[#6e6e73] line-clamp-2 leading-relaxed">
            {product.product_desc}
          </p>
        </div>

        <div className="mt-3.5 sm:mt-5 pt-3 border-t border-[#f0eaed] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#86868b]">Price</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#1d1d1f] tracking-tight">
              RM {Number(product.product_price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Add to cart"
            className={`relative z-10 p-2 sm:p-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-xs ${
              isOutOfStock
                ? 'bg-[#f5f5f7] text-[#86868b] cursor-not-allowed'
                : 'bg-[#1d1d1f] text-white hover:bg-[#333336] hover:shadow-sm'
            }`}
          >
            <ShoppingCart size={16} weight="duotone" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
