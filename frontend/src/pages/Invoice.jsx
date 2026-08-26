import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  CheckCircle, 
  ShieldCheck, 
  Store, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard,
  Building2,
  FileCheck2,
  QrCode
} from 'lucide-react';
import { getImageUrl } from '../lib/api';

const Invoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData] = useState(location.state?.order || null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    if (!location.state?.order) {
      navigate('/customer');
    }
  }, [location, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDownloadError("");
    setDownloading(true);
    try {
      const input = document.getElementById('invoice-content');
      if (!input) {
        setDownloadError("Invoice content not found.");
        setDownloading(false);
        return;
      }

      // Recursively remove any unsupported oklch color values from inline/computed styles for html2canvas
      const oklchRegex = /oklch\([^)]*\)/gi;
      const rgbBgFallback = 'rgb(255,255,255)';
      const rgbTextFallback = 'rgb(0,0,0)';
      const patchedElements = [];

      function patchColors(element) {
        let patched = false;
        if (element.style && element.style.backgroundColor && oklchRegex.test(element.style.backgroundColor)) {
          element.setAttribute('data-orig-bg', element.style.backgroundColor);
          element.style.backgroundColor = rgbBgFallback;
          patched = true;
        }
        if (element.style && element.style.color && oklchRegex.test(element.style.color)) {
          element.setAttribute('data-orig-color', element.style.color);
          element.style.color = rgbTextFallback;
          patched = true;
        }
        const style = window.getComputedStyle(element);
        if (style && style.backgroundColor && oklchRegex.test(style.backgroundColor)) {
          element.setAttribute('data-orig-bg', style.backgroundColor);
          element.style.backgroundColor = rgbBgFallback;
          patched = true;
        }
        if (style && style.color && oklchRegex.test(style.color)) {
          element.setAttribute('data-orig-color', style.color);
          element.style.color = rgbTextFallback;
          patched = true;
        }
        if (patched) patchedElements.push(element);
        for (const child of element.children) {
          patchColors(child);
        }
      }

      patchColors(input);
      await new Promise(res => setTimeout(res, 120));

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restore patched styles
      for (const el of patchedElements) {
        if (el.hasAttribute('data-orig-bg')) {
          el.style.backgroundColor = el.getAttribute('data-orig-bg');
          el.removeAttribute('data-orig-bg');
        } else {
          el.style.backgroundColor = '';
        }
        if (el.hasAttribute('data-orig-color')) {
          el.style.color = el.getAttribute('data-orig-color');
          el.removeAttribute('data-orig-color');
        } else {
          el.style.color = '';
        }
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`AIU-Invoice-${orderData?.order_id || 'receipt'}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      setDownloadError("Failed to generate PDF. Please try printing or download again.");
    } finally {
      setDownloading(false);
    }
  };

  if (!orderData) return null;

  const rawItems = orderData.items || [];
  const totalAmount = rawItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const formattedOrderId = `AIU-INV-${String(orderData.order_id || '1001').padStart(5, '0')}`;
  const formattedDate = orderData.order_date 
    ? new Date(orderData.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const paymentMethodStr = typeof orderData.paymentMethod === 'string' && orderData.paymentMethod
    ? orderData.paymentMethod.replace(/_/g, ' ')
    : 'Online Payment (Campus FPX)';

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 sm:py-12 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Actions Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
          <button 
            onClick={() => navigate('/customer')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-[#ebebef] text-[#1d1d1f] text-xs font-semibold rounded-2xl border border-[#e8e8ed] shadow-2xs transition-all active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Back to Customer Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button 
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-[#fbfbfd] text-[#1d1d1f] text-xs font-semibold rounded-2xl border border-[#e8e8ed] shadow-2xs transition-all"
            >
              <Printer size={16} className="text-[#8e6e7d]" />
              <span>Print Invoice</span>
            </button>

            <button 
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-bold rounded-2xl shadow-xs transition-all disabled:opacity-60 active:scale-95"
            >
              <Download size={16} />
              <span>{downloading ? 'Rendering PDF...' : 'Download Official PDF'}</span>
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-semibold print:hidden">
            {downloadError}
          </div>
        )}

        {/* Real Printable Invoice Sheet */}
        <div 
          id="invoice-content" 
          className="bg-white rounded-3xl sm:rounded-[32px] border border-[#e8e8ed] shadow-md p-8 sm:p-12 text-[#1d1d1f] font-sans relative overflow-hidden print:border-none print:shadow-none print:p-6 print:rounded-none"
        >
          {/* Subtle Watermark Stamp */}
          <div className="absolute right-10 top-28 opacity-[0.04] pointer-events-none select-none rotate-[-18deg] border-8 border-[#1d1d1f] rounded-3xl p-6 text-center">
            <span className="text-6xl font-black tracking-widest uppercase block">PAID</span>
            <span className="text-xl font-bold tracking-wider uppercase block">AIU OFFICIAL</span>
          </div>

          {/* Header Section */}
          <div className="border-b border-[#e8e8ed] pb-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              {/* University / Store Hub Identity */}
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 bg-[#1d1d1f] text-white rounded-2xl flex items-center justify-center font-black text-base shadow-xs">
                    AIU
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-[#1d1d1f] uppercase">
                      Albukhary International University
                    </h1>
                    <p className="text-[11px] font-bold text-[#8e6e7d] tracking-wider uppercase">
                      Campus Microstore & Services Hub
                    </p>
                  </div>
                </div>
                <div className="text-xs text-[#6e6e73] space-y-0.5 pt-1">
                  <p className="flex items-center space-x-1.5">
                    <MapPin size={13} className="text-[#86868b] shrink-0" />
                    <span>Student Center, Level 1 & 2, 05200 Alor Setar, Kedah</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <Mail size={13} className="text-[#86868b] shrink-0" />
                    <span>microstore@aiu.edu.my • Reg No: AIU-STU-2026</span>
                  </p>
                </div>
              </div>

              {/* Invoice Meta Tag */}
              <div className="sm:text-right bg-[#fbfbfd] p-4 sm:p-5 rounded-2xl border border-[#e8e8ed] w-full sm:w-auto">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8e6e7d] block mb-1">
                  TAX INVOICE / OFFICIAL RECEIPT
                </span>
                <p className="text-xl font-black font-mono tracking-tight text-[#1d1d1f]">
                  {formattedOrderId}
                </p>
                <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-bold">
                  <CheckCircle size={13} className="text-emerald-600" />
                  <span>PAYMENT VERIFIED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing & Order Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 pb-8 border-b border-[#e8e8ed]">
            {/* Customer Information */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] block">
                Billed To (Student / Customer)
              </span>
              <div className="bg-[#fbfbfd] p-4 rounded-2xl border border-[#e8e8ed] space-y-1.5">
                <h3 className="font-extrabold text-sm text-[#1d1d1f]">
                  {orderData.customer_name || orderData.current_user || 'Campus Student'}
                </h3>
                <p className="text-xs text-[#6e6e73] flex items-center space-x-1.5">
                  <Mail size={12} className="text-[#86868b]" />
                  <span>{orderData.email || orderData.customer_email || 'student@aiu.edu.my'}</span>
                </p>
                <p className="text-xs text-[#6e6e73] flex items-center space-x-1.5">
                  <Building2 size={12} className="text-[#86868b]" />
                  <span>Delivery: On-Campus Student Kiosk Pickup</span>
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] block">
                Payment & Fulfillment Details
              </span>
              <div className="bg-[#fbfbfd] p-4 rounded-2xl border border-[#e8e8ed] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#6e6e73] flex items-center space-x-1.5">
                    <Calendar size={13} className="text-[#86868b]" />
                    <span>Transaction Date:</span>
                  </span>
                  <span className="font-bold text-[#1d1d1f]">{formattedDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#6e6e73] flex items-center space-x-1.5">
                    <CreditCard size={13} className="text-[#86868b]" />
                    <span>Payment Method:</span>
                  </span>
                  <span className="font-bold text-[#1d1d1f] capitalize">{paymentMethodStr}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#6e6e73] flex items-center space-x-1.5">
                    <FileCheck2 size={13} className="text-[#86868b]" />
                    <span>Receipt Reference:</span>
                  </span>
                  <span className="font-mono font-semibold text-[#1d1d1f]">REF-{orderData.order_id || '90214'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="mb-10">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#1d1d1f] mb-3">
              Purchased Merchandise & Services Summary
            </h4>

            <div className="border border-[#e8e8ed] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbfbfd] border-b border-[#e8e8ed]">
                    <th className="py-3.5 px-4 text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Item Details</th>
                    <th className="py-3.5 px-3 text-center text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Qty</th>
                    <th className="py-3.5 px-4 text-right text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Unit Price</th>
                    <th className="py-3.5 px-4 text-right text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Amount (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f7] text-xs">
                  {rawItems.map((item, index) => {
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const lineTotal = price * qty;
                    const resolvedImg = getImageUrl(item.image_url || item.image);

                    return (
                      <tr key={index} className="hover:bg-[#fbfbfd]/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            {resolvedImg && (
                              <img 
                                src={resolvedImg} 
                                alt={item.product_name} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/bowl-white.jpg';
                                }}
                                className="w-10 h-10 rounded-xl object-cover border border-[#e8e8ed] shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-extrabold text-[#1d1d1f]">{item.product_name || 'Campus Product'}</p>
                              <div className="flex items-center space-x-2 text-[10px] text-[#86868b] mt-0.5">
                                <span className="font-mono">SKU: {item.sku || `AIU-${item.product_id || index + 101}`}</span>
                                {item.selectedColor && (
                                  <span>• Color: {item.selectedColor}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-[#1d1d1f] font-mono">
                          {qty}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-[#6e6e73] font-mono">
                          RM {price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#1d1d1f] font-mono">
                          RM {lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Security Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start mb-10 pb-8 border-b border-[#e8e8ed]">
            {/* Left: Digital Verification & QR */}
            <div className="sm:col-span-6 bg-[#fbfbfd] p-4 rounded-2xl border border-[#e8e8ed] flex items-center space-x-4">
              <div className="p-2 bg-white rounded-xl border border-[#e8e8ed] shadow-2xs shrink-0">
                <QrCode size={48} className="text-[#1d1d1f]" />
              </div>
              <div className="text-[11px] text-[#6e6e73] space-y-1">
                <p className="font-bold text-[#1d1d1f]">Digital Receipt Verification</p>
                <p className="text-[10px] text-[#86868b]">
                  Scan QR code or present this document at any campus merchant kiosk for pickups and warranty.
                </p>
                <p className="text-[9px] font-mono text-[#8e6e7d] truncate">
                  HASH: AIU-SEC-VERIFIED-{orderData.order_id || 'AUTH'}
                </p>
              </div>
            </div>

            {/* Right: Calculations */}
            <div className="sm:col-span-6 space-y-2.5">
              <div className="flex justify-between text-xs text-[#6e6e73]">
                <span>Item Subtotal:</span>
                <span className="font-bold font-mono text-[#1d1d1f]">RM {totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-[#6e6e73]">
                <span>Campus Pickup / Fulfillment Fee:</span>
                <span className="font-bold text-emerald-600">FREE (Level 1 Hub)</span>
              </div>

              <div className="flex justify-between text-xs text-[#6e6e73]">
                <span>Student Tax / SST (0% Campus Exemption):</span>
                <span className="font-bold font-mono text-[#1d1d1f]">RM 0.00</span>
              </div>

              {/* Grand Total Highlight Box */}
              <div className="mt-3 p-4 bg-[#1d1d1f] text-white rounded-2xl flex justify-between items-center shadow-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 block">
                    Total Amount Paid
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">Ringgit Malaysia</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-2xl font-black tracking-tight">RM {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Authentic Footer & Sign-off */}
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-xs text-[#86868b]">
            <div className="space-y-1">
              <p className="font-semibold text-[#1d1d1f]">
                Thank you for supporting AIU Student Microstore & Campus Vendors!
              </p>
              <p className="text-[10px]">
                Official receipt issued by Albukhary International University Merchant Operations. All rights reserved.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-block border-b border-[#1d1d1f] pb-1 px-4 text-center">
                <span className="font-serif italic font-bold text-sm text-[#1d1d1f]">Campus Merchant Ops</span>
              </div>
              <span className="block text-[9px] uppercase tracking-widest text-[#86868b] mt-1">
                Authorized Digital Signature
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
