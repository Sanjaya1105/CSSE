const mongoose = require('mongoose');
const Patient = require('../../models/Patient');
const Doctor = require('../../models/Doctor');
const Staff = require('../../models/Staff');
const Admin = require('../../models/Admin');
const DoctorBooking = require('../../models/DoctorBooking');
const Appointment = require('../../models/Appointment');
const MedicalRecord = require('../../models/MedicalRecord');

// We validate schema rules using mongoose validation without saving to DB

describe('Model schema validation', () => {
  test('Patient requires mandatory fields and trims', async () => {
    const p = new Patient({});
    const err = p.validateSync();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
    expect(err.errors.address).toBeDefined();
    expect(err.errors.idCardNumber).toBeDefined();
    expect(err.errors.age).toBeDefined();
  });

  test('Doctor has default status pending and negative fee invalid', async () => {
    const d = new Doctor({
      name: 'Dr X',
      email: 'x@example.com',
      password: 'secret12',
      nic: '990011223V',
      specialization: 'Cardiology',
      registerNumber: 'REG-100'
    });
    const v = d.validateSync();
    expect(v).toBeUndefined();
    expect(d.status).toBe('pending');
    // invalid negative channelingFee
    d.channelingFee = -1;
    const err = d.validateSync();
    expect(err.errors.channelingFee).toBeDefined();
  });

  test('Staff requires NIC and register number', () => {
    const st = new Staff({ name: 'S', email: 's@x.com', password: 'pw12345' });
    const err = st.validateSync();
    expect(err.errors.nic).toBeDefined();
    expect(err.errors.registerNumber).toBeDefined();
  });

  test('Admin requires email and password', () => {
    const ad = new Admin({});
    const err = ad.validateSync();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  test('DoctorBooking validates time and day enum', () => {
    const db = new DoctorBooking({
      doctorId: 'REG-1',
      doctorName: 'Dr One',
      roomNo: '101',
      specialization: 'Neuro',
      bookingDay: 'Monday',
      startTime: '08:00',
      endTime: '10:00'
    });
    expect(db.validateSync()).toBeUndefined();

    db.bookingDay = 'Funday';
    const err = db.validateSync();
    expect(err.errors.bookingDay).toBeDefined();
  });

  test('Appointment schema requires required fields', () => {
    const a = new Appointment({});
    const err = a.validateSync();
    expect(err.errors.patientName).toBeDefined();
    expect(err.errors.age).toBeDefined();
    expect(err.errors.doctorId).toBeDefined();
    expect(err.errors.doctorName).toBeDefined();
    expect(err.errors.doctorRegisterNumber).toBeDefined();
    expect(err.errors.date).toBeDefined();
    expect(err.errors.slotTime).toBeDefined();
    expect(err.errors.queueNumber).toBeDefined();
  });

  test('MedicalRecord requires core fields and defaults', () => {
    const mr = new MedicalRecord({
      patientId: 'p1',
      patientName: 'John',
      age: 40,
      diagnosis: 'Condition',
      medicines: 'Med A'
    });
    expect(mr.reportUrl).toBe('');
    expect(mr.recommendation).toBe('');
    expect(mr.validateSync()).toBeUndefined();
  });
});
