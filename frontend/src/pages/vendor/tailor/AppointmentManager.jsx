import React, { useEffect, useState, useRef } from 'react';
import { fetchStoreAppointments, updateAppointmentStatus } from '../../../lib/api';
import { 
  CalendarCheck, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  Scissors
} from '@phosphor-icons/react';

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
        .then(data => setAppointments(data || []))
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

  const getStatusBadge = (status = '') => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Completed</span>
          </span>
        );
      case 'confirmed':
      case 'accepted':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Confirmed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>{status || 'Pending'}</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#86868b]">
        Loading appointments schedule...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#e8e8ed] shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-[#8e6e7d] uppercase tracking-widest block mb-1">
            Studio Schedule
          </span>
          <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">Appointments & Client Bookings</h2>
          <p className="text-xs text-[#6e6e73]">
            Track fittings, tailoring consults, and scheduled campus sessions.
          </p>
        </div>
        <span className="text-xs font-bold text-[#1d1d1f] bg-[#f5f5f7] px-3.5 py-1.5 rounded-full border border-[#e8e8ed]">
          {appointments.length} Total Bookings
        </span>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f0eaed] text-left text-xs">
            <thead className="bg-[#fbfbfd] text-[#86868b] uppercase text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3.5">Client Name</th>
                <th className="px-5 py-3.5">Service Requested</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eaed] text-[#1d1d1f]">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-[#86868b]">
                    <CalendarCheck size={36} weight="duotone" className="mx-auto mb-2 opacity-50" />
                    No active appointments scheduled.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => {
                  const isSelected = selectedId && String(appt.appointment_id) === String(selectedId);

                  return (
                    <tr 
                      key={appt.appointment_id} 
                      ref={isSelected ? selectedRowRef : null}
                      className={`hover:bg-[#fbfbfd] transition-colors ${isSelected ? 'bg-[#f5edf0]/40' : ''}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#f5edf0] text-[#594951] font-bold text-xs flex items-center justify-center shrink-0">
                            {appt.user_name?.[0] || 'C'}
                          </div>
                          <div>
                            <span className="font-bold text-[#1d1d1f] block">{appt.user_name || 'Campus Client'}</span>
                            <span className="text-[10px] text-[#86868b]">ID: #{appt.appointment_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#6e6e73]">
                        {appt.service_name || 'Bespoke Fitting / Tailoring'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-1.5 text-[#1d1d1f] font-bold">
                          <Clock size={14} className="text-[#86868b]" />
                          <span>{appt.appointment_date} @ {appt.appointment_time || '10:00 AM'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {getStatusBadge(appt.status)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {appt.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusUpdate(appt.appointment_id, 'Completed')}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {appt.status !== 'Confirmed' && appt.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusUpdate(appt.appointment_id, 'Confirmed')}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                            >
                              Confirm
                            </button>
                          )}
                          {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusUpdate(appt.appointment_id, 'Cancelled')}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManager;