import ScheduleGrid from '../Doctor/ScheduleGrid';
import NurseSelector from './NurseSelector';
import NurseModal from './NurseModal';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffTable = ({ onShowSuccess }) => {
  const navigate = useNavigate();
  // Load previous nurse assignments for selected room and week
  const fetchPreviousAssignments = async (room, start, end) => {
    if (!room || !start || !end) return {};
    try {
      const res = await fetch(`/api/doctor-nurse-assignment/by-room-week?roomNo=${room}&weekStartDay=${start}&weekEndDay=${end}`);
      if (!res.ok) throw new Error('Failed to fetch previous assignments');
      const data = await res.json();
      // Map: slot doctorId => nurse object
      const assignments = {};
      data.forEach(a => {
        assignments[a.doctorId] = { name: a.nurseName };
      });
      return assignments;
    } catch {
      return {};
    }
  };
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomNo, setRoomNo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState(null);
  const [nurseModalOpen, setNurseModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [nurseAssignments, setNurseAssignments] = useState({}); // key: slot _id, value: nurse object
  const [availableNurses, setAvailableNurses] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStaffTable, setShowStaffTable] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState([]);
  const [conflictError, setConflictError] = useState(null);

  useEffect(() => {
    // Fetch staff data from backend
    fetch('/api/staff')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch staff data');
        return res.json();
      })
      .then((data) => {
        setStaff(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);


  const handleRoomSearch = async () => {
    if (!roomNo.trim()) {
      setTimetable([]);
      return;
    }
    setTableLoading(true);
    setTableError(null);
    setConflictError(null);
    try {
      const res = await fetch(`/api/room-schedule/${roomNo.trim()}`);
      if (!res.ok) throw new Error('Failed to fetch timetable');
      const data = await res.json();
      setTimetable(data);
      // Fetch previous nurse assignments for this room and week
      const prevAssignments = await fetchPreviousAssignments(roomNo.trim(), startDate, endDate);
      setNurseAssignments(prevAssignments);
      // Simulate conflict check (replace with backend call if available)
      const hasConflict = data.some(slot => slot.conflict); // slot.conflict should be set by backend
      if (hasConflict) {
        setConflictError('Conflict found in schedule. Please resolve conflicts before confirming.');
        setShowDraftModal(true);
      } else {
        setDraftSchedule(data);
        setShowDraftModal(true);
      }
      setTableLoading(false);
    } catch (err) {
      setTableError(err.message);
      setTableLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleSlotClick = async (slot) => {
    setSelectedSlot(slot);
    // If nurse is already assigned, show delete modal
    const nurse = nurseAssignments[slot._id] || nurseAssignments[slot.doctorId];
    if (nurse) {
      setShowDeleteModal(true);
      return;
    }
    // Otherwise, show nurse selector
    let nurses = [];
    try {
      const res = await fetch('/api/staff');
      if (!res.ok) throw new Error('Failed to fetch nurse list');
      const data = await res.json();
      nurses = data.filter(n => n.userType === 'staff' || n.userType === 'nurse');
    } catch {
      nurses = [];
    }
    // Fetch nurse assignments for this time slot (same day, same timeSlot, same week range)
    let assignedNurses = [];
    try {
      const timeSlot = slot.bookingDay && slot.startTime ? `${slot.bookingDay} ${slot.startTime}` : slot.timeSlot || slot.time || slot.slot || '';
      // Get all assignments for this week and timeSlot (across all rooms)
      const res = await fetch(`/api/doctor-nurse-assignment/by-room-week?weekStartDay=${startDate}&weekEndDay=${endDate}&timeSlot=${encodeURIComponent(timeSlot)}`);
      if (res.ok) {
        const assignments = await res.json();
        // Only hide nurses assigned to another room at this time, same day, same week range
        assignedNurses = assignments.filter(a =>
          a.roomNo !== slot.roomNo &&
          a.timeSlot === timeSlot &&
          a.weekStartDay === startDate &&
          a.weekEndDay === endDate
        ).map(a => a.nurseName);
      }
    } catch {}
    // Filter out assigned nurses
    const filteredNurses = nurses.filter(n => !assignedNurses.includes(n.name));
    setAvailableNurses(filteredNurses);
    setNurseModalOpen(true);
  };

  const handleNurseSelect = (nurse) => {
    setNurseAssignments(prev => ({
      ...prev,
      [selectedSlot._id]: nurse,
      ...(selectedSlot.doctorId ? { [selectedSlot.doctorId]: nurse } : {})
    }));
    setNurseModalOpen(false);
    setSelectedSlot(null);
  };

  // Delete nurse assignment logic
  const handleDeleteNurseAssignment = async () => {
    // Find assignment id from backend
    const slot = selectedSlot;
    const timeSlot = slot.bookingDay && slot.startTime ? `${slot.bookingDay} ${slot.startTime}` : slot.timeSlot || slot.time || slot.slot || '';
    try {
      const res = await fetch(`/api/doctor-nurse-assignment/by-room-week?weekStartDay=${startDate}&weekEndDay=${endDate}&timeSlot=${encodeURIComponent(timeSlot)}`);
      if (res.ok) {
        const assignments = await res.json();
        // Find assignment for this slot and nurse
        const nurse = nurseAssignments[slot._id] || nurseAssignments[slot.doctorId];
        const assignment = assignments.find(a => a.doctorId === (slot.doctorId || slot._id) && a.nurseName === nurse.name);
        if (assignment) {
          await fetch(`/api/doctor-nurse-assignment/${assignment._id}`, { method: 'DELETE' });
        }
      }
      // Remove nurse from state
      setNurseAssignments(prev => {
        const copy = { ...prev };
        delete copy[slot._id];
        if (slot.doctorId) delete copy[slot.doctorId];
        return copy;
      });
      setShowDeleteModal(false);
      setSelectedSlot(null);
    } catch {
      alert('Failed to delete nurse assignment');
    }
  };

  const handleNurseModalClose = () => {
    setNurseModalOpen(false);
    setSelectedSlot(null);
    setAvailableNurses([]);
    setShowDeleteModal(false);
  };

  const handleSaveAllAssignments = async () => {
    const assignmentsToSave = timetable
      .filter(slot => nurseAssignments[slot._id])
      .map(slot => {
        // Compose timeSlot string from slot info
        let timeSlot = '';
        if (slot.bookingDay && slot.startTime) {
          timeSlot = `${slot.bookingDay} ${slot.startTime}`;
        } else if (slot.timeSlot) {
          timeSlot = slot.timeSlot;
        } else if (slot.time) {
          timeSlot = slot.time;
        } else if (slot.slot) {
          timeSlot = slot.slot;
        } else {
          timeSlot = 'Unknown';
        }
        return {
          doctorId: slot.doctorId || slot._id,
          doctorName: slot.doctorName,
          nurseId: nurseAssignments[slot._id]?._id, // add nurseId from nurse object
          nurseName: nurseAssignments[slot._id].name,
          roomNo: slot.roomNo,
          weekStartDay: startDate,
          weekEndDay: endDate,
          timeSlot
        };
      });
    try {
      for (const assignment of assignmentsToSave) {
        await fetch('/api/doctor-nurse-assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignment)
        });
      }
      if (onShowSuccess) onShowSuccess('Schedule saved successfully!');
    } catch (err) {
      alert('Failed to save nurse assignments');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 flex flex-col items-center">
      {/* Go Back to Dashboard button removed as requested */}
      <h2 className="text-4xl font-extrabold mb-8 text-blue-700 drop-shadow-lg tracking-wide">Staff Schedule</h2>
      <button
        className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold"
        onClick={() => setShowStaffTable((prev) => !prev)}
      >
        {showStaffTable ? 'Hide Staff Table' : 'Show Staff Table'}
      </button>
      {showStaffTable && (
        <div className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white mb-10 animate-fade-in">
          <table className="w-full text-lg">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-4 font-semibold text-blue-700">Name</th>
                <th className="p-4 font-semibold text-blue-700">Email</th>
                <th className="p-4 font-semibold text-blue-700">NIC</th>
                <th className="p-4 font-semibold text-blue-700">Register Number</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id} className="hover:bg-blue-50 transition">
                  <td className="p-4 border-b border-blue-100">{s.name}</td>
                  <td className="p-4 border-b border-blue-100">{s.email}</td>
                  <td className="p-4 border-b border-blue-100">{s.nic}</td>
                  <td className="p-4 border-b border-blue-100">{s.registerNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Room Number Search and Timetable */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl p-6 flex flex-wrap gap-4 items-center justify-center animate-fade-in mb-6">
        <input
          type="text"
          value={roomNo}
          onChange={e => setRoomNo(e.target.value)}
          placeholder="Enter Room Number"
          className="border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <label className="font-medium text-blue-700">Start Week Day:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <label className="font-medium text-blue-700">End Week Day:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          type="button"
          className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-8 py-2 rounded-lg shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-500 transition-all font-semibold"
          onClick={handleRoomSearch}
        >
          Show Previous Build Table
        </button>
      </div>

      {tableLoading && <div>Loading timetable...</div>}
      {tableError && <div className="text-red-500">Error: {tableError}</div>}
      {/* Draft schedule modal for preview and conflict confirmation */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative animate-fade-in overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => { setShowDraftModal(false); setConflictError(null); }}
              title="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">Draft Staff Schedule for Room {roomNo}</h3>
            {conflictError ? (
              <div className="mb-4 text-red-600 font-semibold">{conflictError}</div>
            ) : (
              <div className="mb-4 text-green-700 font-semibold">No conflicts found. Please confirm schedule.</div>
            )}
            <ScheduleGrid
              filteredDoctors={draftSchedule.map(slot => {
                const nurse = nurseAssignments[slot._id] || nurseAssignments[slot.doctorId];
                return nurse ? { ...slot, nurse } : slot;
              })}
              onSlotClick={handleSlotClick}
            />
            {!conflictError && (
              <button
                className="mt-6 bg-green-600 text-white px-8 py-2 rounded-lg shadow-lg hover:bg-green-700 font-semibold transition-all"
                onClick={() => { setShowDraftModal(false); handleSaveAllAssignments(); }}
              >
                Confirm & Save Schedule
              </button>
            )}
          </div>
        </div>
      )}

      <NurseSelector nurses={availableNurses} open={nurseModalOpen} onClose={handleNurseModalClose} onSelect={handleNurseSelect} />
      {/* Delete nurse modal */}
      {showDeleteModal && selectedSlot && (
        <NurseModal
          nurses={[(nurseAssignments[selectedSlot._id] || nurseAssignments[selectedSlot.doctorId])].filter(Boolean)}
          open={showDeleteModal}
          onClose={handleNurseModalClose}
          onSelect={handleDeleteNurseAssignment}
          deleteMode={true}
        />
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease;
        }
      `}</style>
    </div>
  );
};

export default StaffTable;
