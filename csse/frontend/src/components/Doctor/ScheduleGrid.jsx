
import React from 'react';

const ScheduleGrid = ({ filteredDoctors, onSlotClick }) => (
  <div className="overflow-x-auto mb-8">
    <h3 className="text-lg font-semibold mb-4 text-blue-700">Weekly Doctor Schedule</h3>
    <table className="border w-full min-w-[700px] rounded-xl overflow-hidden shadow">
      <thead>
        <tr className="bg-blue-100">
          <th className="border px-2 py-2">Hour</th>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
            <th key={day} className="border px-2 py-2">{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({length: 12}, (_, i) => i+8).map(hour => {
          const hourStr = hour.toString().padStart(2, '0') + ':00';
          return (
            <tr key={hourStr}>
              <td className="border px-2 py-2 font-semibold bg-gray-50">{hourStr}</td>
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
                const doc = filteredDoctors.find(d => {
                  if (d.bookingDay !== day) return false;
                  const start = parseInt(d.startTime.split(':')[0], 10);
                  const end = parseInt(d.endTime.split(':')[0], 10);
                  return hour >= start && hour < end;
                });
                let slotColor = "bg-red-500";
                let nurseName = "";
                if (doc && doc.nurse) {
                  slotColor = "bg-green-500";
                  nurseName = doc.nurse.name;
                }
                return (
                  <td
                    key={day+hourStr}
                    className={doc ? `border px-2 py-2 ${slotColor} text-white font-bold rounded-lg shadow cursor-pointer` : "border px-2 py-2 bg-white"}
                    onClick={() => doc && onSlotClick && onSlotClick(doc)}
                  >
                    {doc ? (
                      <div>
                        <span className="block text-sm">{doc.doctorName}</span>
                        <span className="block text-xs">Room: {doc.roomNo}</span>
                        {nurseName && <span className="block text-xs mt-1">Nurse: {nurseName}</span>}
                      </div>
                    ) : ''}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default ScheduleGrid;
