import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  UploadSimple, 
  Trash, 
  CheckCircle, 
  WarningCircle, 
  Sparkle, 
  ArrowCounterClockwise,
  Eye,
  Storefront
} from '@phosphor-icons/react';
import { updateStoreBanner, deleteStoreBanner, getImageUrl } from '../../../lib/api';

const StoreBannerManager = ({ store, onBannerUpdated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const fileInputRef = useRef(null);

  const currentBannerUrl = store?.image_url;
  const storeId = store?.store_id;
  const storeName = store?.store_name || 'Your Store';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file size must be less than 5MB.' });
      return;
    }

    setSelectedFile(file);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async () => {
    if (!selectedFile || !storeId) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const updated = await updateStoreBanner(storeId, formData);
      setStatusMessage({ type: 'success', text: 'Shop banner updated successfully!' });
      setSelectedFile(null);
      setPreviewUrl(null);

      if (onBannerUpdated) {
        onBannerUpdated(updated);
      }
    } catch (error) {
      console.error('Failed to update banner:', error);
      const errMsg = error.response?.data?.detail || 'Failed to upload new banner. Please try again.';
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!storeId) return;
    const confirmDelete = window.confirm('Are you sure you want to remove your custom banner? It will reset to the default campus banner.');
    if (!confirmDelete) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const updated = await deleteStoreBanner(storeId);
      setStatusMessage({ type: 'success', text: 'Custom banner removed. Default banner restored.' });
      setSelectedFile(null);
      setPreviewUrl(null);

      if (onBannerUpdated) {
        onBannerUpdated(updated);
      }
    } catch (error) {
      console.error('Failed to remove banner:', error);
      const errMsg = error.response?.data?.detail || 'Failed to remove banner. Please try again.';
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayBanner = previewUrl || (currentBannerUrl ? getImageUrl(currentBannerUrl) : null);

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e8ed]">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#f5edf0] rounded-full text-[11px] font-bold text-[#8e6e7d] mb-2">
            <Sparkle size={13} weight="fill" />
            <span>Storefront Appearance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1d1d1f] tracking-tight">Shop Banner & Branding</h2>
          <p className="text-xs text-[#6e6e73] mt-1">
            Customize the header banner displayed on your public storefront and vendor profile.
          </p>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
          ) : (
            <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#f0eaed] flex items-center justify-between bg-[#fbfbfd]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f5edf0] text-[#594951] flex items-center justify-center">
              <Eye size={17} weight="duotone" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">Live Storefront Preview</h3>
              <p className="text-[11px] text-[#86868b]">How campus students and staff will see your shop header</p>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            previewUrl 
              ? 'bg-amber-100 text-amber-800 animate-pulse' 
              : currentBannerUrl 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-gray-100 text-gray-700'
          }`}>
            {previewUrl ? 'Unsaved Preview' : currentBannerUrl ? 'Custom Banner Active' : 'Default Campus Banner'}
          </span>
        </div>

        {/* Banner Mockup Box */}
        <div className="p-5 sm:p-6">
          <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1d1d1f] to-[#333336] shadow-inner flex items-center justify-center">
            {displayBanner ? (
              <img 
                src={displayBanner} 
                alt={`${storeName} Banner`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/banner-one.png';
                }}
              />
            ) : (
              <div className="text-center p-6 text-white/80 space-y-2">
                <Storefront size={42} weight="duotone" className="mx-auto opacity-70" />
                <p className="text-sm font-bold text-white">{storeName}</p>
                <p className="text-xs text-white/60">No custom banner uploaded yet. Default theme banner is displayed.</p>
              </div>
            )}

            {/* Mockup Overlay Title */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-white flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  Official Campus Store
                </span>
                <h4 className="text-lg sm:text-xl font-black text-white mt-1 drop-shadow-sm">{storeName}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Actions / Controls */}
      <div className="bg-white rounded-3xl border border-[#e8e8ed] p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#1d1d1f]">Banner Management Options</h3>
          <p className="text-xs text-[#6e6e73] mt-0.5">
            Upload an eye-catching photo representing your brand, services, or catalog.
          </p>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center space-x-2 active:scale-98 disabled:opacity-50"
          >
            <UploadSimple size={16} weight="bold" />
            <span>{currentBannerUrl ? 'Choose New Banner Photo' : 'Upload Store Banner'}</span>
          </button>

          {previewUrl && (
            <>
              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center space-x-2 active:scale-98 disabled:opacity-50"
              >
                <CheckCircle size={16} weight="bold" />
                <span>{loading ? 'Saving...' : 'Apply & Save Banner'}</span>
              </button>

              <button
                type="button"
                onClick={cancelSelection}
                disabled={loading}
                className="px-4 py-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold rounded-2xl transition-all flex items-center space-x-1.5"
              >
                <ArrowCounterClockwise size={15} weight="bold" />
                <span>Cancel</span>
              </button>
            </>
          )}

          {currentBannerUrl && !previewUrl && (
            <button
              type="button"
              onClick={handleRemoveBanner}
              disabled={loading}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-2xl transition-all flex items-center space-x-1.5 active:scale-98 disabled:opacity-50"
            >
              <Trash size={15} weight="bold" />
              <span>{loading ? 'Removing...' : 'Remove Custom Banner'}</span>
            </button>
          )}
        </div>

        {/* Banner Specifications / Guidelines */}
        <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-[#f0eaed] text-xs space-y-2">
          <span className="font-bold text-[#1d1d1f] block text-[11px] uppercase tracking-wider">
            Recommended Banner Guidelines:
          </span>
          <ul className="text-[#6e6e73] space-y-1 list-disc list-inside text-[11px] leading-relaxed">
            <li><strong>Optimal Dimensions:</strong> 1200 × 400 pixels or 1920 × 600 pixels (aspect ratio ~3:1).</li>
            <li><strong>Supported Formats:</strong> PNG, JPG, JPEG, WEBP.</li>
            <li><strong>File Size Limit:</strong> Maximum 5 MB for fast campus network loading.</li>
            <li><strong>Visual Tip:</strong> Place important text or logos toward the center or upper area to avoid obstruction.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StoreBannerManager;
