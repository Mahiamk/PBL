import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBagOpen,
  ShoppingCart,
  UserCircle,
  SignOut,
  MagnifyingGlass,
  List,
  X,
  Storefront,
  SquaresFour,
  House,
} from '@phosphor-icons/react';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#e8e8ed] shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5edf0] focus:outline-none transition-all duration-200 md:hidden active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? (
                <X size={22} weight="bold" className="text-[#1d1d1f]" />
              ) : (
                <List size={22} weight="bold" className="text-[#1d1d1f]" />
              )}
            </button>

            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                <ShoppingBagOpen size={19} weight="duotone" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-[#1d1d1f]">
                  AIU Store
                </span>
                <span className="text-[9px] font-medium uppercase tracking-widest text-[#86868b] -mt-1 hidden sm:block">
                  Official Market
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 ml-6">
              <Link
                to="/"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive('/')
                    ? 'bg-[#f5edf0] text-[#1d1d1f] font-semibold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
              >
                <House size={16} weight="duotone" />
                <span>Home</span>
              </Link>
              <Link
                to="/shops"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive('/shops')
                    ? 'bg-[#f5edf0] text-[#1d1d1f] font-semibold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
              >
                <Storefront size={16} weight="duotone" />
                <span>Stores</span>
              </Link>
              <Link
                to="/shop"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive('/shop')
                    ? 'bg-[#f5edf0] text-[#1d1d1f] font-semibold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
              >
                <SquaresFour size={16} weight="duotone" />
                <span>All Products</span>
              </Link>
            </div>
          </div>

          {/* Right Action Area: Compact Search, Cart, Dashboard & Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Compact Search Bar */}
            <div className="hidden md:flex items-center w-40 lg:w-52">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative flex items-center">
                  <MagnifyingGlass
                    size={14}
                    weight="bold"
                    className="absolute left-3 text-[#86868b] pointer-events-none"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all duration-200"
                  />
                </div>
              </form>
            </div>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-full text-[#1d1d1f] hover:bg-[#f5edf0] transition-all duration-200 active:scale-95"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingCart size={20} weight="duotone" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-bold leading-none text-white bg-[#8e6e7d] rounded-full shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Dashboard Link on Right Side */}
            {user && (
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/customer'}
                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive('/customer') || isActive('/vendor') || isActive('/admin')
                    ? 'bg-[#f5edf0] text-[#1d1d1f] font-semibold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] border border-[#e8e8ed]'
                }`}
              >
                <SquaresFour size={15} weight="duotone" className="text-[#8e6e7d]" />
                <span>Dashboard</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5 pl-1 sm:pl-2 border-l border-[#e8e8ed]">
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/customer'}
                  className="flex items-center space-x-1.5 px-2 py-1.5 rounded-full text-[#1d1d1f] hover:bg-[#f5edf0] transition-all duration-200"
                  title="My Account"
                >
                  <UserCircle size={22} weight="duotone" className="text-[#8e6e7d]" />
                  <span className="text-xs font-medium hidden md:inline">
                    {user.first_name || 'Account'}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors"
                  title="Sign Out"
                >
                  <SignOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-3 py-1.5 text-[#1d1d1f] hover:text-black transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/select-user-type"
                  className="text-xs font-semibold px-4 py-1.5 bg-[#1d1d1f] hover:bg-[#333336] text-white rounded-full transition-all shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 border-b border-[#e8e8ed] bg-white' : 'max-h-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <MagnifyingGlass
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]"
              />
              <input
                type="text"
                placeholder="Search products & services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f5f5f7] text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full outline-none"
              />
            </div>
          </form>

          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all ${
              isActive('/')
                ? 'bg-[#f5edf0] text-[#1d1d1f] font-semibold'
                : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
            }`}
          >
            <House size={18} weight="duotone" />
            <span>Home</span>
          </Link>

          <Link
            to="/shop"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all ${
              isActive('/shop')
                ? 'bg-[#f5edf0] text-[#1d1d1f] font-semibold'
                : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
            }`}
          >
            <ShoppingBagOpen size={18} weight="duotone" />
            <span>All Products</span>
          </Link>

          <Link
            to="/shops"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all ${
              isActive('/shops')
                ? 'bg-[#f5edf0] text-[#1d1d1f] font-semibold'
                : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
            }`}
          >
            <Storefront size={18} weight="duotone" />
            <span>Campus Stores</span>
          </Link>

          {user && (
            <Link
              to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/customer'}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                isActive('/customer')
                  ? 'bg-[#f5edf0] text-[#1d1d1f] font-semibold'
                  : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
              }`}
            >
              <SquaresFour size={18} weight="duotone" />
              <span>Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;