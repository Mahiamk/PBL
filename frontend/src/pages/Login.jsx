import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LockKey,
  User,
  Eye,
  EyeSlash,
  ArrowRight,
  ShoppingBagOpen,
  ShieldCheck,
  Storefront,
} from '@phosphor-icons/react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await login(username, password);

      // Check if there's a return url
      const from = location.state?.from;
      if (from) {
        navigate(from);
        return;
      }

      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'vendor') {
        const type = data.vendor_type ? data.vendor_type.toLowerCase() : '';

        if (type === 'barbershop') {
          navigate('/vendor/barber');
        } else if (type === 'bottleshop') {
          navigate('/vendor/bottleshop');
        } else if (type === 'clothesshop' || type === 'clothingshop' || type === 'fashion') {
          navigate('/vendor/clothesshop');
        } else if (type === 'computershop') {
          navigate('/vendor/tech');
        } else if (type === 'drinkshop') {
          navigate('/vendor/drinkshop');
        } else if (type === 'massage') {
          navigate('/vendor/massage');
        } else if (type === 'tailor') {
          navigate('/vendor/tailor');
        } else {
          navigate('/vendor');
        }
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError('Invalid username or password. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#f5f5f7] py-8 px-4 sm:px-6">
      <div className="w-full max-w-[380px]">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs p-6 sm:p-7 transition-all">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block group mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition-transform duration-200">
                <ShoppingBagOpen size={20} weight="duotone" />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
              Sign In to AIU Store.
            </h1>
            <p className="text-[11px] text-[#6e6e73] mt-1 max-w-[260px] mx-auto">
              Enter your credentials to manage orders, bookings, and campus services.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-[#fff5f5] border border-[#fed7d7] rounded-2xl text-[11px] text-[#c53030] flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e53e3e] shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1"
              >
                Username / Email
              </label>
              <div className="relative">
                <User
                  size={15}
                  weight="duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none"
                />
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="e.g., student@aiu.edu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <LockKey
                  size={15}
                  weight="duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlash size={15} weight="duotone" />
                  ) : (
                    <Eye size={15} weight="duotone" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-full bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-medium text-xs transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e8e8ed]" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-white px-2.5 text-[#86868b]">New to AIU Commerce?</span>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-2">
            <Link
              to="/select-user-type"
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-4 rounded-full bg-[#f5edf0] hover:bg-[#eee0e5] text-[#594951] border border-[#e6dadf] font-medium text-xs transition-all"
            >
              <span>Create an Account</span>
            </Link>

            <Link
              to="/register/vendor"
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-4 rounded-full text-[11px] text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
            >
              <Storefront size={14} weight="duotone" />
              <span>Apply as a Campus Vendor</span>
            </Link>
          </div>
        </div>

        {/* Security / Trust Footer */}
        <div className="flex items-center justify-center space-x-1.5 mt-4 text-[#86868b] text-[11px]">
          <ShieldCheck size={14} weight="duotone" className="text-[#8e6e7d]" />
          <span>AIU Campus Authentication Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
