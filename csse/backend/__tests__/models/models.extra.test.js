const Channel = require('../../models/Channel');
const DoctorNurseAssignment = require('../../models/DoctorNurseAssignment');

describe('Extra model validations', () => {
  test('Channel requires core fields', () => {
    const ch = new Channel({});
    const err = ch.validateSync();
    expect(err.errors.appointmentId).toBeDefined();
    expect(err.errors.patientName).toBeDefined();
    expect(err.errors.age).toBeDefined();
    expect(err.errors.details).toBeDefined();
    expect(err.errors.medicine).toBeDefined();
  });

  test('DoctorNurseAssignment requires mapping data', () => {
    const d = new DoctorNurseAssignment({});
    const err = d.validateSync();
    expect(err.errors.doctorId).toBeDefined();
    expect(err.errors.nurseId).toBeDefined();
    expect(err.errors.roomNo).toBeDefined();
    expect(err.errors.timeSlot).toBeDefined();
  });
});
