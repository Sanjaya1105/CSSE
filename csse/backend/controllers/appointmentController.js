// Analytics: Get peak appointment times by hour
exports.getPeakTimes = async (req, res) => {
  try {
    // Aggregate appointments by date and hour
    const result = await Appointment.aggregate([
      {
        $project: {
          date: 1,
          // Extract hour from slotTime (format: "HH:mm")
          hour: { $substr: ["$slotTime", 0, 2] }
        }
      },
      {
        $group: {
          _id: { date: "$date", hour: "$hour" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1, "_id.hour": 1 }
      }
    ]);
    // Format for frontend: [{ date, hour, count }]
    const formatted = result.map(r => ({
      date: r._id.date,
      hour: r._id.hour,
      count: r.count
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
// Get appointments for a doctor by register number (doctorId field)
exports.getDoctorAppointments = async (req, res) => {
  const { registerNumber } = req.query;
  try {
    if (!registerNumber) return res.status(400).json({ error: 'registerNumber required' });
    // Find doctor by register number
    const doctor = await DoctorBooking.findOne({ doctorId: registerNumber });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    // Find appointments for this doctor, excluding already channeled
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      status: { $ne: 'Channeled' }
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};




// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
// Get appointments for a doctor by register number (doctorId field)
exports.getDoctorAppointments = async (req, res) => {
  const { registerNumber } = req.query;
  try {
    if (!registerNumber) return res.status(400).json({ error: 'registerNumber required' });
    // Find doctor by register number
    const doctor = await DoctorBooking.findOne({ doctorId: registerNumber });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    // Find appointments for this doctor, excluding already channeled
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      status: { $ne: 'Channeled' }
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
const Appointment = require('../models/Appointment');
const DoctorBooking = require('../models/DoctorBooking');

// Get available slots for a doctor on a date
exports.getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  try {
    const doctor = await DoctorBooking.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    // Calculate slots
    const startHour = parseInt(doctor.startTime.split(':')[0], 10);
    const endHour = parseInt(doctor.endTime.split(':')[0], 10);
    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hourStr = h.toString().padStart(2, '0');
        const minStr = m.toString().padStart(2, '0');
        slots.push(`${hourStr}:${minStr}`);
      }
    }
    // Remove booked slots
    const appointments = await Appointment.find({ doctorId, date });
    const bookedSlots = appointments.map(a => a.slotTime);
    const availableSlots = slots.filter(s => !bookedSlots.includes(s));
    res.json({ slots: availableSlots, bookedCount: appointments.length, maxSlots: slots.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
  const { patientName, age, history, doctorId, date, slotTime } = req.body;
  try {
    console.log('Booking appointment with data:', { patientName, age, history, doctorId, date, slotTime });
    
    if (!doctorId || !patientName || !age || !date || !slotTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const doctor = await DoctorBooking.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found with id:', doctorId);
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Check if slot is available
    const existing = await Appointment.findOne({ doctorId, date, slotTime });
    if (existing) {
      console.log('Slot already booked:', { doctorId, date, slotTime });
      return res.status(400).json({ error: 'Slot already booked' });
    }
    
    // Queue number
    const appointments = await Appointment.find({ doctorId, date });
    const queueNumber = appointments.length + 1;
    const appointment = new Appointment({
      patientName,
      age,
      history,
      doctorId,
      doctorName: doctor.doctorName,
      doctorRegisterNumber: doctor.doctorId, // Add register number
      date,
      slotTime,
      queueNumber
    });
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get appointments for a patient
exports.getPatientAppointments = async (req, res) => {
  const { patientName } = req.query;
  try {
    let appointments;
    if (patientName) {
      appointments = await Appointment.find({ patientName });
    } else {
      appointments = await Appointment.find({});
    }
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
