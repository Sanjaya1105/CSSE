
// To use this chart, run: npm install recharts
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const PeakTimesAnalytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/appointments/analytics/peak-times')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Group by hour across all dates for a simple bar chart/table
  const hourCounts = data.reduce((acc, { hour, count }) => {
    acc[hour] = (acc[hour] || 0) + count;
    return acc;
  }, {});
  const hourRows = Object.entries(hourCounts).map(([hour, count]) => ({ hour, count }));

  if (loading) return <div>Loading peak times...</div>;
  if (error) return <div className="text-red-600">Error loading analytics.</div>;

  return (
    <div className="p-8 bg-white border-l-8 border-pink-400 shadow-xl rounded-2xl mt-8">
      <h2 className="mb-6 text-2xl font-bold text-pink-700">Patient Peak Times Analytics</h2>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-[300px] w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-pink-100">
              <th className="px-4 py-2 text-left">Hour</th>
              <th className="px-4 py-2 text-left">Total Appointments</th>
            </tr>
          </thead>
          <tbody>
            {hourRows.map(row => (
              <tr key={row.hour}>
                <td className="px-4 py-2 font-mono">{row.hour}:00</td>
                <td className="px-4 py-2">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={hourRows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
            <YAxis allowDecimals={false} label={{ value: 'Appointments', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#ec4899" name="Appointments" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PeakTimesAnalytics;
