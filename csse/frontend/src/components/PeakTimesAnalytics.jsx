
// To use this chart, run: npm install recharts
import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

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

  // Ref for chart container
  const chartRef = useRef(null);

  // PDF download handler
  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Patient Peak Times Analytics Report', 14, 18);
      // Table
      const tableColumn = ['Hour', 'Total Appointments'];
      const tableRows = hourRows.map(row => [row.hour + ':00', row.count]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 28 });

      // Bar chart as image using html2canvas only
      const chartNode = chartRef.current;
      if (chartNode) {
        try {
          // Wait for chart to render
          await new Promise(resolve => setTimeout(resolve, 500));
          // Temporarily set background to white for export
          const prevBg = chartNode.style.backgroundColor;
          chartNode.style.backgroundColor = '#fff';
          const canvas = await html2canvas(chartNode, { backgroundColor: '#fff', useCORS: true, scale: 2 });
          chartNode.style.backgroundColor = prevBg;
          const imgData = canvas.toDataURL('image/png');
          doc.addPage();
          doc.setFontSize(14);
          doc.text('Bar Chart: Patient Peak Times', 14, 18);
          doc.addImage(imgData, 'PNG', 10, 28, 180, 70);
        } catch (err) {
          alert('Chart export failed. Chart will not be included in PDF.');
        }
      } else {
        alert('Chart container not found.');
      }
      doc.save('peak_times_report.pdf');
    } catch (err) {
      alert('PDF generation failed. Please check jsPDF, autotable, and html2canvas installation.');
    }
  };

  if (loading) return <div>Loading peak times...</div>;
  if (error) return <div className="text-red-600">Error loading analytics.</div>;

  return (
    <div className="p-8 bg-white border-l-8 border-pink-400 shadow-xl rounded-2xl mt-8">
      <h2 className="mb-6 text-2xl font-bold text-pink-700">Patient Peak Times Analytics</h2>
      <button
        className="mb-4 bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition font-semibold"
        onClick={handleDownloadPDF}
      >
        Download PDF
      </button>
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
      <div style={{ width: '100%', height: 350 }} ref={chartRef}>
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
