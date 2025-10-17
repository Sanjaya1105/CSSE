jest.mock('../../models/Doctor');
const Doctor = require('../../models/Doctor');
const {
  setChannelingFee,
  getApprovedDoctors,
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctorByRegisterNumber
} = require('../../controllers/doctorController');
const DoctorBooking = require('../../models/DoctorBooking');

const res = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe('doctorController.setChannelingFee', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects invalid fee', async () => {
    const r = res();
    await setChannelingFee({ params: { id: '1' }, body: { channelingFee: -5 } }, r);
    expect(r.status).toHaveBeenCalledWith(400);
  });

  test('updates fee when doctor exists', async () => {
    Doctor.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: '1', channelingFee: 400 });
    const r = res();
    await setChannelingFee({ params: { id: '1' }, body: { channelingFee: 400 } }, r);
    expect(Doctor.findByIdAndUpdate).toHaveBeenCalled();
    expect(r.status).not.toHaveBeenCalledWith(404);
  });

  test('getApprovedDoctors returns list', async () => {
    Doctor.find = jest.fn().mockResolvedValue([{ name: 'D' }]);
    const r = res();
    await getApprovedDoctors({}, r);
    expect(r.json).toHaveBeenCalledWith([{ name: 'D' }]);
  });

  test('create/get/update/delete doctor booking flows', async () => {
    // create
    const saved = { save: jest.fn().mockResolvedValue(), toJSON: () => ({}) };
    jest.spyOn(DoctorBooking.prototype, 'save').mockResolvedValue();
    const r1 = res();
    await createDoctor({ body: { doctorId: 'R1', doctorName: 'Doc', roomNo: '1', specialization: 'Spec', bookingDay: 'Monday', startTime: '08:00', endTime: '09:00' } }, r1);
    expect(r1.status).toHaveBeenCalledWith(201);

    // get list
    DoctorBooking.find = jest.fn().mockResolvedValue([{ id: 1 }]);
    const r2 = res();
    await getDoctors({}, r2);
    expect(r2.json).toHaveBeenCalledWith([{ id: 1 }]);

    // update
    DoctorBooking.findByIdAndUpdate = jest.fn().mockResolvedValue({ id: 1, roomNo: '2' });
    const r3 = res();
    await updateDoctor({ params: { id: 'x' }, body: { roomNo: '2' } }, r3);
    expect(r3.json).toHaveBeenCalledWith({ id: 1, roomNo: '2' });

    // delete
    DoctorBooking.findByIdAndDelete = jest.fn().mockResolvedValue({});
    const r4 = res();
    await deleteDoctor({ params: { id: 'x' } }, r4);
    expect(r4.json).toHaveBeenCalledWith({ message: 'Doctor booking deleted' });
  });

  test('getDoctorById and by registerNumber paths', async () => {
    // not found by id
    Doctor.findById = jest.fn().mockResolvedValue(null);
    const r1 = res();
    await getDoctorById({ params: { id: 'x' } }, r1);
    expect(r1.status).toHaveBeenCalledWith(404);

    // found by id
    Doctor.findById = jest.fn().mockResolvedValue({ _id: '1' });
    const r2 = res();
    await getDoctorById({ params: { id: '1' } }, r2);
    expect(r2.json).toHaveBeenCalledWith({ _id: '1' });

    // not found by register number
    Doctor.findOne = jest.fn().mockResolvedValue(null);
    const r3 = res();
    await getDoctorByRegisterNumber({ params: { registerNumber: 'R1' } }, r3);
    expect(r3.status).toHaveBeenCalledWith(404);

    // found by register number
    Doctor.findOne = jest.fn().mockResolvedValue({ _id: '1', registerNumber: 'R1' });
    const r4 = res();
    await getDoctorByRegisterNumber({ params: { registerNumber: 'R1' } }, r4);
    expect(r4.json).toHaveBeenCalledWith({ _id: '1', registerNumber: 'R1' });
  });
});
