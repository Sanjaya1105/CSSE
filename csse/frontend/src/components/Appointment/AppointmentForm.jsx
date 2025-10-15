import React, { useState } from 'react';

const AppointmentForm = ({ doctors, onBook }) => {
  const [form, setForm] = useState({
    patientName: '',
    age: '',
    history: '',
    doctorId: '',
    date: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.patientName || !form.age || !form.doctorId || !form.date) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    onBook(form);
  };

  // Helper: get allowed booking day for selected doctor
  const selectedDoc = doctors.find(d => d._id === form.doctorId);
  const allowedDay = selectedDoc ? selectedDoc.bookingDay : null;

  // Helper: disable dates not matching doctor's bookingDay
  const isDateAllowed = dateStr => {
    if (!allowedDay) return true;
    const d = new Date(dateStr);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[d.getDay()] === allowedDay;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow grid gap-4">
      <input name="patientName" value={form.patientName} onChange={handleChange} placeholder="Patient Name" required className="border px-3 py-2 rounded-lg" />
      <input name="age" value={form.age} onChange={handleChange} placeholder="Age" required type="number" className="border px-3 py-2 rounded-lg" />
      <textarea name="history" value={form.history} onChange={handleChange} placeholder="Medical History" className="border px-3 py-2 rounded-lg" />
      <select name="doctorId" value={form.doctorId} onChange={handleChange} required className="border px-3 py-2 rounded-lg">
        <option value="">Select Doctor</option>
        {doctors.map(doc => (
          <option key={doc._id} value={doc._id}>{doc.doctorName} (Room {doc.roomNo})</option>
        ))}
      </select>
      {allowedDay && (
        <div className="text-blue-600 font-semibold">Available Day: {allowedDay}</div>
      )}
      <input
        name="date"
        value={form.date}
        onChange={e => {
          if (isDateAllowed(e.target.value)) {
            handleChange(e);
            setError('');
          } else {
            setError(`Doctor only available on ${allowedDay}`);
          }
        }}
        type="date"
        required
        className="border px-3 py-2 rounded-lg"
        min={(() => {
          const today = new Date();
          return today.toISOString().slice(0,10);
        })()}
      />
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Book Appointment</button>
    </form>
  );
};

export default AppointmentForm;
