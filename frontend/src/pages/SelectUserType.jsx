import React from 'react';
import { Link } from 'react-router-dom';
import { User, Storefront, ArrowRight, ShoppingBagOpen } from '@phosphor-icons/react';

const SelectUserType = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#f5f5f7] py-8 px-4 sm:px-6">
      <div className="w-full max-w-[380px]">
        <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs p-6 sm:p-7">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block group mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition-transform duration-200">
                <ShoppingBagOpen size={20} weight="duotone" />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
              Choose Account Type.
            </h1>
            <p className="text-[11px] text-[#6e6e73] mt-1 max-w-[260px] mx-auto">
              Select how you would like to participate in the AIU campus ecosystem.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/register?role=customer"
              className="group flex items-center justify-between p-3.5 rounded-2xl border border-[#e8e8ed] hover:border-[#dfd5da] bg-[#fbfbfd] hover:bg-[#f5edf0]/60 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#e8e8ed] text-[#1d1d1f] flex items-center justify-center group-hover:bg-[#1d1d1f] group-hover:text-white transition-all shadow-xs">
                  <User size={20} weight="duotone" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-[#1d1d1f]">Student & Customer</h3>
                  <p className="text-[10px] text-[#6e6e73]">Order food, services, and campus goods</p>
                </div>
              </div>
              <ArrowRight size={15} weight="bold" className="text-[#86868b] group-hover:text-[#1d1d1f] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/register/vendor"
              className="group flex items-center justify-between p-3.5 rounded-2xl border border-[#e8e8ed] hover:border-[#dfd5da] bg-[#fbfbfd] hover:bg-[#f5edf0]/60 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#e8e8ed] text-[#1d1d1f] flex items-center justify-center group-hover:bg-[#1d1d1f] group-hover:text-white transition-all shadow-xs">
                  <Storefront size={20} weight="duotone" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-[#1d1d1f]">Campus Store Vendor</h3>
                  <p className="text-[10px] text-[#6e6e73]">Manage your shop, menu, and orders</p>
                </div>
              </div>
              <ArrowRight size={15} weight="bold" className="text-[#86868b] group-hover:text-[#1d1d1f] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          <div className="mt-6 text-center text-[11px] text-[#6e6e73]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#1d1d1f] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectUserType;