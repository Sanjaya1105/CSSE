import React, { useState } from 'react';
import ChannelHistoryPopup from './ChannelHistoryPopup';

const ChannelPopup = ({ appointment, onClose, onSave }) => {
  const [details, setDetails] = useState('');
  const [medicine, setMedicine] = useState('');
  const [report, setReport] = useState(null);
  const [nextDate, setNextDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleReportChange = (e) => {
    setReport(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare form data for upload
    const formData = new FormData();
    formData.append('appointmentId', appointment._id);
    formData.append('patientName', appointment.patientName);
    formData.append('age', appointment.age);
    formData.append('details', details);
    formData.append('medicine', medicine);
    formData.append('nextDate', nextDate);
    if (report) formData.append('report', report);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4">Channel Patient</h2>
        <button
          type="button"
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowHistory(true)}
        >
          History
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Patient Name</label>
            <input type="text" value={appointment.patientName} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block font-semibold">Age</label>
            <input type="text" value={appointment.age} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block font-semibold">Details</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold">Medicine</label>
            <input type="text" value={medicine} onChange={e => setMedicine(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold">Upload Report</label>
            <input type="file" accept=".pdf,.jpg,.png" onChange={handleReportChange} className="w-full" />
          </div>
          <div>
            <label className="block font-semibold">Next Date</label>
            <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">Save</button>
        </form>
        {showHistory && (
          <ChannelHistoryPopup patientName={appointment.patientName} onClose={() => setShowHistory(false)} />
        )}
      </div>
    </div>
  );
};

export default ChannelPopup;
