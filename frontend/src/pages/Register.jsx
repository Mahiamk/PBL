import React, { useState } from 'react';
import { register } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  EnvelopeSimple,
  LockKey,
  Phone,
  ArrowRight,
  ShoppingBagOpen,
  ShieldCheck,
} from '@phosphor-icons/react';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    initial: '',
    phone_number: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        initial: formData.initial || null,
        phone_number: formData.phone_number || null,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#f5f5f7] py-8 px-4 sm:px-6">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs p-6 sm:p-7">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block group mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition-transform duration-200">
                <ShoppingBagOpen size={20} weight="duotone" />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
              Create AIU Account.
            </h1>
            <p className="text-[11px] text-[#6e6e73] mt-1 max-w-[260px] mx-auto">
              Join the student & campus marketplace community in seconds.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#fff5f5] border border-[#fed7d7] rounded-2xl text-[11px] text-[#c53030] flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e53e3e] shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  First Name
                </label>
                <input
                  name="first_name"
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Last Name
                </label>
                <input
                  name="last_name"
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Initial <span className="text-[#86868b] lowercase font-normal">(opt)</span>
                </label>
                <input
                  name="initial"
                  type="text"
                  maxLength={10}
                  placeholder="M."
                  value={formData.initial}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Phone <span className="text-[#86868b] lowercase font-normal">(opt)</span>
                </label>
                <input
                  name="phone_number"
                  type="tel"
                  placeholder="+60..."
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeSimple
                  size={15}
                  weight="duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="student@aiu.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f] mb-1">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#f0eaed] focus:bg-white text-xs text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-transparent focus:border-[#dfd5da] focus:ring-2 focus:ring-[#1d1d1f]/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-full bg-[#1d1d1f] hover:bg-[#333336] active:scale-95 text-white font-medium text-xs transition-all shadow-xs disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Creating Account...' : 'Complete Registration'}</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-[11px] text-[#6e6e73]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#1d1d1f] hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1.5 mt-4 text-[#86868b] text-[11px]">
          <ShieldCheck size={14} weight="duotone" className="text-[#8e6e7d]" />
          <span>AIU Campus Authentication Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default Register;