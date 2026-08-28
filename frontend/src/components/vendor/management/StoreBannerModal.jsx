import React from 'react';
import { X } from '@phosphor-icons/react';
import StoreBannerManager from './StoreBannerManager';

const StoreBannerModal = ({ isOpen, onClose, store, onBannerUpdated }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e8e8ed] w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#e8e8ed] flex items-center justify-between bg-[#fbfbfd]">
          <span className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
            Edit Storefront Banner
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <StoreBannerManager
            store={store}
            onBannerUpdated={(updated) => {
              if (onBannerUpdated) onBannerUpdated(updated);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StoreBannerModal;
