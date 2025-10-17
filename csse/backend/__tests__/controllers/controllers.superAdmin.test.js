jest.mock('fs', () => ({ writeFileSync: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed') }));

jest.mock('../../models/Admin');
jest.mock('../../models/Doctor');
jest.mock('../../models/Patient');
jest.mock('../../models/Staff');

const Admin = require('../../models/Admin');
const Doctor = require('../../models/Doctor');
const Patient = require('../../models/Patient');
const Staff = require('../../models/Staff');

const {
  resetSuperAdminPassword,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getAllUsers,
  deleteUser
} = require('../../controllers/superAdminController');

const res = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe('superAdminController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('createAdmin validates fields and duplicate', async () => {
    const r1 = res();
    await createAdmin({ body: {} }, r1);
    expect(r1.status).toHaveBeenCalledWith(400);

    Admin.findOne = jest.fn().mockResolvedValue({ _id: 'a1' });
    const r2 = res();
    await createAdmin({ body: { email: 'a@x.com', password: 'p' } }, r2);
    expect(r2.status).toHaveBeenCalledWith(400);
  });

  test('createAdmin success', async () => {
    Admin.findOne = jest.fn().mockResolvedValue(null);
    const save = jest.fn().mockResolvedValue();
    Admin.mockImplementation(() => ({ save }));
    const r = res();
    await createAdmin({ body: { email: 'a@x.com', password: 'p' } }, r);
    expect(save).toHaveBeenCalled();
    expect(r.status).toHaveBeenCalledWith(200);
  });

  test('getAllAdmins returns list', async () => {
    Admin.find = jest.fn().mockResolvedValue([{ email: 'a@x.com' }]);
    const r = res();
    await getAllAdmins({}, r);
    expect(r.status).toHaveBeenCalledWith(200);
  });

  test('deleteAdmin validations and outcomes', async () => {
    const r1 = res();
    await deleteAdmin({ body: {} }, r1);
    expect(r1.status).toHaveBeenCalledWith(400);

    Admin.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });
    const r2 = res();
    await deleteAdmin({ body: { email: 'a@x.com' } }, r2);
    expect(r2.status).toHaveBeenCalledWith(404);

    Admin.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
    const r3 = res();
    await deleteAdmin({ body: { email: 'a@x.com' } }, r3);
    expect(r3.status).toHaveBeenCalledWith(200);
  });

  test('resetSuperAdminPassword success', async () => {
    const r = res();
    await resetSuperAdminPassword({ body: { password: 'new' } }, r);
    expect(r.status).toHaveBeenCalledWith(200);
  });

  test('getPendingDoctors and approvals', async () => {
    Doctor.find = jest.fn().mockResolvedValue([{ _id: 'd1' }]);
    const r1 = res();
    await getPendingDoctors({}, r1);
    expect(r1.status).toHaveBeenCalledWith(200);

    Doctor.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    const r2 = res();
    await approveDoctor({ body: { doctorId: 'x' } }, r2);
    expect(r2.status).toHaveBeenCalledWith(404);

    Doctor.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'x' });
    const r3 = res();
    await rejectDoctor({ body: { doctorId: 'x' } }, r3);
    expect(r3.status).toHaveBeenCalledWith(200);
  });

  test('getAllUsers aggregates and deleteUser paths', async () => {
    // Mock Mongoose Query chain: find().lean()
    const asLean = (data) => ({ lean: jest.fn().mockResolvedValue(data) });
    Patient.find = jest.fn().mockReturnValue(asLean([{ name: 'P' }]));
    Doctor.find = jest.fn().mockReturnValue(asLean([{ name: 'D' }]));
    Staff.find = jest.fn().mockReturnValue(asLean([{ name: 'S' }]));
    Admin.find = jest.fn().mockReturnValue(asLean([{ email: 'A' }]));

    const r1 = res();
    await getAllUsers({ query: { page: '1', limit: '10' } }, r1);
    expect(r1.status).toHaveBeenCalledWith(200);

    // deleteUser invalid type
    const r2 = res();
    await deleteUser({ body: { userId: '1', userType: 'ghost' } }, r2);
    expect(r2.status).toHaveBeenCalledWith(400);

    // deleteUser not found
    Patient.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    const r3 = res();
    await deleteUser({ body: { userId: '1', userType: 'patient' } }, r3);
    expect(r3.status).toHaveBeenCalledWith(404);

    // deleteUser success
    Patient.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: '1', name: 'P' });
    const r4 = res();
    await deleteUser({ body: { userId: '1', userType: 'patient' } }, r4);
    expect(r4.status).toHaveBeenCalledWith(200);
  });
});
