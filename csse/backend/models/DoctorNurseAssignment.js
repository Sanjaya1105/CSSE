const mongoose = require('mongoose');

const doctorNurseAssignmentSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  nurseId: {
    type: String,
    required: true
  },
  nurseName: {
    type: String,
    required: true
  },
  roomNo: {
    type: String,
    required: true
  },
  weekStartDay: {
    type: String,
    required: true
  },
  weekEndDay: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DoctorNurseAssignment', doctorNurseAssignmentSchema);
