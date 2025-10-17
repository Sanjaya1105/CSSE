jest.mock('../../models/Patient');
const Patient = require('../../models/Patient');
const {
  getPatientById,
  getPendingRequests,
  clearPendingRequest,
  getPatientByIdForAdmin,
  getAdminPendingRequests,
  clearAdminPendingRequest,
  searchPatients
} = require('../../controllers/patientController');

const res = () => {
  const r = {};
  r.status = jest.fn().mockReturnValue(r);
  r.json = jest.fn().mockReturnValue(r);
  return r;
};

describe('patientController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getPatientById returns success true when found or false otherwise', async () => {
    const req = { params: { id: '123' } };
    const r = res();
    // First call findById returns null, then findOne returns patient
    Patient.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    Patient.findOne = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'p1', name: 'John' }) });
    await getPatientById(req, r);
    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('getPatientById returns false when not found', async () => {
    const r = res();
    Patient.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    Patient.findOne = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await getPatientById({ params: { id: 'nope' } }, r);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('searchPatients validates query and returns list', async () => {
    const r = res();
    await searchPatients({ query: {} }, r);
    expect(r.status).toHaveBeenCalledWith(400);

    Patient.find = jest.fn().mockReturnValue({ select: () => ({ limit: jest.fn().mockResolvedValue([{ name: 'A' }]) }) });
    const r2 = res();
    await searchPatients({ query: { query: 'a' } }, r2);
    expect(r2.status).toHaveBeenCalledWith(200);
    expect(r2.json).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }));
  });

  test('pending requests endpoints respond 200', async () => {
    const r = res();
    await getPendingRequests({}, r);
    expect(r.status).toHaveBeenCalledWith(200);

    const r2 = res();
    await clearPendingRequest({ params: { requestId: 'x' } }, r2);
    expect(r2.status).toHaveBeenCalledWith(200);

    const r3 = res();
    await getAdminPendingRequests({}, r3);
    expect(r3.status).toHaveBeenCalledWith(200);

    const r4 = res();
    await clearAdminPendingRequest({ params: { requestId: 'y' } }, r4);
    expect(r4.status).toHaveBeenCalledWith(200);
  });

  test('getPatientByIdForAdmin returns ack', async () => {
    const r = res();
    Patient.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: '1', name: 'P' }) });
    await getPatientByIdForAdmin({ params: { id: '1' } }, r);
    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('searchPatients handles error', async () => {
    Patient.find = jest.fn().mockReturnValue({ select: () => ({ limit: jest.fn().mockRejectedValue(new Error('DB error')) }) });
    const r = res();
    await searchPatients({ query: { query: 'test' } }, r);
    expect(r.status).toHaveBeenCalledWith(500);
  });
});
