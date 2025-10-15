const DoctorBooking = require('../models/DoctorBooking');

// Create a new doctor booking
exports.createDoctor = async (req, res) => {
  try {
    const { doctorId, doctorName, roomNo, bookingDay, startTime, endTime } = req.body;
    const doctorBooking = new DoctorBooking({ doctorId, doctorName, roomNo, bookingDay, startTime, endTime });
    await doctorBooking.save();
    res.status(201).json(doctorBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all doctor bookings
exports.getDoctors = async (req, res) => {
  try {
    const doctorBookings = await DoctorBooking.find();
    res.json(doctorBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a doctor booking
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, doctorName, roomNo, bookingDay, startTime, endTime } = req.body;
    const update = { doctorId, doctorName, roomNo, bookingDay, startTime, endTime };
    const doctorBooking = await DoctorBooking.findByIdAndUpdate(id, update, { new: true });
    res.json(doctorBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a doctor booking
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await DoctorBooking.findByIdAndDelete(id);
    res.json({ message: 'Doctor booking deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
