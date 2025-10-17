import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    userStats: {
      totalPatients: 0,
      totalDoctors: 0,
      totalStaff: 0,
      totalAdmins: 0,
      pendingDoctors: 0,
      approvedDoctors: 0,
      rejectedDoctors: 0
    },
    appointmentStats: {
      total: 0,
      pending: 0,
      approved: 0,
      channeled: 0
    },
    medicalRecords: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [peakTimesData, setPeakTimesData] = useState([]);
  const chartRef = useRef(null);
  const [currentPage, setCurrentPage] = useState('overview'); // overview, approvals, appointments, charts, reports
  
  // Appointment filters
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [specializationsList, setSpecializationsList] = useState([]);
  const [doctorSpecializationMap, setDoctorSpecializationMap] = useState({}); // Map doctor register number to specialization
  const [filters, setFilters] = useState({
    doctorName: '',
    specialization: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Filter appointments when filters change
  useEffect(() => {
    let filtered = [...allAppointments];

    console.log('Filtering appointments...', {
      totalAppointments: allAppointments.length,
      filters,
      specializationMap: doctorSpecializationMap
    });

    // Filter by doctor name
    if (filters.doctorName) {
      filtered = filtered.filter(apt => apt.doctorName === filters.doctorName);
      console.log(`After doctor filter (${filters.doctorName}):`, filtered.length);
    }

    // Filter by specialization using the doctor mapping
    if (filters.specialization) {
      filtered = filtered.filter(apt => {
        const doctorSpec = doctorSpecializationMap[apt.doctorRegisterNumber];
        console.log(`Checking appointment - Doctor: ${apt.doctorName}, RegNo: ${apt.doctorRegisterNumber}, Spec in map: ${doctorSpec}, Filter: ${filters.specialization}`);
        return doctorSpec === filters.specialization;
      });
      console.log(`After specialization filter (${filters.specialization}):`, filtered.length);
    }

    // Filter by start date
    if (filters.startDate) {
      filtered = filtered.filter(apt => apt.date >= filters.startDate);
      console.log(`After start date filter (${filters.startDate}):`, filtered.length);
    }

    // Filter by end date
    if (filters.endDate) {
      filtered = filtered.filter(apt => apt.date <= filters.endDate);
      console.log(`After end date filter (${filters.endDate}):`, filtered.length);
    }

    console.log('Final filtered appointments:', filtered.length);
    setFilteredAppointments(filtered);
  }, [filters, allAppointments, doctorSpecializationMap]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      doctorName: '',
      specialization: '',
      startDate: '',
      endDate: ''
    });
  };

  // Generate Appointments PDF
  const handleDownloadAppointmentsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Hospital Management System', 14, 20);
      doc.setFontSize(14);
      doc.text('Appointments Report', 14, 28);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
      
      // Filter information
      let yPos = 40;
      if (filters.doctorName || filters.specialization || filters.startDate || filters.endDate) {
        doc.setFontSize(11);
        doc.setTextColor(0, 100, 200);
        doc.text('Applied Filters:', 14, yPos);
        yPos += 5;
        
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        if (filters.doctorName) {
          doc.text(`• Doctor: ${filters.doctorName}`, 14, yPos);
          yPos += 4;
        }
        if (filters.specialization) {
          doc.text(`• Specialization: ${filters.specialization}`, 14, yPos);
          yPos += 4;
        }
        if (filters.startDate) {
          doc.text(`• Start Date: ${filters.startDate}`, 14, yPos);
          yPos += 4;
        }
        if (filters.endDate) {
          doc.text(`• End Date: ${filters.endDate}`, 14, yPos);
          yPos += 4;
        }
        yPos += 3;
      }
      
      // Summary Statistics
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 200);
      doc.text('Summary Statistics', 14, yPos);
      yPos += 3;
      
      const pendingCount = filteredAppointments.filter(a => a.status?.toLowerCase() === 'pending').length;
      const approvedCount = filteredAppointments.filter(a => a.status?.toLowerCase() === 'approved').length;
      const channeledCount = filteredAppointments.filter(a => a.status?.toLowerCase() === 'channeled').length;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Status', 'Count', 'Percentage']],
        body: [
          ['Pending', pendingCount, `${filteredAppointments.length > 0 ? ((pendingCount / filteredAppointments.length) * 100).toFixed(1) : 0}%`],
          ['Approved', approvedCount, `${filteredAppointments.length > 0 ? ((approvedCount / filteredAppointments.length) * 100).toFixed(1) : 0}%`],
          ['Channeled', channeledCount, `${filteredAppointments.length > 0 ? ((channeledCount / filteredAppointments.length) * 100).toFixed(1) : 0}%`],
          ['Total', filteredAppointments.length, '100%']
        ],
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 14 }
      });
      
      // Appointments Table
      yPos = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 200);
      doc.text(`All Appointments (${filteredAppointments.length})`, 14, yPos);
      
      const tableData = filteredAppointments.map((apt, index) => [
        index + 1,
        apt.patientName,
        apt.age,
        apt.doctorName,
        new Date(apt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        apt.slotTime,
        `#${apt.queueNumber}`,
        apt.status || 'Unknown',
        apt.paymentType || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: yPos + 3,
        head: [['#', 'Patient', 'Age', 'Doctor', 'Date', 'Time', 'Queue', 'Status', 'Payment']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [79, 70, 229],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 25 },
          2: { cellWidth: 10 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 15 },
          6: { cellWidth: 12 },
          7: { cellWidth: 18 },
          8: { cellWidth: 18 }
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function (data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.setFontSize(8);
          doc.setTextColor(128);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        }
      });
      
      // Save PDF
      const fileName = `Appointments_Report_${new Date().toISOString().split('T')[0]}${
        filters.doctorName ? `_${filters.doctorName.replace(/\s+/g, '_')}` : ''
      }${filters.specialization ? `_${filters.specialization}` : ''}.pdf`;
      
      doc.save(fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF report');
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all users data
      let usersData = { data: [] };
      try {
        const usersRes = await fetch('http://localhost:5000/api/superadmin/all-users?page=1&limit=1000');
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        usersData = await usersRes.json();
      } catch (err) {
        console.error('Error fetching users:', err);
      }
      
      // Fetch appointments
      let appointmentsData = [];
      try {
        const appointmentsRes = await fetch('http://localhost:5000/api/appointments');
        if (!appointmentsRes.ok) throw new Error('Failed to fetch appointments');
        appointmentsData = await appointmentsRes.json();
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
      
      // Fetch peak times
      let peakTimesData = [];
      try {
        const peakTimesRes = await fetch('http://localhost:5000/api/appointments/analytics/peak-times');
        if (!peakTimesRes.ok) throw new Error('Failed to fetch peak times');
        peakTimesData = await peakTimesRes.json();
      } catch (err) {
        console.error('Error fetching peak times:', err);
      }
      
      // Fetch medical records count (try to get all)
      let medicalRecordsData = { data: [] };
      try {
        const medicalRecordsRes = await fetch('http://localhost:5000/api/medical-records');
        if (!medicalRecordsRes.ok) throw new Error('Failed to fetch medical records');
        medicalRecordsData = await medicalRecordsRes.json();
      } catch (err) {
        console.error('Error fetching medical records:', err);
      }

      // Calculate user statistics
      const allUsers = usersData.data || [];
      const userStats = {
        totalPatients: allUsers.filter(u => u.userType === 'patient').length || 0,
        totalDoctors: allUsers.filter(u => u.userType === 'doctor' && u.status !== 'pending').length || 0,
        totalStaff: allUsers.filter(u => u.userType === 'staff').length || 0,
        totalAdmins: allUsers.filter(u => u.userType === 'admin').length || 0,
        pendingDoctors: allUsers.filter(u => u.userType === 'doctor' && u.status === 'pending').length || 0,
        approvedDoctors: allUsers.filter(u => u.userType === 'doctor' && u.status === 'approved').length || 0,
        rejectedDoctors: allUsers.filter(u => u.userType === 'doctor' && u.status === 'rejected').length || 0
      };

      // Calculate appointment statistics
      const appointmentStats = {
        total: Array.isArray(appointmentsData) ? appointmentsData.length : 0,
        pending: Array.isArray(appointmentsData) ? appointmentsData.filter(a => a.status === 'Pending').length : 0,
        approved: Array.isArray(appointmentsData) ? appointmentsData.filter(a => a.status === 'Approved').length : 0,
        channeled: Array.isArray(appointmentsData) ? appointmentsData.filter(a => a.status === 'Channeled').length : 0
      };

      // Process peak times data
      const hourCounts = Array.isArray(peakTimesData) ? peakTimesData.reduce((acc, { hour, count }) => {
        acc[hour] = (acc[hour] || 0) + count;
        return acc;
      }, {}) : {};
      const hourRows = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

      setPeakTimesData(hourRows);

      setAnalytics({
        userStats,
        appointmentStats,
        medicalRecords: medicalRecordsData.count || (Array.isArray(medicalRecordsData.data) ? medicalRecordsData.data.length : 0),
        recentActivity: Array.isArray(appointmentsData) ? appointmentsData.slice(0, 10) : [] // Latest 10 appointments
      });

      // Set appointments for filtering
      if (Array.isArray(appointmentsData)) {
        console.log('Setting appointments for filtering:', appointmentsData.length);
        setAllAppointments(appointmentsData);
        setFilteredAppointments(appointmentsData);
        
        // Extract unique doctor names
        const uniqueDoctors = [...new Set(appointmentsData.map(a => a.doctorName).filter(Boolean))];
        console.log('Unique doctors from appointments:', uniqueDoctors);
        setDoctorsList(uniqueDoctors);
        
        // Fetch doctor specializations and build mapping
        try {
          const doctorsRes = await fetch('http://localhost:5000/api/doctors');
          if (doctorsRes.ok) {
            const doctorsData = await doctorsRes.json();
            console.log('Doctor booking data fetched:', doctorsData.length, doctorsData);
            
            // Build map of doctor register number to specialization
            const specMap = {};
            doctorsData.forEach(doc => {
              if (doc.doctorId && doc.specialization) {
                specMap[doc.doctorId] = doc.specialization;
                console.log(`Mapping: ${doc.doctorId} (${doc.doctorName}) -> ${doc.specialization}`);
              }
            });
            console.log('Specialization map built:', specMap);
            setDoctorSpecializationMap(specMap);
            
            // Get unique specializations
            const uniqueSpecs = [...new Set(doctorsData.map(d => d.specialization).filter(Boolean))];
            console.log('Unique specializations:', uniqueSpecs);
            setSpecializationsList(uniqueSpecs);
          }
        } catch (err) {
          console.error('Error fetching doctors for specializations:', err);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data. Please check the console for details.');
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Hospital Management System', 14, 20);
      doc.setFontSize(14);
      doc.text('Super Admin Analytics Report', 14, 28);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
      
      // User Statistics
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 200);
      doc.text('User Statistics', 14, 45);
      autoTable(doc, {
        startY: 48,
        head: [['User Type', 'Count']],
        body: [
          ['Total Patients', analytics.userStats.totalPatients],
          ['Total Doctors (Approved)', analytics.userStats.totalDoctors],
          ['Pending Doctors', analytics.userStats.pendingDoctors],
          ['Approved Doctors', analytics.userStats.approvedDoctors],
          ['Rejected Doctors', analytics.userStats.rejectedDoctors],
          ['Total Staff/Nurses', analytics.userStats.totalStaff],
          ['Total Admins', analytics.userStats.totalAdmins]
        ],
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });

      // Appointment Statistics
      const yPos = doc.lastAutoTable.finalY + 10;
      doc.setTextColor(0, 100, 200);
      doc.text('Appointment Statistics', 14, yPos);
      autoTable(doc, {
        startY: yPos + 3,
        head: [['Status', 'Count']],
        body: [
          ['Total Appointments', analytics.appointmentStats.total],
          ['Pending', analytics.appointmentStats.pending],
          ['Approved', analytics.appointmentStats.approved],
          ['Channeled', analytics.appointmentStats.channeled]
        ],
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });

      // Medical Records
      const yPos2 = doc.lastAutoTable.finalY + 10;
      doc.text('Other Statistics', 14, yPos2);
      autoTable(doc, {
        startY: yPos2 + 3,
        head: [['Metric', 'Count']],
        body: [
          ['Total Medical Records', analytics.medicalRecords]
        ],
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });

      // Peak Times (if available)
      if (peakTimesData.length > 0) {
        const yPos3 = doc.lastAutoTable.finalY + 10;
        doc.text('Peak Appointment Times', 14, yPos3);
        autoTable(doc, {
          startY: yPos3 + 3,
          head: [['Hour', 'Total Appointments']],
          body: peakTimesData.map(d => [d.hour, d.count]),
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202] }
        });
      }

      // Save PDF
      doc.save(`SuperAdmin_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const totalUsers = analytics.userStats.totalPatients + 
                     analytics.userStats.totalDoctors + 
                     analytics.userStats.totalStaff + 
                     analytics.userStats.totalAdmins;

  // Data for user distribution pie chart
  const userDistributionData = [
    { name: 'Patients', value: analytics.userStats.totalPatients, color: '#3B82F6' },
    { name: 'Doctors', value: analytics.userStats.totalDoctors, color: '#10B981' },
    { name: 'Staff', value: analytics.userStats.totalStaff, color: '#F59E0B' },
    { name: 'Admins', value: analytics.userStats.totalAdmins, color: '#8B5CF6' }
  ];

  // Data for appointment status pie chart
  const appointmentStatusData = [
    { name: 'Pending', value: analytics.appointmentStats.pending, color: '#F59E0B' },
    { name: 'Approved', value: analytics.appointmentStats.approved, color: '#3B82F6' },
    { name: 'Channeled', value: analytics.appointmentStats.channeled, color: '#10B981' }
  ];

  // Data for doctor status
  const doctorStatusData = [
    { name: 'Approved', value: analytics.userStats.approvedDoctors, color: '#10B981' },
    { name: 'Pending', value: analytics.userStats.pendingDoctors, color: '#F59E0B' },
    { name: 'Rejected', value: analytics.userStats.rejectedDoctors, color: '#EF4444' }
  ];

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'System Overview', icon: '🏥' },
    { id: 'approvals', label: 'Pending Approvals', icon: '⏳' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'charts', label: 'Visual Analytics', icon: '📊' },
    { id: 'reports', label: 'Detailed Reports', icon: '📋' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-800">Analytics Dashboard</h2>
        <button
          onClick={handleDownloadReport}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg"
        >
          📊 Download Report (PDF)
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Page Content */}
      {currentPage === 'overview' && (
        <>
      {/* System Overview Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-indigo-500">
        <h3 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center">
          <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
          </svg>
          System Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Patients */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-xs font-semibold uppercase">Patients</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{analytics.userStats.totalPatients}</p>
              </div>
              <div className="bg-blue-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-blue-600 text-xs mt-2">Registered patients</p>
          </div>

          {/* Doctors */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-xs font-semibold uppercase">Approved Doctors</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{analytics.userStats.approvedDoctors}</p>
              </div>
              <div className="bg-green-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
              </div>
            </div>
            <p className="text-green-600 text-xs mt-2">Active in system</p>
          </div>

          {/* Staff/Nurses */}
          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-xs font-semibold uppercase">Staff/Nurses</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{analytics.userStats.totalStaff}</p>
              </div>
              <div className="bg-purple-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
            <p className="text-purple-600 text-xs mt-2">Support staff</p>
          </div>

          {/* Admins */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-xs font-semibold uppercase">Admins</p>
                <p className="text-3xl font-bold text-yellow-700 mt-1">{analytics.userStats.totalAdmins}</p>
              </div>
              <div className="bg-yellow-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-yellow-600 text-xs mt-2">System administrators</p>
          </div>
        </div>

        {/* Total Count */}
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Total System Users</p>
              <p className="text-5xl font-bold mt-2">{totalUsers}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Breakdown</p>
              <p className="text-sm mt-1">
                {analytics.userStats.totalPatients} Patients + {analytics.userStats.approvedDoctors} Doctors + {analytics.userStats.totalStaff} Staff + {analytics.userStats.totalAdmins} Admins
              </p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {currentPage === 'approvals' && (
      <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-orange-500">
        <h3 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
          <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Pending Approvals & Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Doctors */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-5xl font-bold text-orange-600 mb-2">{analytics.userStats.pendingDoctors}</p>
              <p className="text-orange-700 font-semibold text-lg">Pending Doctors</p>
              <p className="text-orange-600 text-sm mt-1">Awaiting approval</p>
            </div>
          </div>

          {/* Approved Doctors */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-5xl font-bold text-green-600 mb-2">{analytics.userStats.approvedDoctors}</p>
              <p className="text-green-700 font-semibold text-lg">Approved Doctors</p>
              <p className="text-green-600 text-sm mt-1">Active in system</p>
            </div>
          </div>

          {/* Rejected Doctors */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-5xl font-bold text-red-600 mb-2">{analytics.userStats.rejectedDoctors}</p>
              <p className="text-red-700 font-semibold text-lg">Rejected Doctors</p>
              <p className="text-red-600 text-sm mt-1">Not approved</p>
            </div>
          </div>
        </div>

        {/* Action Required Alert */}
        {analytics.userStats.pendingDoctors > 0 && (
          <div className="mt-6 bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-orange-800">Action Required</p>
                <p className="text-sm text-orange-700">
                  You have {analytics.userStats.pendingDoctors} doctor registration{analytics.userStats.pendingDoctors > 1 ? 's' : ''} pending approval
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {currentPage === 'appointments' && (
        <>
      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-8 border-blue-500">
        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filter Appointments
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Doctor Name Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Doctor Name
            </label>
            <select
              value={filters.doctorName}
              onChange={(e) => handleFilterChange('doctorName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Doctors</option>
              {doctorsList.map((doctor, idx) => (
                <option key={idx} value={doctor}>{doctor}</option>
              ))}
            </select>
          </div>

          {/* Specialization Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Specialization
            </label>
            <select
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Specializations</option>
              {specializationsList.map((spec, idx) => (
                <option key={idx} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
            >
              Clear Filters
            </button>
            <span className="text-sm text-gray-600">
              Showing {filteredAppointments.length} of {allAppointments.length} appointments
            </span>
          </div>
          
          {/* Active Filters Display */}
          {(filters.doctorName || filters.specialization || filters.startDate || filters.endDate) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.doctorName && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Doctor: {filters.doctorName}
                  <button
                    onClick={() => handleFilterChange('doctorName', '')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.specialization && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Specialization: {filters.specialization}
                  <button
                    onClick={() => handleFilterChange('specialization', '')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  From: {filters.startDate}
                  <button
                    onClick={() => handleFilterChange('startDate', '')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  To: {filters.endDate}
                  <button
                    onClick={() => handleFilterChange('endDate', '')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appointments Statistics Cards */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-green-500">
        <h3 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
          <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Appointments Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Appointments */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-xl transition">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-full mb-3">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-4xl font-bold mb-1">{filteredAppointments.length}</p>
              <p className="text-green-100 font-semibold">Total Appointments</p>
              {(filters.doctorName || filters.specialization || filters.startDate || filters.endDate) && (
                <p className="text-green-200 text-xs mt-1">
                  (Filtered from {allAppointments.length})
                </p>
              )}
            </div>
          </div>

          {/* Pending Appointments */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white hover:shadow-xl transition">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-full mb-3">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-4xl font-bold mb-1">
                {filteredAppointments.filter(a => a.status?.toLowerCase() === 'pending').length}
              </p>
              <p className="text-yellow-100 font-semibold">Pending</p>
              <p className="text-yellow-200 text-xs mt-1">
                {filteredAppointments.length > 0 
                  ? `${((filteredAppointments.filter(a => a.status?.toLowerCase() === 'pending').length / filteredAppointments.length) * 100).toFixed(0)}%`
                  : '0%'} of filtered
              </p>
            </div>
          </div>

          {/* Approved Appointments */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-xl transition">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-full mb-3">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-4xl font-bold mb-1">
                {filteredAppointments.filter(a => a.status?.toLowerCase() === 'approved').length}
              </p>
              <p className="text-blue-100 font-semibold">Approved</p>
              <p className="text-blue-200 text-xs mt-1">
                {filteredAppointments.length > 0 
                  ? `${((filteredAppointments.filter(a => a.status?.toLowerCase() === 'approved').length / filteredAppointments.length) * 100).toFixed(0)}%`
                  : '0%'} of filtered
              </p>
            </div>
          </div>

          {/* Channeled Appointments */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white hover:shadow-xl transition">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-full mb-3">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
              </div>
              <p className="text-4xl font-bold mb-1">
                {filteredAppointments.filter(a => a.status?.toLowerCase() === 'channeled').length}
              </p>
              <p className="text-emerald-100 font-semibold">Channeled</p>
              <p className="text-emerald-200 text-xs mt-1">
                {filteredAppointments.length > 0 
                  ? `${((filteredAppointments.filter(a => a.status?.toLowerCase() === 'channeled').length / filteredAppointments.length) * 100).toFixed(0)}%`
                  : '0%'} completed
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Status Breakdown Bar */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Appointment Status Breakdown</p>
            <p className="text-xs text-gray-600">Total: {filteredAppointments.length}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden flex">
            {filteredAppointments.length > 0 ? (
              <>
                <div 
                  className="bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(filteredAppointments.filter(a => a.status?.toLowerCase() === 'pending').length / filteredAppointments.length) * 100}%` }}
                >
                  {filteredAppointments.filter(a => a.status?.toLowerCase() === 'pending').length > 0 && (
                    <span>{((filteredAppointments.filter(a => a.status?.toLowerCase() === 'pending').length / filteredAppointments.length) * 100).toFixed(0)}%</span>
                  )}
                </div>
                <div 
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(filteredAppointments.filter(a => a.status?.toLowerCase() === 'approved').length / filteredAppointments.length) * 100}%` }}
                >
                  {filteredAppointments.filter(a => a.status?.toLowerCase() === 'approved').length > 0 && (
                    <span>{((filteredAppointments.filter(a => a.status?.toLowerCase() === 'approved').length / filteredAppointments.length) * 100).toFixed(0)}%</span>
                  )}
                </div>
                <div 
                  className="bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(filteredAppointments.filter(a => a.status?.toLowerCase() === 'channeled').length / filteredAppointments.length) * 100}%` }}
                >
                  {filteredAppointments.filter(a => a.status?.toLowerCase() === 'channeled').length > 0 && (
                    <span>{((filteredAppointments.filter(a => a.status?.toLowerCase() === 'channeled').length / filteredAppointments.length) * 100).toFixed(0)}%</span>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-center text-gray-500 text-xs">
                No appointments yet
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-yellow-600">● Pending</span>
            <span className="text-blue-600">● Approved</span>
            <span className="text-emerald-600">● Channeled</span>
          </div>
        </div>

        {/* Medical Records Count */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase">Medical Records</p>
                <p className="text-4xl font-bold text-purple-700 mt-2">{analytics.medicalRecords}</p>
                <p className="text-purple-600 text-sm mt-1">Total patient records</p>
              </div>
              <div className="bg-purple-500 rounded-full p-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* System Activity Indicator */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6">
            <p className="text-gray-700 text-sm font-semibold uppercase mb-3">System Activity</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Appointment Rate</span>
                <span className="text-sm font-semibold text-green-600">
                  {analytics.appointmentStats.total > 0 ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Doctor Onboarding</span>
                <span className="text-sm font-semibold text-orange-600">
                  {analytics.userStats.pendingDoctors > 0 ? `${analytics.userStats.pendingDoctors} Pending` : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Patient Growth</span>
                <span className="text-sm font-semibold text-blue-600">
                  {analytics.userStats.totalPatients} Total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Appointments Table */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-indigo-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-indigo-800 flex items-center">
            <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            All Appointments ({filteredAppointments.length})
          </h3>
          <button
            onClick={handleDownloadAppointmentsPDF}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold shadow-lg ${
              filteredAppointments.length === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            disabled={filteredAppointments.length === 0}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Download PDF
          </button>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xl text-gray-500 font-semibold">No appointments found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Queue #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment, index) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {appointment.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{appointment.doctorName}</div>
                      <div className="text-xs text-gray-500">{appointment.doctorRegisterNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {appointment.slotTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{appointment.queueNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(() => {
                        const status = appointment.status || 'Unknown';
                        const statusLower = status.toLowerCase();
                        
                        let bgColor, textColor, displayText;
                        
                        if (statusLower === 'pending') {
                          bgColor = 'bg-yellow-100';
                          textColor = 'text-yellow-800';
                          displayText = 'Pending';
                        } else if (statusLower === 'approved') {
                          bgColor = 'bg-blue-100';
                          textColor = 'text-blue-800';
                          displayText = 'Approved';
                        } else if (statusLower === 'channeled') {
                          bgColor = 'bg-green-100';
                          textColor = 'text-green-800';
                          displayText = 'Channeled';
                        } else {
                          bgColor = 'bg-gray-100';
                          textColor = 'text-gray-800';
                          displayText = status;
                        }
                        
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                            {displayText}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {appointment.paymentType ? (
                        <span className="capitalize">{appointment.paymentType}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Info */}
        {filteredAppointments.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Displaying all {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Pending: {filteredAppointments.filter(a => a.status?.toLowerCase() === 'pending').length}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Approved: {filteredAppointments.filter(a => a.status?.toLowerCase() === 'approved').length}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Channeled: {filteredAppointments.filter(a => a.status?.toLowerCase() === 'channeled').length}
              </span>
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {currentPage === 'charts' && (
        <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold mt-2">{totalUsers}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-blue-100 text-sm">
            Patients: {analytics.userStats.totalPatients} | Doctors: {analytics.userStats.totalDoctors}
          </p>
        </div>

        {/* Total Appointments Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Appointments</p>
              <p className="text-4xl font-bold mt-2">{analytics.appointmentStats.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-green-100 text-sm">
            Channeled: {analytics.appointmentStats.channeled}
          </p>
        </div>

        {/* Medical Records Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Medical Records</p>
              <p className="text-4xl font-bold mt-2">{analytics.medicalRecords}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-purple-100 text-sm">
            Total patient records
          </p>
        </div>

        {/* Pending Doctors Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Pending Doctors</p>
              <p className="text-4xl font-bold mt-2">{analytics.userStats.pendingDoctors}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-orange-100 text-sm">
            Awaiting approval
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {userDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Appointment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appointmentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {appointmentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            {appointmentStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Status Bar Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Doctor Registration Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doctorStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6">
                {doctorStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Times Bar Chart */}
        {peakTimesData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Peak Appointment Times</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakTimesData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
        </>
      )}

      {currentPage === 'reports' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed User Statistics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Patients</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.userStats.totalPatients}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Approved Doctors</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.userStats.approvedDoctors}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending Doctors</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.userStats.pendingDoctors}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rejected Doctors</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.userStats.rejectedDoctors}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Staff/Nurses</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.userStats.totalStaff}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Admins</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.userStats.totalAdmins}</td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total Users</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalUsers}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointment Statistics Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Appointment Statistics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.appointmentStats.pending}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {analytics.appointmentStats.total > 0 
                      ? ((analytics.appointmentStats.pending / analytics.appointmentStats.total) * 100).toFixed(1)
                      : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Approved</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.appointmentStats.approved}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {analytics.appointmentStats.total > 0 
                      ? ((analytics.appointmentStats.approved / analytics.appointmentStats.total) * 100).toFixed(1)
                      : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Channeled</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.appointmentStats.channeled}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {analytics.appointmentStats.total > 0 
                      ? ((analytics.appointmentStats.channeled / analytics.appointmentStats.total) * 100).toFixed(1)
                      : 0}%
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analytics.appointmentStats.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* System Health Indicator */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-semibold text-green-800 mb-2">System Health</h4>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-green-700">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default SuperAdminAnalytics;

