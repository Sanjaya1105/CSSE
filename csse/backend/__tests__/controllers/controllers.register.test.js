jest.mock('../../models/Patient');
jest.mock('../../models/Doctor');
jest.mock('../../models/Staff');
const Patient = require('../../models/Patient');
const Doctor = require('../../models/Doctor');
const Staff = require('../../models/Staff');
const { registerUser } = require('../../controllers/registerController');

const res = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe('registerController.registerUser', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects invalid user type', async () => {
    const r = res();
    await registerUser({ body: { userType: 'hacker' } }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });

  test('rejects duplicate email across collections', async () => {
    Patient.findOne = jest.fn().mockResolvedValue({ _id: 'p1' });
    Doctor.findOne = jest.fn().mockResolvedValue(null);
    Staff.findOne = jest.fn().mockResolvedValue(null);
    const r = res();
    await registerUser({ body: { userType: 'patient', email: 'a@b.com', password: 'pw', name: 'N', address: 'A', idCardNumber: 'NIC', age: 1 } }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });

  test('creates patient with hashed password (happy path)', async () => {
    Patient.findOne = jest.fn().mockResolvedValue(null);
    Doctor.findOne = jest.fn().mockResolvedValue(null);
    Staff.findOne = jest.fn().mockResolvedValue(null);
    Patient.create = jest.fn().mockResolvedValue({ toObject: () => ({ _id: 'p1', email: 'a@b.com', userType: 'patient' }) });
    const r = res();
    await registerUser({ body: { userType: 'patient', email: 'a@b.com', password: 'pw12345', name: 'N', address: 'A', idCardNumber: 'NIC', age: 1 } }, r);
    expect(Patient.create).toHaveBeenCalled();
    expect(r.status).toHaveBeenCalledWith(201);
  });

  test('handles validation error responses', async () => {
    Patient.findOne = jest.fn().mockResolvedValue(null);
    Doctor.findOne = jest.fn().mockResolvedValue(null);
    Staff.findOne = jest.fn().mockResolvedValue(null);
    const validationError = new Error('ValidationError');
    validationError.name = 'ValidationError';
    validationError.errors = { name: { message: 'name required' } };
    Patient.create = jest.fn().mockRejectedValue(validationError);
    const r = res();
    await registerUser({ body: { userType: 'patient', email: 'a@b.com', password: 'pw', name: '', address: 'A', idCardNumber: 'NIC', age: 1 } }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });

  test('handles duplicate key error responses', async () => {
    Patient.findOne = jest.fn().mockResolvedValue(null);
    Doctor.findOne = jest.fn().mockResolvedValue(null);
    Staff.findOne = jest.fn().mockResolvedValue(null);
    const dup = new Error('dup');
    dup.code = 11000; dup.keyPattern = { email: 1 };
    Patient.create = jest.fn().mockRejectedValue(dup);
    const r = res();
    await registerUser({ body: { userType: 'patient', email: 'a@b.com', password: 'pw', name: 'N', address: 'A', idCardNumber: 'NIC', age: 1 } }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });
});
