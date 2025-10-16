const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Hospital Management System API' });
});

// Example route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});


// Register routes
app.use('/api/register', require('./routes/registerRoutes'));

// Login routes
app.use('/api/login', require('./routes/loginRoutes'));

// Super Admin routes
app.use('/api/superadmin', require('./routes/superAdminRoutes'));

app.use('/api/doctor-nurse-assignment', require('./routes/doctorNurseAssignmentRoutes'));


// Doctor CRUD routes

// Staff routes
app.use('/api/staff', require('./routes/staffRoutes'));

// Room schedule routes
app.use('/api/room-schedule', require('./routes/roomScheduleRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));


// Appointment booking routes
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Channel routes for doctor channeling
app.use('/api/channel', require('./routes/channelRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

