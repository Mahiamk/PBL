import React, { useEffect, useState, useRef } from 'react';
import { fetchStoreAppointments, updateAppointmentStatus } from '../../../lib/api';
import { Calendar, Clock, User, Check, X } from 'lucide-react';

const AppointmentManager = ({ storeId, appointments: propAppointments, selectedId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedRowRef = useRef(null);

  useEffect(() => {
    if (selectedId && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId, appointments]);

  useEffect(() => {
    if (propAppointments) {
      setAppointments(propAppointments);
      setLoading(false);
    } else if (storeId) {
      setLoading(true);
      fetchStoreAppointments(storeId)
        .then(setAppointments)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [storeId, propAppointments]);

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      setAppointments(prev => prev.map(appt => 
        appt.appointment_id === appointmentId ? { ...appt, status } : appt
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update appointment status');
    }
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appt) => (
              <tr 
                key={appt.appointment_id} 
                className={selectedId && parseInt(selectedId) === appt.appointment_id ? 'bg-blue-50 ring-2 ring-blue-500' : ''}
                ref={selectedId && parseInt(selectedId) === appt.appointment_id ? selectedRowRef : null}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{appt.customer_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.service_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(appt.booking_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(appt.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    String(appt.status) === '1' || appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                    String(appt.status) === '-1' || appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {String(appt.status) === '0' ? 'Pending' : 
                     String(appt.status) === '1' ? 'Confirmed' : 
                     String(appt.status) === '-1' ? 'Cancelled' : appt.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {(String(appt.status) === '0' || appt.status === 'Pending') && (
                    <div className="flex gap-2">
                       <button
                        onClick={() => handleStatusUpdate(appt.appointment_id, '1')}
                        className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full hover:bg-green-100 transition-colors"
                        title="Accept"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appt.appointment_id, '-1')}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="Decline"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentManager;