import React, { useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Download, CheckCircle, Scissors, MapPin, Phone, Globe, Calendar, Clock, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AppointmentConfirmation = ({ appointmentDetails, onClose }) => {
  const contentRef = useRef(null);

  const handleDownload = async () => {
    const element = contentRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Format date for filename
    const dateStr = appointmentDetails.date instanceof Date 
      ? appointmentDetails.date.toISOString().split('T')[0] 
      : 'details';
      
    pdf.save(`Appointment-Confirmation-${dateStr}.pdf`);
  };

  // Format date for display
  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-auto animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header Actions */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-xl">
          <h3 className="font-bold text-lg text-green-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Booking Confirmed
          </h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="text-green-700 border-green-200 hover:bg-green-50">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              Close
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="overflow-y-auto bg-gray-50 p-4 sm:p-8">
          <div 
            ref={contentRef} 
            className="p-8 sm:p-12 shadow-sm mx-auto max-w-[210mm] min-h-[297mm] sm:min-h-0 relative"
            style={{ 
              fontFamily: 'serif',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb'
            }} 
          >
            {/* Letterhead */}
            <div style={{ borderBottom: '2px solid #14532d' }} className="pb-6 mb-8 flex justify-between items-start">
              <div>
                <h1 style={{ color: '#14532d' }} className="text-3xl font-bold mb-2">Tailor Shop</h1>
                <p style={{ color: '#6b7280' }} className="text-sm uppercase tracking-widest">Bespoke Tailoring & Alterations</p>
              </div>
              <div style={{ color: '#4b5563' }} className="text-right text-sm">
                <p className="flex items-center justify-end mb-1"><MapPin className="w-3 h-3 mr-1" /> 123 Fashion Avenue</p>
                <p className="flex items-center justify-end mb-1"><Phone className="w-3 h-3 mr-1" /> +1 (555) 123-4567</p>
                <p className="flex items-center justify-end"><Globe className="w-3 h-3 mr-1" /> www.pblstore.com</p>
              </div>
            </div>

            {/* Subject Line */}
            <div style={{ backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }} className="mb-8 p-4 rounded-lg border">
              <p style={{ color: '#14532d' }} className="font-semibold text-center">
                Confirmed: Your Tailoring Appointment at Tailor Shop – {formatDate(appointmentDetails.date)}
              </p>
            </div>

            {/* Greeting */}
            <div style={{ color: '#1f2937' }} className="mb-6">
              <p className="mb-4">Hi <strong>Valued Client</strong>,</p>
              <p>Your tailoring appointment is confirmed! We look forward to helping you achieve the perfect fit.</p>
            </div>

            {/* Appointment Details Box */}
            <div style={{ borderColor: '#e5e7eb' }} className="mb-8 border rounded-lg overflow-hidden">
              <div style={{ backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', color: '#374151' }} className="px-6 py-3 border-b font-bold">
                Appointment Details
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p style={{ color: '#6b7280' }} className="text-xs uppercase tracking-wider mb-1">Service</p>
                  <p style={{ color: '#111827' }} className="font-semibold flex items-center">
                    <Scissors style={{ color: '#15803d' }} className="w-4 h-4 mr-2" />
                    {appointmentDetails.service}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280' }} className="text-xs uppercase tracking-wider mb-1">Location</p>
                  <p style={{ color: '#111827' }} className="font-semibold">123 Fashion Avenue, Design District</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280' }} className="text-xs uppercase tracking-wider mb-1">Date</p>
                  <p style={{ color: '#111827' }} className="font-semibold flex items-center">
                    <Calendar style={{ color: '#15803d' }} className="w-4 h-4 mr-2" />
                    {formatDate(appointmentDetails.date)}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280' }} className="text-xs uppercase tracking-wider mb-1">Time</p>
                  <p style={{ color: '#111827' }} className="font-semibold flex items-center">
                    <Clock style={{ color: '#15803d' }} className="w-4 h-4 mr-2" />
                    {appointmentDetails.time}
                  </p>
                </div>
              </div>
            </div>

            {/* Preparation Instructions */}
            <div className="mb-8">
              <h3 style={{ color: '#111827', borderColor: '#e5e7eb' }} className="font-bold mb-4 border-b pb-2">To ensure the best result, please bring:</h3>
              <ul style={{ color: '#374151' }} className="space-y-3">
                <li className="flex items-start">
                  <span className="font-bold mr-2 min-w-[100px]">Shoes:</span>
                  <span>The exact shoes you plan to wear with the garment (essential for hemming).</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 min-w-[100px]">Undergarments:</span>
                  <span>The specific undergarments or shapewear you will wear with the item.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 min-w-[100px]">Accessories:</span>
                  <span>Any belts or jewelry that may affect the garment's drape.</span>
                </li>
              </ul>
            </div>

            {/* Timeline & Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div style={{ backgroundColor: '#eff6ff', borderColor: '#dbeafe' }} className="p-5 rounded-lg border">
                <h4 style={{ color: '#1e3a8a' }} className="font-bold mb-2 text-sm uppercase">Estimated Timeline</h4>
                <p style={{ color: '#1e40af' }} className="text-sm">
                  Standard turnaround time is <strong>2–3 weeks</strong> depending on the complexity of your alterations.
                </p>
              </div>
              <div style={{ backgroundColor: '#fef2f2', borderColor: '#fee2e2' }} className="p-5 rounded-lg border">
                <h4 style={{ color: '#7f1d1d' }} className="font-bold mb-2 text-sm uppercase flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> Cancellation Policy
                </h4>
                <p style={{ color: '#991b1b' }} className="text-sm">
                  Please notify us at least <strong>24 hours</strong> in advance to avoid a <strong>$20</strong> cancellation fee.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderColor: '#e5e7eb' }} className="text-center border-t pt-8 mt-8">
              <p style={{ color: '#14532d' }} className="text-xl font-serif italic mb-2">See you soon!</p>
              <p style={{ color: '#4b5563' }} className="font-bold">Tailor Shop Team</p>
              <p style={{ color: '#6b7280' }} className="text-sm mt-1">+1 (555) 123-4567 | www.pblstore.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
