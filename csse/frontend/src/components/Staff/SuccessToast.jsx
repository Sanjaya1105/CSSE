import React from 'react';

const SuccessToast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-toast-in">
        <span className="font-semibold">{message}</span>
        <button onClick={onClose} className="ml-2 text-lg font-bold">&times;</button>
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-toast-in {
          animation: toast-in 0.4s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
};

export default SuccessToast;
