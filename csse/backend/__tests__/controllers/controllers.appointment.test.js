jest.mock('../../models/Appointment');
jest.mock('../../models/DoctorBooking');
const Appointment = require('../../models/Appointment');
const DoctorBooking = require('../../models/DoctorBooking');
const { bookAppointment, getAvailableSlots, getAllAppointments, getDoctorAppointments } = require('../../controllers/appointmentController');

const res = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe('appointmentController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('bookAppointment validates required fields', async () => {
    const r = res();
    await bookAppointment({ body: {} }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });

  test('bookAppointment fails when doctor not found', async () => {
    const r = res();
    DoctorBooking.findById = jest.fn().mockResolvedValue(null);
    await bookAppointment({ body: { patientName: 'A', age: 30, doctorId: 'd1', date: '2024-01-01', slotTime: '08:00' } }, r);
    expect(r.status).toHaveBeenCalledWith(404);
  });

  test('getAvailableSlots computes and excludes booked', async () => {
    DoctorBooking.findById = jest.fn().mockResolvedValue({ startTime: '08:00', endTime: '09:00' });
    Appointment.find = jest.fn().mockResolvedValue([{ slotTime: '08:15' }]);
    const r = res();
    await getAvailableSlots({ query: { doctorId: 'd1', date: '2024-01-01' } }, r);
    expect(r.status).not.toHaveBeenCalledWith(404);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ slots: expect.arrayContaining(['08:00', '08:30', '08:45']) }));
  });

  test('bookAppointment success path assigns queue number', async () => {
    DoctorBooking.findById = jest.fn().mockResolvedValue({ _id: 'doc1', doctorName: 'Doc', doctorId: 'REG1' });
    Appointment.findOne = jest.fn().mockResolvedValue(null);
    Appointment.find = jest.fn().mockResolvedValue([{},{ }]); // queueNumber = 3
    jest.spyOn(Appointment.prototype, 'save').mockResolvedValue();
    const r = res();
    await bookAppointment({ body: { patientName: 'A', age: 30, doctorId: 'doc1', date: '2024-01-01', slotTime: '08:30' } }, r);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('getAllAppointments and getDoctorAppointments branches', async () => {
    Appointment.find = jest.fn().mockResolvedValue([{ id: 1 }]);
    const r1 = res();
    await getAllAppointments({}, r1);
    expect(r1.json).toHaveBeenCalledWith([{ id: 1 }]);

    // missing registerNumber
    const r2 = res();
    await getDoctorAppointments({ query: {} }, r2);
    expect(r2.status).toHaveBeenCalledWith(400);

    // not found doctor
    DoctorBooking.findOne = jest.fn().mockResolvedValue(null);
    const r3 = res();
    await getDoctorAppointments({ query: { registerNumber: 'R' } }, r3);
    expect(r3.status).toHaveBeenCalledWith(404);

    // success
    DoctorBooking.findOne = jest.fn().mockResolvedValue({ _id: 'doc1' });
    Appointment.find = jest.fn().mockResolvedValue([{ id: 2 }]);
    const r4 = res();
    await getDoctorAppointments({ query: { registerNumber: 'R' } }, r4);
    expect(r4.json).toHaveBeenCalledWith([{ id: 2 }]);
  });

  test('bookAppointment handles slot already booked', async () => {
    DoctorBooking.findById = jest.fn().mockResolvedValue({ _id: 'doc1', doctorName: 'Doc', doctorId: 'REG1' });
    Appointment.findOne = jest.fn().mockResolvedValue({ slotTime: '08:30' });
    const r = res();
    await bookAppointment({ body: { patientName: 'A', age: 30, doctorId: 'doc1', date: '2024-01-01', slotTime: '08:30' } }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });

  test('getAvailableSlots handles doctor not found', async () => {
    DoctorBooking.findById = jest.fn().mockResolvedValue(null);
    const r = res();
    await getAvailableSlots({ query: { doctorId: 'nope', date: '2024-01-01' } }, r);
    expect(r.status).toHaveBeenCalledWith(404);
  });

  test('getAllAppointments handles error', async () => {
    Appointment.find = jest.fn().mockRejectedValue(new Error('DB fail'));
    const r = res();
    await getAllAppointments({}, r);
    expect(r.status).toHaveBeenCalledWith(500);
  });
});
