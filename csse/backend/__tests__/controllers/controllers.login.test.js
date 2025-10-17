jest.mock('../../models/Patient');
jest.mock('../../models/Doctor');
jest.mock('../../models/Staff');
jest.mock('../../models/Admin');
const Patient = require('../../models/Patient');
const Doctor = require('../../models/Doctor');
const Staff = require('../../models/Staff');
const Admin = require('../../models/Admin');
const bcrypt = require('bcryptjs');
const { loginUser } = require('../../controllers/loginController');

const res = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe('loginController.loginUser', () => {
  beforeEach(() => { jest.clearAllMocks(); jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); });

  test('requires email and password', async () => {
    const r = res();
    await loginUser({ body: {} }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });

  test('admin login path when Admin exists', async () => {
    Admin.findOne = jest.fn().mockResolvedValue({ email: 'admin@x.com', password: 'hash' });
    const r = res();
    await loginUser({ body: { email: 'admin@x.com', password: 'pw' } }, r);
    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('patient login success', async () => {
    Admin.findOne = jest.fn().mockResolvedValue(null);
    Patient.findOne = jest.fn().mockResolvedValue({ toObject: () => ({ email: 'p@x.com' }), password: 'hash' });
    const r = res();
    await loginUser({ body: { email: 'p@x.com', password: 'pw' } }, r);
    expect(r.status).toHaveBeenCalledWith(200);
  });

  test('doctor pending is blocked', async () => {
    Admin.findOne = jest.fn().mockResolvedValue(null);
    Patient.findOne = jest.fn().mockResolvedValue(null);
    Doctor.findOne = jest.fn().mockResolvedValue({ status: 'pending' });
    const r = res();
    await loginUser({ body: { email: 'd@x.com', password: 'pw' } }, r);
    expect(r.status).toHaveBeenCalledWith(403);
  });

  test('invalid credentials when user missing', async () => {
    Admin.findOne = jest.fn().mockResolvedValue(null);
    Patient.findOne = jest.fn().mockResolvedValue(null);
    Doctor.findOne = jest.fn().mockResolvedValue(null);
    Staff.findOne = jest.fn().mockResolvedValue(null);
    const r = res();
    await loginUser({ body: { email: 'x@x.com', password: 'pw' } }, r);
    expect(r.status).toHaveBeenCalledWith(401);
  });

  test('invalid password returns 401', async () => {
    Admin.findOne = jest.fn().mockResolvedValue(null);
    Patient.findOne = jest.fn().mockResolvedValue({ toObject: () => ({ email: 'p@x.com' }), password: 'hash' });
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
    const r = res();
    await loginUser({ body: { email: 'p@x.com', password: 'wrong' } }, r);
    expect(r.status).toHaveBeenCalledWith(401);
  });

  test('super admin login success via file', async () => {
    const fs = require('fs');
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ password: 'hashed' }));
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    const r = res();
    await loginUser({ body: { email: 'superadmin@gmail.com', password: 'pw' } }, r);
    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userType: 'superadmin' }) }));
  });

  test('super admin login fail with wrong password', async () => {
    const fs = require('fs');
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ password: 'hashed' }));
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
    const r = res();
    await loginUser({ body: { email: 'superadmin@gmail.com', password: 'wrong' } }, r);
    expect(r.status).toHaveBeenCalledWith(401);
  });

  test('doctor rejected is blocked', async () => {
    Admin.findOne = jest.fn().mockResolvedValue(null);
    Patient.findOne = jest.fn().mockResolvedValue(null);
    Doctor.findOne = jest.fn().mockResolvedValue({ status: 'rejected' });
    const r = res();
    await loginUser({ body: { email: 'd@x.com', password: 'pw' } }, r);
    expect(r.status).toHaveBeenCalledWith(403);
  });

  test('staff login success', async () => {
    Admin.findOne = jest.fn().mockResolvedValue(null);
    Patient.findOne = jest.fn().mockResolvedValue(null);
    Doctor.findOne = jest.fn().mockResolvedValue(null);
    Staff.findOne = jest.fn().mockResolvedValue({ toObject: () => ({ email: 's@x.com' }), password: 'hash' });
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    const r = res();
    await loginUser({ body: { email: 's@x.com', password: 'pw' } }, r);
    expect(r.status).toHaveBeenCalledWith(200);
  });
});
