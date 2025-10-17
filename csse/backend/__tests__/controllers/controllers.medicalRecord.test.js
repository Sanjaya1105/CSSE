jest.mock('fs', () => ({ existsSync: jest.fn().mockReturnValue(false), unlinkSync: jest.fn() }));
jest.mock('../../models/MedicalRecord');
const MedicalRecord = require('../../models/MedicalRecord');
const { saveMedicalRecord, getPatientMedicalRecords, deleteMedicalRecord } = require('../../controllers/medicalRecordController');

const res = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe('medicalRecordController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('saveMedicalRecord validates required fields', async () => {
    const r = res();
    await saveMedicalRecord({ body: {} }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });

  test('saveMedicalRecord creates record when valid', async () => {
    MedicalRecord.prototype.save = jest.fn().mockResolvedValue();
    const r = res();
    await saveMedicalRecord({ body: { patientId: 'p1', patientName: 'A', age: 20, diagnosis: 'D', medicines: 'M' } }, r);
    expect(r.status).toHaveBeenCalledWith(201);
  });

  test('getPatientMedicalRecords returns list', async () => {
    MedicalRecord.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([{ id: 1 }]) });
    const r = res();
    await getPatientMedicalRecords({ params: { patientId: 'p1' } }, r);
    expect(r.status).toHaveBeenCalledWith(200);
  });

  test('deleteMedicalRecord handles not found', async () => {
    MedicalRecord.findById = jest.fn().mockResolvedValue(null);
    const r = res();
    await deleteMedicalRecord({ params: { id: 'x' } }, r);
    expect(r.status).toHaveBeenCalledWith(404);
  });

  test('deleteMedicalRecord success with file present', async () => {
    const fs = require('fs');
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockReturnValue();
    MedicalRecord.findById = jest.fn().mockResolvedValue({ _id: 'x', reportUrl: '/uploads/medical-reports/test.pdf' });
    MedicalRecord.findByIdAndDelete = jest.fn().mockResolvedValue({});
    const r = res();
    await deleteMedicalRecord({ params: { id: 'x' } }, r);
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(r.status).toHaveBeenCalledWith(200);
  });

  test('getAllMedicalRecords returns sorted list', async () => {
    const { getAllMedicalRecords } = require('../../controllers/medicalRecordController');
    MedicalRecord.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) });
    const r = res();
    await getAllMedicalRecords({}, r);
    expect(r.status).toHaveBeenCalledWith(200);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ count: 2 }));
  });

    test('getAllMedicalRecords handles error', async () => {
      const { getAllMedicalRecords } = require('../../controllers/medicalRecordController');
      MedicalRecord.find = jest.fn(() => { throw new Error('DB error'); });
      const r = res();
      await getAllMedicalRecords({}, r);
      expect(r.status).toHaveBeenCalledWith(500);
      expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    test('deleteMedicalRecord handles error', async () => {
      MedicalRecord.findById = jest.fn().mockImplementation(() => { throw new Error('DB error'); });
      const r = res();
      await deleteMedicalRecord({ params: { id: 'x' } }, r);
      expect(r.status).toHaveBeenCalledWith(500);
      expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
});
