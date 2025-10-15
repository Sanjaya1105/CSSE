import React from 'react';

const DoctorForm = ({ form, onChange, onSubmit, onClose, editId }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
        onClick={onClose}
        title="Close"
      >
        &times;
      </button>
      <h3 className="text-xl font-bold mb-4 text-blue-700">{editId ? 'Edit Doctor' : 'Add Doctor'}</h3>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
        <input name="doctorId" value={form.doctorId} onChange={onChange} placeholder="Doctor ID" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input name="doctorName" value={form.doctorName} onChange={onChange} placeholder="Doctor Name" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input name="roomNo" value={form.roomNo} onChange={onChange} placeholder="Room No" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <select name="bookingDay" value={form.bookingDay} onChange={onChange} className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <input name="startTime" value={form.startTime} onChange={onChange} placeholder="Start Time (e.g. 09:00)" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input name="endTime" value={form.endTime} onChange={onChange} placeholder="End Time (e.g. 17:00)" required className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">{editId ? 'Update' : 'Add'} Doctor</button>
      </form>
    </div>
  </div>
);

export default DoctorForm;
