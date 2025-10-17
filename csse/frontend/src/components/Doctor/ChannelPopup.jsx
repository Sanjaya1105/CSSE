import React, { useState, useEffect } from 'react';
import ChannelHistoryPopup from './ChannelHistoryPopup';

const ChannelPopup = ({ appointment, onClose, onSave }) => {
  const [details, setDetails] = useState('');
  const [medicine, setMedicine] = useState('');
  const [report, setReport] = useState(null);
  const [nextDate, setNextDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [editRecordId, setEditRecordId] = useState(null);

  useEffect(() => {
    // Look up patient by name and age, then fetch medical records by _id
    const fetchRecords = async () => {
      setLoadingRecords(true);
      try {
        let patientId = appointment.patientId || null; // do NOT use appointment._id
        if (!patientId) {
          // Look up patient by name and age
          const resPatient = await fetch(`/api/patient/find?name=${encodeURIComponent(appointment.patientName)}&age=${appointment.age}` , { headers: { 'Cache-Control': 'no-cache' } });
          if (resPatient.ok) {
            const patientData = await resPatient.json();
            if (patientData && patientData._id) {
              patientId = patientData._id;
            }
          }
        }
        if (!patientId) {
          console.warn('No patientId resolved for previous records fetch');
          setMedicalRecords([]);
          return;
        }
        const url = `/api/medical-records/patient/${patientId}?_=${Date.now()}`; // cache-bust
        const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
        const data = await res.json();
        const records = data?.data || data?.records || (Array.isArray(data) ? data : []);
        console.log('Fetched medical records:', { patientId, count: records.length, sample: records[0] });
        setMedicalRecords(records);
      } catch (err) {
        console.error('Error fetching medical records:', err);
        setMedicalRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchRecords();
  }, [appointment.patientId, appointment.patientName, appointment.age]);

  const handleReportChange = (e) => {
    setReport(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
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
    if (editRecordId) {
      // Update medical record
      await fetch(`/api/medical-records/${editRecordId}`, {
        method: 'PUT',
        body: formData
      });
      setEditRecordId(null);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative max-h-[85vh] overflow-y-auto">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold">Channel Patient</h2>
          <button
            aria-label="Close"
            className="text-gray-500 hover:text-red-500 text-2xl leading-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Previous Medical Records</h3>
          {loadingRecords ? (
            <p className="text-gray-500">Loading records...</p>
          ) : medicalRecords.length === 0 ? (
            <p className="text-gray-500">No previous records found.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {medicalRecords.map(record => (
                <div key={record._id} className="border rounded p-2 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-semibold">Date:</span> {record.createdAt?.slice(0,10)}<br/>
                    <span className="font-semibold">Diagnosis:</span> {record.diagnosis}<br/>
                    <span className="font-semibold">Medicine:</span> {record.medicines}
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => {
                      setEditRecordId(record._id);
                      setDetails(record.diagnosis);
                      setMedicine(record.medicines);
                      setNextDate(record.nextDate || '');
                    }}>Update</button>
                    {record.reportUrl && (
                      <a
                        href={`http://localhost:5000${record.reportUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                      >
                        View Report
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
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
          <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">{editRecordId ? 'Update Record' : 'Save'}</button>
          </form>
          {showHistory && (
            <ChannelHistoryPopup patientName={appointment.patientName} onClose={() => setShowHistory(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelPopup;
