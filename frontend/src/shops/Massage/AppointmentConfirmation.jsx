import React, { useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Download, CheckCircle, Sparkles, MapPin, Phone, Globe, Calendar, Clock, AlertCircle } from 'lucide-react';
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
    pdf.save(`Order-Receipt-${appointmentDetails.orderId || 'NEW'}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 animate-in fade-in zoom-in duration-300">
        
        {/* Receipt Content */}
        <div ref={contentRef} className="bg-white p-8 rounded-t-xl relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-16 -translate-x-16 opacity-50" />

          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-50">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
            <p className="text-gray-500 mt-1">Your appointment has been successfully scheduled</p>
          </div>

          {/* Receipt Card */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 mb-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">AIU Massage Center</h3>
                  <p className="text-sm text-gray-500">Relax & Rejuvenate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Order ID</p>
                <p className="font-mono font-bold text-gray-900">#{appointmentDetails.orderId || "PENDING"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Service</p>
                <p className="font-medium text-gray-900">{appointmentDetails.service}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Therapist</p>
                <p className="font-medium text-gray-900">{appointmentDetails.barber || "Professional Therapist"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <div className="flex items-center text-gray-900 font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-green-600" />
                  {appointmentDetails.date ? new Date(appointmentDetails.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Time</p>
                <div className="flex items-center text-gray-900 font-medium">
                  <Clock className="w-4 h-4 mr-2 text-green-600" />
                  {appointmentDetails.time}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 leading-relaxed">
                Please arrive 10 minutes before your scheduled time. 
                Cancellations must be made at least 2 hours in advance.
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>Student Center via Ar-Razi, AIU Campus</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Phone className="w-4 h-4" />
              <span>+60 12-345 6789</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-gray-50 px-8 py-6 rounded-b-xl border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Close
          </Button>
          <Button 
            onClick={handleDownload}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
