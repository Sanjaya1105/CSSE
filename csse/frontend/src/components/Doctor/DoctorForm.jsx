import React from 'react';

const DoctorForm = ({ form, onChange, onSubmit, onClose, editId, approvedDoctors, onDoctorSelect }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
        onClick={onClose}
        title="Close"
      >
        &times;
      </button>
      <h3 className="text-xl font-bold mb-4 text-blue-700">{editId ? 'Edit Doctor Booking' : 'Add Doctor Booking'}</h3>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
        {/* Doctor Selection Dropdown */}
        {!editId && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor</label>
            <select 
              onChange={onDoctorSelect}
              className="w-full border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            >
              <option value="">-- Select an Approved Doctor --</option>
              {approvedDoctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialization} (ID: {doctor.registerNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Auto-populated fields (read-only) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor ID</label>
          <input 
            name="doctorId" 
            value={form.doctorId} 
            onChange={onChange} 
            placeholder="Doctor ID" 
            required 
            readOnly
            className="w-full border px-3 py-2 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Name</label>
          <input 
            name="doctorName" 
            value={form.doctorName} 
            onChange={onChange} 
            placeholder="Doctor Name" 
            required 
            readOnly
            className="w-full border px-3 py-2 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
          <input 
            name="specialization" 
            value={form.specialization || ''} 
            onChange={onChange} 
            placeholder="Specialization" 
            required 
            readOnly
            className="w-full border px-3 py-2 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
          <input 
            name="roomNo" 
            value={form.roomNo} 
            onChange={onChange} 
            placeholder="Room No" 
            required 
            className="w-full border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Day</label>
          <select 
            name="bookingDay" 
            value={form.bookingDay} 
            onChange={onChange} 
            className="w-full border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
          <input 
            name="startTime" 
            type="time"
            value={form.startTime} 
            onChange={onChange} 
            placeholder="Start Time (e.g. 09:00)" 
            required 
            className="w-full border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
          <input 
            name="endTime" 
            type="time"
            value={form.endTime} 
            onChange={onChange} 
            placeholder="End Time (e.g. 17:00)" 
            required 
            className="w-full border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200" 
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          {editId ? 'Update' : 'Add'} Doctor Booking
        </button>
      </form>
    </div>
  </div>
);

export default DoctorForm;
