import React from 'react';

const AppointmentSlots = ({ slots, onSelect, bookedCount, maxSlots, nextWeekDate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h3 className="text-lg font-bold mb-4">Available Slots</h3>
      {slots.length === 0 ? (
        <div className="text-red-500">All slots for this day are booked.<br />Next available: {nextWeekDate}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {slots.map((slot, idx) => (
            <button
              key={slot}
              className="bg-blue-100 px-4 py-2 rounded-lg shadow hover:bg-blue-300"
              onClick={() => onSelect(slot, idx+1)}
            >
              {slot} {bookedCount + idx + 1 <= maxSlots ? `(No. ${bookedCount + idx + 1})` : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentSlots;
