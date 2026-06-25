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
      
    pdf.save(`Barber-Appointment-${dateStr}.pdf`);
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
          <h3 className="font-bold text-lg text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-gray-800" />
            Booking Confirmed
          </h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="text-gray-700 border-gray-200 hover:bg-gray-50">
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
            <div style={{ borderBottom: '2px solid #111827' }} className="pb-6 mb-8 flex justify-between items-start">
              <div>
                <h1 style={{ color: '#111827' }} className="text-3xl font-bold mb-2">Barber Shop</h1>
                <p style={{ color: '#6b7280' }} className="text-sm uppercase tracking-widest">Premium Grooming Services</p>
              </div>
              <div style={{ color: '#4b5563' }} className="text-right text-sm">
                <p className="flex items-center justify-end mb-1"><MapPin className="w-3 h-3 mr-1" /> 456 Grooming St</p>
                <p className="flex items-center justify-end mb-1"><Phone className="w-3 h-3 mr-1" /> +1 (555) 987-6543</p>
                <p className="flex items-center justify-end"><Globe className="w-3 h-3 mr-1" /> www.pblstore.com</p>
              </div>
            </div>

            {/* Subject Line */}
            <div style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }} className="mb-8 p-4 rounded-lg border">
              <p style={{ color: '#111827' }} className="font-semibold text-center">
                Confirmed: Your Appointment at Barber Shop – {formatDate(appointmentDetails.date)}
              </p>
            </div>

            {/* Greeting */}
            <div className="mb-8" style={{ color: '#374151' }}>
              <p className="mb-4">Dear Customer,</p>
              <p>Thank you for choosing Barber Shop. Your appointment has been successfully scheduled. We look forward to providing you with our premium grooming services.</p>
            </div>

            {/* Appointment Details Table */}
            <div className="mb-8">
              <h4 style={{ color: '#111827', borderBottom: '1px solid #e5e7eb' }} className="font-bold pb-2 mb-4 uppercase text-sm tracking-wider">Appointment Details</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ color: '#4b5563' }} className="py-3 font-semibold w-1/3">Service</td>
                    <td style={{ color: '#111827' }} className="py-3 font-medium">{appointmentDetails.service}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ color: '#4b5563' }} className="py-3 font-semibold">Barber</td>
                    <td style={{ color: '#111827' }} className="py-3">{appointmentDetails.barberName}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ color: '#4b5563' }} className="py-3 font-semibold">Date</td>
                    <td style={{ color: '#111827' }} className="py-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" style={{ color: '#9ca3af' }} />
                      {formatDate(appointmentDetails.date)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ color: '#4b5563' }} className="py-3 font-semibold">Time</td>
                    <td style={{ color: '#111827' }} className="py-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" style={{ color: '#9ca3af' }} />
                      {appointmentDetails.time}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ color: '#4b5563' }} className="py-3 font-semibold">Location</td>
                    <td style={{ color: '#111827' }} className="py-3">Barber Shop, Main Floor</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Important Information */}
            <div style={{ backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }} className="mb-12 p-6 rounded-lg border">
              <h4 style={{ color: '#111827' }} className="font-bold mb-3 flex items-center text-sm uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 mr-2" />
                Important Information
              </h4>
              <ul style={{ color: '#4b5563' }} className="list-disc list-inside text-sm space-y-2 ml-1">
                <li>Please arrive 10 minutes before your scheduled time.</li>
                <li>If you need to cancel or reschedule, please do so at least 24 hours in advance.</li>
                <li>Cancellations within 24 hours may be subject to a fee.</li>
              </ul>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e5e7eb', color: '#9ca3af' }} className="mt-auto pt-8 text-center text-xs">
              <p className="mb-1">Barber Shop Inc. • 456 Grooming St, City, Country</p>
              <p>This is an automated confirmation. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
