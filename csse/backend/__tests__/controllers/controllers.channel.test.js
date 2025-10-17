jest.mock('fs', () => ({ existsSync: jest.fn().mockReturnValue(false) }));
jest.mock('../../models/Channel');
const Channel = require('../../models/Channel');
const { saveChannelDetails, getChannelHistory } = require('../../controllers/channelController');

const res = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe('channelController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('saveChannelDetails saves with file optional', async () => {
    Channel.prototype.save = jest.fn().mockResolvedValue();
    const r = res();
    await saveChannelDetails({ body: { appointmentId: 'a1', patientName: 'P', age: 1, details: 'D', medicine: 'M' }, file: { filename: 'rep.pdf' } }, r);
    expect(r.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('getChannelHistory validates patientName and returns list', async () => {
    const r = res();
    await getChannelHistory({ query: {} }, r);
    expect(r.status).toHaveBeenCalledWith(400);

    Channel.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([{ id: 1 }]) });
    const r2 = res();
    await getChannelHistory({ query: { patientName: 'A' } }, r2);
    expect(r2.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
});
