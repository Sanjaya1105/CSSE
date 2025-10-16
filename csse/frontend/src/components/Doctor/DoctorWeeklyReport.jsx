import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DoctorWeeklyReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [filteredReport, setFilteredReport] = useState([]);

  useEffect(() => {
    // Fetch all appointments and doctors
    Promise.all([
      fetch('http://localhost:5000/api/doctors').then(res => res.json()),
      fetch('http://localhost:5000/api/appointments').then(res => res.json())
    ]).then(([doctors, appointments]) => {
      // Group appointments by doctorRegisterNumber and week
      const weekMap = {};
      appointments.forEach(appt => {
        const doctorRegNum = appt.doctorRegisterNumber;
        const week = getWeekNumber(new Date(appt.date));
        if (!weekMap[doctorRegNum]) weekMap[doctorRegNum] = {};
        if (!weekMap[doctorRegNum][week]) weekMap[doctorRegNum][week] = 0;
        weekMap[doctorRegNum][week]++;
      });
      // Build report array
      const reportArr = doctors.map(doc => {
        const doctorWeeks = weekMap[doc.doctorId] || {};
        const totalWeekly = Object.entries(doctorWeeks).map(([week, count]) => ({ week, count }));
        return {
          doctorId: doc.doctorId,
          doctorName: doc.doctorName,
          roomNo: doc.roomNo,
          weeklyCounts: totalWeekly
        };
      });
      setReport(reportArr);
      setFilteredReport(reportArr); // default: all
      setLoading(false);
    });
  }, []);

  // Filter report by doctorId
  const handleFilterDoctor = () => {
    if (!doctorIdInput.trim()) {
      setFilteredReport(report);
      return;
    }
    setFilteredReport(report.filter(r => r.doctorId === doctorIdInput.trim()));
  };

  function getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDay) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  }

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Doctor Weekly Appointment Report', 14, 18);
      const tableColumn = ['Doctor Name', 'Room No', 'Week', 'Appointment Count'];
      const tableRows = [];
      filteredReport.forEach(docItem => {
        docItem.weeklyCounts.forEach(wc => {
          tableRows.push([
            docItem.doctorName,
            docItem.roomNo,
            wc.week,
            wc.count
          ]);
        });
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 28 });
      doc.save('doctor_weekly_appointment_report.pdf');
    } catch (err) {
      alert('PDF generation failed. Please check jsPDF and autotable installation.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Doctor Weekly Appointment Report</h2>
      {loading ? (
        <div>Loading report...</div>
      ) : (
        <>
          <div className="mb-4 flex gap-2 items-center">
            <input
              type="text"
              value={doctorIdInput}
              onChange={e => setDoctorIdInput(e.target.value)}
              placeholder="Enter Doctor ID to filter"
              className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold"
              onClick={handleFilterDoctor}
            >
              Filter
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition font-semibold"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </button>
          </div>
          <table className="w-full border rounded-xl overflow-hidden shadow">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-2">Doctor Name</th>
                <th className="border px-2 py-2">Room No</th>
                <th className="border px-2 py-2">Week</th>
                <th className="border px-2 py-2">Appointment Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.map(doc =>
                doc.weeklyCounts.map(wc => (
                  <tr key={doc.doctorName + wc.week}>
                    <td className="border px-2 py-2">{doc.doctorName}</td>
                    <td className="border px-2 py-2">{doc.roomNo}</td>
                    <td className="border px-2 py-2">{wc.week}</td>
                    <td className="border px-2 py-2">{wc.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default DoctorWeeklyReport;
