import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { ArrowLeft, Download, Printer } from 'lucide-react';

const Invoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData] = useState(location.state?.order || null);
  
  useEffect(() => {
    // We can pass order data via navigation state or fetch it
    if (!location.state?.order) {
      // Fallback: redirects to dashboard if no data
      navigate('/customer');
    }
  }, [location, navigate]);

    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState("");

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
            // Recursively remove all oklch color values from inline and computed styles
            const oklchRegex = /oklch\([^)]*\)/gi;
            const rgbBgFallback = 'rgb(255,255,255)';
            const rgbTextFallback = 'rgb(0,0,0)';
            const patchedElements = [];
            function patchColors(element) {
                let patched = false;
                // Remove oklch from inline style
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
                // Remove oklch from computed style
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
            // Wait a tick to ensure rendering
            await new Promise(res => setTimeout(res, 100));
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            // Restore patched elements
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
            pdf.save(`invoice-${orderData?.order_id || 'new'}.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
            setDownloadError("Failed to generate PDF. Try again. " + (err?.message || ''));
        } finally {
            setDownloading(false);
        }
    };

  if (!orderData) return null;

  const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // const tax = totalAmount * 0.06; // Mock tax 6%
  const grandTotal = totalAmount;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6 no-print">
            <button 
                onClick={() => navigate('/customer')}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
                <ArrowLeft size={18} className="mr-2" />
                Back to Dashboard
            </button>
            
                        <div className="flex flex-col gap-2 items-end">
                            <button 
                                onClick={handleDownloadPDF}
                                className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60"
                                disabled={downloading}
                            >
                                <Download size={18} className="mr-2" />
                                {downloading ? 'Generating PDF...' : 'Download PDF'}
                            </button>
                            {downloadError && (
                                <span className="text-red-500 text-xs mt-1">{downloadError}</span>
                            )}
                        </div>
        </div>

        {/* Invoice Paper */}
        <div id="invoice-content" className="bg-white p-8 md:p-12 shadow-md rounded-none mx-auto print:shadow-none print:w-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-3xl font-serif font-medium tracking-tight mb-2">INVOICE</h1>
                    <p className="text-gray-500 font-mono text-sm">#{orderData.order_id || 'PENDING'}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold tracking-wider mb-1">AIU MICROSTORE</h2>
                    <p className="text-gray-500 text-sm">05200 Albukhary International University</p>
                    <p className="text-gray-500 text-sm">Student Center, Level 1</p>
                    <p className="text-gray-500 text-sm">3zero@aiumicrostore.com</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Bill To</h3>
                    <p className="font-medium text-gray-900">{orderData.customer_name || orderData.current_user || 'Valued Customer'}</p>
                    <p className="text-gray-500 text-sm mt-1">{orderData.email || orderData.customer_email || 'customer@email.com'}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Order Details</h3>
                    <div className="space-y-1">
                        <p className="text-sm">
                            <span className="text-gray-500 mr-2">Date:</span>
                            {orderData.order_date ? new Date(orderData.order_date).toLocaleDateString() : new Date().toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500 mr-2">Payment Method:</span>
                            <span className="capitalize">{typeof orderData.paymentMethod === 'string' ? orderData.paymentMethod : 'Online'}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500 mr-2">Status:</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Paid
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-12">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-3 text-xs font-bold uppercase tracking-widest">Item Description</th>
                            <th className="py-3 text-right text-xs font-bold uppercase tracking-widest">Qty</th>
                            <th className="py-3 text-right text-xs font-bold uppercase tracking-widest">Price</th>
                            <th className="py-3 text-right text-xs font-bold uppercase tracking-widest">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orderData.items.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4">
                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{item.sku || `SKU-${item.product_id}`}</p>
                                </td>
                                <td className="py-4 text-right font-mono text-gray-600">{item.quantity}</td>
                                <td className="py-4 text-right font-mono text-gray-600">${Number(item.price).toFixed(2)}</td>
                                <td className="py-4 text-right font-bold text-gray-900 font-mono">
                                    ${(Number(item.price) * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end border-t border-gray-100 pt-8">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium font-mono">${totalAmount.toFixed(2)}</span>
                    </div>
                    {/* <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax (6%)</span>
                        <span className="font-medium font-mono">${tax.toFixed(2)}</span>
                    </div> */}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                        <span>Total</span>
                        <span>${grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Thank you for your business</p>
                <div className="h-px w-16 bg-gray-200 mx-auto"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
