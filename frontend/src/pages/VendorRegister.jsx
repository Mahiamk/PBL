import React, { useState } from 'react';
import { registerVendor } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  Storefront,
  EnvelopeSimple,
  LockKey,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  UploadSimple,
  Buildings,
  ShoppingBagOpen,
  Scissors,
  Package,
  CalendarCheck,
  Tag,
} from '@phosphor-icons/react';

const productSuggestions = [
  'Burger & Fast Food',
  'Beverage & Cafe',
  'Fashion & Apparel',
  'Tumblers & Bottles',
  'Tech & Electronics',
  'Books & Stationery',
  'Campus Snacks',
  'Handmade Crafts',
];

const serviceSuggestions = [
  'Shoe & Bag Repair',
  'Barber & Haircut',
  'Custom Tailoring',
  'PC & Phone Repair',
  'Massage & Wellness',
  'Laundry & Dry Clean',
  'Event Photography',
  'Printing & Binding',
];

const VendorRegister = () => {
  const [offeringType, setOfferingType] = useState('product'); // 'product' or 'service'
  const [customCategory, setCustomCategory] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    initial: '',
    phone_number: '',
    email: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    contact_details: '',
    description: '',
    working_hours: '09:00 AM - 08:00 PM',
  });
  const [bannerImage, setBannerImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleSuggestionClick = (cat) => {
    setCustomCategory(cat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!customCategory.trim()) {
      setError('Please type or select a store category');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      if (formData.initial) data.append('initial', formData.initial);
      if (formData.phone_number) data.append('phone_number', formData.phone_number);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('business_name', formData.business_name);
      data.append('contact_details', formData.contact_details);
      data.append('location', formData.contact_details);
      data.append('working_hours', formData.working_hours || '09:00 AM - 08:00 PM');
      data.append('vendor_type', customCategory.trim());
      data.append('offering_type', offeringType);
      if (formData.description) data.append('description', formData.description);
      if (bannerImage) {
        data.append('banner_image', bannerImage);
      }

      await registerVendor(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#f5f5f7] py-8 px-4">
        <div className="max-w-[420px] w-full bg-white rounded-3xl border border-[#e8e8ed] shadow-xs p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-[#f5edf0] text-[#6b535d] rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle size={28} weight="duotone" className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight mb-1">
              Store Application Submitted!
            </h2>
            <p className="text-xs text-[#6e6e73] leading-relaxed">
              Your vendor application for <strong className="text-[#1d1d1f]">{formData.business_name}</strong> ({customCategory} • {offeringType === 'service' ? 'Service Provider' : 'Merchandise Seller'}) has been received. Campus administration will review your store credentials shortly.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            >
              Return to Login Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentSuggestions = offeringType === 'service' ? serviceSuggestions : productSuggestions;

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#f5f5f7] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-[480px] w-full">
        <div className="bg-white rounded-3xl sm:rounded-[32px] border border-[#e8e8ed] shadow-xs p-6 sm:p-8">
          
          {/* Header Banner */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block group mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition-transform duration-200">
                <ShoppingBagOpen size={20} weight="duotone" />
              </div>
            </Link>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-[#f5edf0] text-[#594951] text-[10px] font-bold mb-1.5">
              <span>Campus Merchant Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1d1d1f] tracking-tight">
              Register Your Campus Store.
            </h1>
            <p className="text-xs text-[#6e6e73] mt-1 max-w-[320px] mx-auto">
              Launch your shop, sell physical products, or accept appointment bookings.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-[#fff5f5] border border-[#fed7d7] rounded-2xl text-xs text-[#c53030] flex items-center space-x-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e53e3e] shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* 1. Primary Offering Identifier (Product vs Service) */}
            <div className="p-4 bg-[#fbfbfd] rounded-2xl border border-[#e8e8ed] space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#1d1d1f]">
                1. What does your shop primarily offer? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOfferingType('product')}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-2.5 ${
                    offeringType === 'product'
                      ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs'
                      : 'bg-white text-[#1d1d1f] border-[#e8e8ed] hover:border-[#dfd5da]'
                  }`}
                >
                  <Package size={20} weight="duotone" className={offeringType === 'product' ? 'text-amber-400' : 'text-[#8e6e7d]'} />
                  <div>
                    <span className="text-xs font-bold block">Physical Products</span>
                    <span className={`text-[9px] block ${offeringType === 'product' ? 'text-white/70' : 'text-[#86868b]'}`}>
                      Food, Clothes, Hardware
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOfferingType('service')}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-2.5 ${
                    offeringType === 'service'
                      ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs'
                      : 'bg-white text-[#1d1d1f] border-[#e8e8ed] hover:border-[#dfd5da]'
                  }`}
                >
                  <CalendarCheck size={20} weight="duotone" className={offeringType === 'service' ? 'text-amber-400' : 'text-[#8e6e7d]'} />
                  <div>
                    <span className="text-xs font-bold block">Booking Services</span>
                    <span className={`text-[9px] block ${offeringType === 'service' ? 'text-white/70' : 'text-[#86868b]'}`}>
                      Repairs, Haircuts, Tailoring
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Custom Category Input & Suggestions */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f]">
                2. Store Category & Specialization <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag size={15} weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder={offeringType === 'service' ? "e.g. Shoe Repair, Custom Tailoring, Phone Screen Fix" : "e.g. Burger Shop, Boba Tea, Campus Hoodies"}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all font-semibold"
                />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="pt-1">
                <span className="text-[10px] text-[#86868b] block mb-1.5">Suggestions (Click to apply):</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSuggestionClick(sug)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                        customCategory === sug
                          ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                          : 'bg-[#fbfbfd] hover:bg-[#f5edf0] text-[#6e6e73] border-[#e8e8ed]'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                Store / Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="business_name"
                type="text"
                required
                placeholder="e.g. AIU Sole Repair Studio"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all font-semibold"
              />
            </div>

            {/* Store Description / Bio */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                Store Description & Bio <span className="text-[#86868b] lowercase font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                rows="2"
                placeholder="Tell campus customers what makes your shop unique or what items you craft..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
              />
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  name="first_name"
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  name="last_name"
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Contact & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Phone Number
                </label>
                <input
                  name="phone_number"
                  type="tel"
                  placeholder="+60 11-2345 6789"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="vendor@aiu.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Campus Location & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Campus Location <span className="text-rose-500">*</span>
                </label>
                <input
                  name="contact_details"
                  type="text"
                  required
                  placeholder="Student Center, Level 1"
                  value={formData.contact_details}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Working Hours
                </label>
                <input
                  name="working_hours"
                  type="text"
                  placeholder="09:00 AM - 08:00 PM"
                  value={formData.working_hours}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Banner Image */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                Store Banner Photo <span className="text-[#86868b] lowercase font-normal">(optional)</span>
              </label>
              <label className="flex items-center justify-between px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] rounded-2xl border border-dashed border-[#dfd5da] cursor-pointer text-xs text-[#86868b] transition-all">
                <span className="truncate">{bannerImage ? bannerImage.name : 'Choose storefront banner...'}</span>
                <UploadSimple size={15} weight="duotone" className="text-[#1d1d1f] shrink-0" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-2xl border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-full bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Submitting Application...' : 'Register Campus Store'}</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-[11px] text-[#6e6e73]">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#1d1d1f] hover:underline">
              Sign in to Vendor Portal
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1.5 mt-4 text-[#86868b] text-[11px]">
          <ShieldCheck size={14} weight="duotone" className="text-[#8e6e7d]" />
          <span>AIU Campus Authentication & Verification Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;