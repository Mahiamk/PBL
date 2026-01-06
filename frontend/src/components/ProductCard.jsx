import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, image }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigation if wrapped in Link
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden bg-gray-50 relative">
        <img
          src={image}
          alt={product.product_name}
          className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col p-2.5">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 truncate" title={product.product_name}>
          <Link to={`/product/${product.product_id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.product_name}
          </Link>
        </h3>
        <p className="mt-0.5 text-[10px] text-gray-500 line-clamp-1">{product.product_desc}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">${product.product_price}</p>
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`rounded-full p-1.5 transition-all duration-200 z-10 relative cursor-pointer shadow-sm active:scale-95 ${
              isOutOfStock 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-white text-gray-600 hover:bg-primary hover:text-white border border-gray-100 hover:border-primary'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
