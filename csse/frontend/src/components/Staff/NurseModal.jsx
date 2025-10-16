import React from 'react';

const NurseModal = ({ nurses, open, onClose, onSelect, deleteMode }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[320px] animate-modal-pop relative">
        <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-wide drop-shadow">
          {deleteMode ? 'Nurse Assignment' : 'Select Nurse'}
        </h2>
        {deleteMode ? (
          <div className="mb-6 text-center">
            <div className="text-lg font-semibold text-blue-700 mb-2">{nurses[0]?.name}</div>
            <div className="text-sm text-gray-500 mb-4">Assigned Nurse</div>
            <button
              className="w-full bg-gradient-to-r from-red-500 to-red-400 text-white px-5 py-3 rounded-xl shadow hover:from-red-600 hover:to-red-500 font-semibold transition-all duration-200 mb-2"
              onClick={onSelect}
            >
              Delete Nurse Assignment
            </button>
          </div>
        ) : (
          <ul className="mb-6">
            {nurses.map(nurse => (
              <li key={nurse._id} className="mb-3">
                <button
                  className="w-full text-left px-5 py-3 rounded-xl bg-blue-50 hover:bg-blue-200 font-semibold text-blue-700 shadow transition-all duration-200"
                  onClick={() => onSelect(nurse)}
                >
                  {nurse.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          className="w-full bg-gradient-to-r from-gray-500 to-gray-400 text-white px-5 py-3 rounded-xl shadow hover:from-gray-600 hover:to-gray-500 font-semibold transition-all duration-200"
          onClick={onClose}
        >
          Cancel
        </button>
        <style>{`
          @keyframes modal-pop {
            0% { opacity: 0; transform: scale(0.95) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-pop {
            animation: modal-pop 0.4s cubic-bezier(.4,0,.2,1);
          }
        `}</style>
      </div>
    </div>
  );
};

export default NurseModal;
