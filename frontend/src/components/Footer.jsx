import React from 'react';
import { useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // Hide Footer on vendor and customer dashboard routes
  if (location.pathname.startsWith('/vendor') || location.pathname.startsWith('/customer')) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-wide">VendorHub</h3>
            <p className="text-sm text-gray-400">
              Connecting you with the best local services and products. Your one-stop shop for everything you need.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shops" className="hover:text-white transition-colors">Shops</Link></li>
              <li><Link to="/select-user-type" className="hover:text-white transition-colors">Become a Partner</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/shops/barber" className="hover:text-white transition-colors">Barbers</Link></li>
              <li><Link to="/shops/tailor" className="hover:text-white transition-colors">Tailors</Link></li>
              <li><Link to="/shops/computer" className="hover:text-white transition-colors">Tech Repair</Link></li>
              <li><Link to="/shops/clothing" className="hover:text-white transition-colors">Clothing</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>05200 AIU, Alor Setar, Malaysia</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>+60 4-123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>support@vendorhub.com</span>
              </li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
        
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} VendorHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
