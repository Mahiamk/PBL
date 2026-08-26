import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  ShoppingBagOpen,
  MapPin,
  PhoneCall,
  EnvelopeSimple,
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  ArrowUpRight,
} from '@phosphor-icons/react';

const Footer = () => {
  const location = useLocation();

  // Hide Footer on all admin, vendor, and customer dashboard routes
  const isDashboard = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/vendor') || 
    location.pathname.startsWith('/customer') ||
    location.pathname.startsWith('/invoice');

  if (isDashboard) {
    return null;
  }

  return (
    <footer className="bg-[#f5f5f7] text-[#6e6e73] border-t border-[#e8e8ed]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Info */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-3 sm:space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-white shadow-xs">
                <ShoppingBagOpen size={18} weight="duotone" />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#1d1d1f]">
                AIU Store
              </span>
            </Link>
            <p className="text-xs text-[#6e6e73] leading-relaxed max-w-sm">
              Official campus market for verified student services, barber appointments, custom tailoring, and curated goods.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <a
                href="#"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-[#f5edf0] text-[#594951] flex items-center justify-center transition-all duration-200 border border-[#e8e8ed]"
                aria-label="Facebook"
              >
                <FacebookLogo size={15} weight="duotone" />
              </a>
              <a
                href="#"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-[#f5edf0] text-[#594951] flex items-center justify-center transition-all duration-200 border border-[#e8e8ed]"
                aria-label="Twitter"
              >
                <TwitterLogo size={15} weight="duotone" />
              </a>
              <a
                href="#"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-[#f5edf0] text-[#594951] flex items-center justify-center transition-all duration-200 border border-[#e8e8ed]"
                aria-label="Instagram"
              >
                <InstagramLogo size={15} weight="duotone" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-3 sm:mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-[#1d1d1f] transition-colors flex items-center justify-between group">
                  <span>Home</span>
                  <ArrowUpRight size={11} weight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-[#1d1d1f] transition-colors flex items-center justify-between group">
                  <span>Campus Stores</span>
                  <ArrowUpRight size={11} weight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#1d1d1f] transition-colors flex items-center justify-between group">
                  <span>Product Catalog</span>
                  <ArrowUpRight size={11} weight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#1d1d1f] transition-colors flex items-center justify-between group">
                  <span>Account & Portal</span>
                  <ArrowUpRight size={11} weight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-3 sm:mb-4">
              Campus Stores
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shops/barber" className="hover:text-[#1d1d1f] transition-colors">
                  Barber & Grooming
                </Link>
              </li>
              <li>
                <Link to="/shops/tailor" className="hover:text-[#1d1d1f] transition-colors">
                  Custom Tailoring
                </Link>
              </li>
              <li>
                <Link to="/shops/computer" className="hover:text-[#1d1d1f] transition-colors">
                  Tech & PC Repair
                </Link>
              </li>
              <li>
                <Link to="/shops/clothing" className="hover:text-[#1d1d1f] transition-colors">
                  Campus Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1d1d1f] mb-3 sm:mb-4">
              Campus Info
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start space-x-2">
                <MapPin size={15} weight="duotone" className="text-[#8e6e7d] shrink-0 mt-0.5" />
                <span>AIU Campus, Alor Setar, Kedah</span>
              </li>
              <li className="flex items-center space-x-2">
                <PhoneCall size={15} weight="duotone" className="text-[#8e6e7d] shrink-0" />
                <span>+60 4-123 4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <EnvelopeSimple size={15} weight="duotone" className="text-[#8e6e7d] shrink-0" />
                <span>store@aiu.edu.my</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e8e8ed] mt-8 sm:mt-12 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#86868b] gap-2 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} Albukhary International University. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Official Campus Microstore</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
