import React, { useState } from 'react';

const ChannelHistoryPopup = ({ patientName, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/channel/history?patientName=${encodeURIComponent(patientName)}`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [patientName]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4">Channel History for {patientName}</h2>
        {loading ? (
          <p className="text-gray-500">Loading history...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500">No channel history found.</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {history.map((item, idx) => (
              <div key={item._id} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-semibold">Date: {item.nextDate || item.createdAt?.slice(0,10)}</div>
                <div><span className="font-semibold">Details:</span> {item.details}</div>
                <div><span className="font-semibold">Medicine:</span> {item.medicine}</div>
                {item.reportUrl && (
                  <div><span className="font-semibold">Report:</span> <a href={item.reportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelHistoryPopup;
