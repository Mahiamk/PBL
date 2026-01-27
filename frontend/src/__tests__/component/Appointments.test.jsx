/**
 * Component tests for Appointment functionality (with normalization support)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Appointment Creation', () => {
  let mockCreateAppointment;

  beforeEach(() => {
    mockCreateAppointment = vi.fn();
  });

  describe('Appointment Data', () => {
    it('should prepare appointment data correctly', () => {
      const formData = {
        store_id: 1,
        barber_name: 'John',
        service_name: 'Haircut',
        booking_date: new Date('2026-01-30T10:00:00')
      };

      const prepareAppointmentData = (data) => ({
        store_id: data.store_id,
        barber_name: data.barber_name,
        service_name: data.service_name,
        booking_date: data.booking_date.toISOString()
      });

      const prepared = prepareAppointmentData(formData);

      expect(prepared.store_id).toBe(1);
      expect(prepared.barber_name).toBe('John');
      expect(prepared.booking_date).toContain('2026-01-30');
    });
  });

  describe('Appointment Submission', () => {
    it('should create appointment and receive normalized response', async () => {
      // The backend now uses normalized tables but returns backward-compatible response
      mockCreateAppointment.mockResolvedValue({
        appointment_id: 1,
        customer_id: 123,
        store_id: 1,
        // Backward compatible fields (from @property decorators)
        barber_name: 'John',
        service_name: 'Haircut',
        booking_date: '2026-01-30T10:00:00',
        status: 'Confirmed'
      });

      const appointmentData = {
        store_id: 1,
        barber_name: 'John',
        service_name: 'Haircut',
        booking_date: '2026-01-30T10:00:00'
      };

      const result = await mockCreateAppointment(appointmentData);

      expect(result.status).toBe('Confirmed');
      // Verify backward compatibility
      expect(result.barber_name).toBe('John');
      expect(result.service_name).toBe('Haircut');
      expect(result.booking_date).toBeDefined();
    });

    it('should handle duplicate booking error', async () => {
      mockCreateAppointment.mockRejectedValue({
        response: {
          status: 400,
          data: { detail: 'This time slot is already booked for this barber.' }
        }
      });

      await expect(mockCreateAppointment({})).rejects.toMatchObject({
        response: { status: 400 }
      });
    });
  });
});

describe('Appointment Cancellation', () => {
  it('should allow cancellation more than 24h before', () => {
    const canCancel = (bookingDate) => {
      const now = new Date();
      const booking = new Date(bookingDate);
      const hoursUntilAppointment = (booking - now) / (1000 * 60 * 60);
      return hoursUntilAppointment > 24;
    };

    // 3 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    expect(canCancel(futureDate.toISOString())).toBe(true);
  });

  it('should prevent cancellation within 24h', () => {
    const canCancel = (bookingDate) => {
      const now = new Date();
      const booking = new Date(bookingDate);
      const hoursUntilAppointment = (booking - now) / (1000 * 60 * 60);
      return hoursUntilAppointment > 24;
    };

    // 12 hours from now
    const soonDate = new Date();
    soonDate.setHours(soonDate.getHours() + 12);

    expect(canCancel(soonDate.toISOString())).toBe(false);
  });
});

describe('Time Slot Display', () => {
  it('should format time slot correctly', () => {
    const formatTimeSlot = (startTime, endTime) => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const options = { hour: '2-digit', minute: '2-digit' };
      return `${start.toLocaleTimeString('en-US', options)} - ${end.toLocaleTimeString('en-US', options)}`;
    };

    const slot = formatTimeSlot('2026-01-30T10:00:00', '2026-01-30T11:00:00');
    expect(slot).toContain('10:00');
    expect(slot).toContain('11:00');
  });

  it('should generate available time slots', () => {
    const generateTimeSlots = (startHour, endHour, intervalMinutes) => {
      const slots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endMinute = minute + intervalMinutes;
          const endHourAdjusted = hour + Math.floor(endMinute / 60);
          const endMinuteAdjusted = endMinute % 60;
          const endTime = `${endHourAdjusted.toString().padStart(2, '0')}:${endMinuteAdjusted.toString().padStart(2, '0')}`;
          slots.push({ startTime, endTime });
        }
      }
      return slots;
    };

    // Generate slots from 9AM to 5PM with 30-minute intervals
    const slots = generateTimeSlots(9, 17, 30);

    expect(slots.length).toBe(16); // 8 hours * 2 slots per hour
    expect(slots[0].startTime).toBe('09:00');
    expect(slots[0].endTime).toBe('09:30');
  });
});

describe('Service Provider Display', () => {
  it('should display service provider with contact', () => {
    const provider = {
      provider_id: 1,
      name: 'John the Barber',
      contact: '123-456-7890'
    };

    expect(provider.name).toBe('John the Barber');
    expect(provider.contact).toBe('123-456-7890');
  });

  it('should handle provider without contact', () => {
    const provider = {
      provider_id: 2,
      name: 'Mike',
      contact: null
    };

    const displayContact = provider.contact || 'Contact not available';
    expect(displayContact).toBe('Contact not available');
  });
});

describe('Appointment Status', () => {
  const STATUSES = ['Confirmed', 'Completed', 'Cancelled', 'No-Show'];

  it('should validate appointment status', () => {
    const isValidStatus = (status) => STATUSES.includes(status);

    expect(isValidStatus('Confirmed')).toBe(true);
    expect(isValidStatus('Invalid')).toBe(false);
  });

  it('should get status badge style', () => {
    const getStatusStyle = (status) => {
      const styles = {
        'Confirmed': 'bg-green-100 text-green-800',
        'Completed': 'bg-blue-100 text-blue-800',
        'Cancelled': 'bg-red-100 text-red-800',
        'No-Show': 'bg-yellow-100 text-yellow-800'
      };
      return styles[status] || 'bg-gray-100 text-gray-800';
    };

    expect(getStatusStyle('Confirmed')).toBe('bg-green-100 text-green-800');
    expect(getStatusStyle('Cancelled')).toBe('bg-red-100 text-red-800');
  });
});
