# Doctor Components

This folder contains all doctor-related components for the Hospital Management System, following best practices for code organization.

---

## 📁 Folder Structure

```
Doctor/
├── index.js                     # Centralized exports (barrel file)
├── DoctorDashboard.jsx          # Main doctor dashboard
├── DoctorAppointmentTable.jsx   # Doctor's appointment table with channeling
├── ChannelPopup.jsx             # Channel patient popup form
├── ChannelHistoryPopup.jsx      # Patient channeling history popup
├── AddMedicalRecord.jsx         # Add medical record form (doctor use)
├── DoctorForm.jsx               # Doctor booking form (admin use)
├── DoctorTable.jsx              # Doctor bookings table (admin use)
├── DoctorWeeklyReport.jsx       # Weekly appointments report (admin use)
├── ScheduleGrid.jsx             # Weekly schedule grid (admin use)
└── README.md                    # This file
```

---

## 🎯 Components Overview

### **DoctorDashboard.jsx**
**Purpose:** Main dashboard for doctor users

**Features:**
- **Doctor Profile Display**
  - Name, email, NIC, register number, specialization
  - Channeling fee management
  - Update fee functionality
  
- **Channeling Fee Management**
  - Input field to set/update fee
  - "Update Fee" button
  - Updates backend and localStorage
  - Immediate UI feedback
  
- **Appointments Table**
  - View all doctor's appointments
  - Filter: Excludes already channeled
  - Real-time appointment list
  - Integrated channeling interface
  
- **Navigation**
  - "View Patient" → Navigate to PatientScanner (QR scanner)
  - "Logout" → Clear session and redirect

**Route:** `/doctor-dashboard`

**User Type:** `doctor`

**Subcomponents:**
- `DoctorAppointmentTable` - Appointment table with channeling

**API Endpoints:**
- `GET /api/appointments/doctor?registerNumber=...` - Get doctor's appointments
- `PUT /api/doctors/:id/channeling-fee` - Update channeling fee

---

### **DoctorAppointmentTable.jsx**
**Purpose:** Display and manage doctor's appointments with channeling functionality

**Features:**
- **Appointments Table**
  - Patient name, age, date, time
  - Queue numbers
  - Status indicators
  - Appointment history display
  
- **Channeling Features**
  - "Channel" button for each appointment
  - Opens ChannelPopup modal
  - Records patient consultation details
  - Marks appointment as "Channeled"
  
- **View History**
  - "View History" button
  - Opens ChannelHistoryPopup
  - Shows patient's previous channels
  
- **Loading States**
  - Loading indicator
  - Error messages
  - Empty state handling

**Used By:** DoctorDashboard

**Subcomponents:**
- `ChannelPopup` - Channel patient form
- `ChannelHistoryPopup` - View patient history

**API Endpoints:**
- Fetched appointments passed as prop
- Channel operations handled by popups

---

### **ChannelPopup.jsx**
**Purpose:** Modal form for channeling (consulting) patients

**Features:**
- **Channel Form**
  - Patient details (name, age) - pre-filled
  - Diagnosis/details input
  - Medicine/treatment input
  - Medical report upload (optional PDF)
  - Next appointment date selection
  
- **File Upload**
  - PDF reports only
  - File size validation
  - Preview file name
  
- **Submission**
  - Saves channel details to backend
  - Uploads medical report if provided
  - Marks appointment as "Channeled"
  - Closes modal on success

**Used By:** DoctorAppointmentTable

**API Endpoints:**
- `POST /api/channel` - Save channel details with file upload

**Form Fields:**
- appointmentId (hidden)
- patientName (readonly)
- age (readonly)
- details (diagnosis)
- medicine (prescriptions)
- report (file upload)
- nextDate (next appointment)

---

### **AddMedicalRecord.jsx**
**Purpose:** Form for doctors to add medical records for patients

**Features:**
- **Patient Information Display**
  - Pre-filled patient data (name, age, ID)
  - Passed via navigation state
  - Read-only patient fields
  
- **Medical Record Form**
  - Diagnosis input (required)
  - Medicines/treatment input (required)
  - Recommendations input (optional)
  - Next appointment date picker
  - Medical report upload (PDF, optional)
  
- **File Upload**
  - PDF reports only
  - File size validation
  - Preview selected file
  - Optional field
  
- **Form Validation**
  - Required field checks
  - File type validation
  - Error messages
  
- **Submission**
  - Saves to backend via multipart/form-data
  - Uploads PDF if provided
  - Success/error feedback
  - Redirects after save

**Route:** `/add-medical-record`

**User Type:** Doctor (accessed from PatientScanner)

**API Endpoints:**
- `POST /api/medical-records/save` - Save medical record with file upload

**Form Fields:**
- patientId (hidden, from navigation state)
- patientName (readonly, from navigation state)
- age (readonly, from navigation state)
- diagnosis (required)
- medicines (required)
- recommendation (optional)
- nextDate (optional)
- report (file upload, optional PDF)

**Navigation:**
- Receives patient data via `location.state.patientData`
- Redirects to doctor dashboard after save
- Back button available

**Used By:** 
- Doctor workflow after scanning patient QR
- PatientScanner → View Patient → Add Medical Record

---

### **ChannelHistoryPopup.jsx**
**Purpose:** Display patient's previous channeling history

**Features:**
- **History List**
  - All previous channels for patient
  - Chronological order (newest first)
  - Diagnosis details
  - Medicines prescribed
  - Recommendations
  - Next appointment dates
  - Medical reports (if available)
  
- **Medical Reports**
  - Download report button
  - Opens PDF in new tab
  - File access from server
  
- **Empty State**
  - Message when no history
  - Clean UI feedback

**Used By:** DoctorAppointmentTable

**API Endpoints:**
- `GET /api/channel/patient/:patientName` - Get patient's channel history

**Display Format:**
- Card-based layout
- Date stamps
- Expandable details
- Download links for reports

---

### **DoctorForm.jsx** (Admin Use)
**Purpose:** Form for creating/editing doctor bookings

**Features:**
- **Doctor Selection**
  - Dropdown of approved doctors
  - Auto-fill: name, specialization
  - Manual doctor ID entry option
  
- **Booking Details**
  - Room number
  - Booking day (dropdown)
  - Start time
  - End time
  
- **Form Modes**
  - Create mode (new booking)
  - Edit mode (update existing)
  
- **Validation**
  - Required field checks
  - Time validation
  - Conflict checking

**Used By:** AdminDashboard

**Props:**
- `form` - Form data object
- `onChange` - Field change handler
- `onSubmit` - Form submit handler
- `onClose` - Close form handler
- `editId` - ID if editing (null if creating)
- `approvedDoctors` - List of approved doctors
- `onDoctorSelect` - Doctor selection handler

---

### **DoctorTable.jsx** (Admin Use)
**Purpose:** Display all doctor bookings with CRUD operations

**Features:**
- **Bookings Table**
  - Doctor ID, name, room number
  - Specialization
  - Booking day
  - Time slots (start - end)
  
- **Actions**
  - Edit booking button
  - Delete booking button
  
- **Empty State**
  - Message when no bookings
  - Clean UI

**Used By:** AdminDashboard

**Props:**
- `doctors` - Array of doctor bookings
- `onEdit` - Edit handler
- `onDelete` - Delete handler

---

### **DoctorWeeklyReport.jsx** (Admin Use)
**Purpose:** Weekly appointment report by doctor

**Features:**
- **Report Table**
  - Doctor ID, name, room
  - Weekly appointment counts
  - Week numbers
  - Total counts
  
- **Filtering**
  - Filter by doctor ID
  - Show all or specific doctor
  
- **PDF Export**
  - Download report as PDF
  - Professional formatting
  - Weekly breakdown included

**Used By:** AdminDashboard

**API Endpoints:**
- `GET /api/doctors` - Get all doctors
- `GET /api/appointments` - Get all appointments

**Report Generation:**
- Groups appointments by doctor and week
- Calculates week numbers
- Generates downloadable PDF

---

### **ScheduleGrid.jsx** (Admin Use)
**Purpose:** Weekly schedule grid visualization

**Features:**
- **Weekly View**
  - 7 columns (Monday - Sunday)
  - Time slots for each day
  - Doctor assignments
  - Nurse assignments (if available)
  
- **Slot Click**
  - Click handler for slot selection
  - Used for nurse assignment
  - Visual feedback
  
- **Display Format**
  - Grid layout
  - Color-coded cells
  - Time and doctor info
  - Responsive design

**Used By:** 
- AdminDashboard (room schedule view)
- StaffTable (nurse assignment)

**Props:**
- `filteredDoctors` - Array of doctor bookings
- `onSlotClick` - Click handler for slots (optional)

---

## 🔄 Import Best Practices

### **Using the Barrel Export (index.js):**

**✅ Recommended:**
```javascript
// Import from the folder (uses index.js)
import { DoctorDashboard, DoctorForm, ScheduleGrid } from './components/Doctor';
```

**❌ Avoid:**
```javascript
// Direct file imports (harder to refactor)
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import DoctorForm from './components/Doctor/DoctorForm';
```

### **Within Doctor Folder:**

Components inside the Doctor folder can import each other directly:
```javascript
// In DoctorDashboard.jsx
import DoctorAppointmentTable from './DoctorAppointmentTable';
```

---

## 🏗️ Component Relationships

```
App (Routes)
    └── /doctor-dashboard → DoctorDashboard
            └── DoctorAppointmentTable
                    ├── ChannelPopup (for channeling)
                    └── ChannelHistoryPopup (view history)

AdminDashboard
    ├── DoctorForm (create/edit bookings)
    ├── DoctorTable (view all bookings)
    ├── ScheduleGrid (weekly schedule view)
    └── DoctorWeeklyReport (analytics)

StaffTable (from Staff folder)
    └── ScheduleGrid (for nurse assignment view)
```

---

## 📦 Dependencies

### **External Libraries:**
- `react` - Core React library
- `react-router-dom` - Navigation
- `jspdf` - PDF generation (DoctorWeeklyReport)
- `jspdf-autotable` - PDF tables (DoctorWeeklyReport)

### **Internal Components:**
- Components within Doctor folder import each other

### **API Endpoints Used:**
- `/api/doctors` - Doctor CRUD
- `/api/doctors/:id/channeling-fee` - Update fee
- `/api/doctors/register/:registerNumber` - Get doctor by register number
- `/api/appointments/doctor` - Get doctor's appointments
- `/api/channel` - Save channel details
- `/api/channel/patient/:patientName` - Get channel history

---

## 🎨 Design Patterns

### **Dashboard Pattern:**
- Centralized doctor hub
- Profile management
- Appointment viewing
- Quick actions (View Patient, Update Fee)

### **Table Pattern:**
- Tabular data display
- Action buttons per row
- Sorting and filtering
- Empty states

### **Modal Pattern:**
- Popup forms (ChannelPopup)
- Popup views (ChannelHistoryPopup)
- Overlay backgrounds
- Close handlers

### **Form Pattern:**
- Controlled inputs
- Validation
- Submit handlers
- Create/Edit modes

---

## 🔐 User Permissions

### **Doctor Users Can:**
- ✅ View their own dashboard
- ✅ View their appointments only
- ✅ Channel (consult) patients
- ✅ View patient info via QR scanner
- ✅ Update their channeling fee
- ✅ Add medical records
- ✅ View patient channel history

### **Doctor Users Cannot:**
- ❌ View other doctors' appointments
- ❌ Create doctor bookings (admin only)
- ❌ Delete appointments
- ❌ Access admin features
- ❌ Approve other doctors

### **Admin Users Can (with Doctor Components):**
- ✅ Create doctor bookings (DoctorForm)
- ✅ View all doctor bookings (DoctorTable)
- ✅ Edit/delete bookings
- ✅ View weekly schedules (ScheduleGrid)
- ✅ Generate reports (DoctorWeeklyReport)

---

## 🧪 Testing

### **Test Files:**
- `__tests__/DoctorForm.test.jsx` - Form component tests
- `__tests__/DoctorWeeklyReport.test.jsx` - Report tests
- `__tests__/ScheduleGrid.test.jsx` - Grid component tests

### **Test Coverage:**
- Component rendering
- Form validation
- PDF generation
- User interactions
- Empty states

### **Running Tests:**
```bash
cd csse/frontend
npm test Doctor
```

---

## 🚀 Use Cases

### **1. Doctor Views Appointments:**
1. Doctor logs in
2. Redirected to DoctorDashboard
3. Sees list of appointments
4. Reviews patient queue
5. Can channel patients

### **2. Doctor Channels Patient:**
1. Views appointment in table
2. Clicks "Channel" button
3. ChannelPopup opens
4. Enters diagnosis and medicines
5. Uploads report (optional)
6. Sets next appointment date
7. Saves channel details
8. Appointment marked as "Channeled"

### **3. Doctor Updates Channeling Fee:**
1. On DoctorDashboard
2. Enters new fee amount
3. Clicks "Update Fee"
4. Fee saved to backend
5. localStorage updated
6. Success message shown

### **4. Admin Manages Doctor Bookings:**
1. Admin on AdminDashboard
2. Clicks "Add Doctor Booking"
3. DoctorForm appears
4. Selects doctor from approved list
5. Sets room, day, time
6. Saves booking
7. Appears in DoctorTable

### **5. Admin Views Schedule:**
1. Admin enters room number
2. Clicks "Search"
3. ScheduleGrid displays
4. Shows weekly schedule for that room
5. Can see all doctors' time slots

---

## 💡 Best Practices Implemented

### **Code Organization:**
- ✅ Feature-based folder structure
- ✅ Barrel export pattern
- ✅ Clear component hierarchy
- ✅ Dashboard + sub-components together

### **React Best Practices:**
- ✅ Functional components with hooks
- ✅ Proper state management
- ✅ useEffect with dependencies
- ✅ Conditional rendering
- ✅ Event handlers with clear names

### **UI/UX Best Practices:**
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback
- ✅ Confirmation dialogs
- ✅ Responsive design
- ✅ Accessible colors

---

## 🎨 Design System

### **Color Scheme:**
- **Green gradient:** Doctor dashboard theme
- **Blue:** Action buttons
- **Purple:** Channel-related features
- **Yellow/Blue/Green:** Status badges

### **Layout:**
- Responsive grid layouts
- Card-based UI
- Modal popups
- Table displays
- Clean spacing

---

## 🔧 Configuration

### **API Base URL:**
Currently hardcoded: `http://localhost:5000`

**Recommendation:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

---

## 📊 Data Flow

### **DoctorDashboard:**
```
Load doctor from localStorage
    ↓
Fetch appointments by registerNumber
    ↓
Display dashboard with appointments
    ↓
Doctor can: Channel patients, Update fee, View patients
```

### **Channeling Flow:**
```
Doctor clicks "Channel" on appointment
    ↓
ChannelPopup opens
    ↓
Doctor enters diagnosis, medicines
    ↓
Uploads report (optional)
    ↓
Sets next date
    ↓
Submits form
    ↓
POST /api/channel
    ↓
Appointment status → "Channeled"
    ↓
Popup closes, table refreshes
```

### **Admin Booking Flow:**
```
Admin clicks "Add Doctor Booking"
    ↓
DoctorForm opens
    ↓
Selects approved doctor
    ↓
Sets room, day, time slots
    ↓
Submits form
    ↓
POST /api/doctors
    ↓
Booking saved
    ↓
Appears in DoctorTable
```

---

## 🎯 Code Quality Standards

### **Followed Best Practices:**
- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Clear naming conventions
- ✅ Proper folder organization
- ✅ Centralized exports
- ✅ Component documentation
- ✅ Consistent code style

### **React Standards:**
- ✅ Functional components
- ✅ Hooks usage
- ✅ Props destructuring
- ✅ Event handling
- ✅ Conditional rendering
- ✅ List rendering with keys
- ✅ Proper cleanup

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Add doctor availability management
- [ ] Implement patient notes system
- [ ] Add prescription templates
- [ ] Create doctor performance dashboard
- [ ] Add appointment reminders
- [ ] Implement video consultation
- [ ] Add patient feedback system
- [ ] Create medical record templates
- [ ] Add drug interaction warnings
- [ ] Implement voice-to-text for notes

---

## 📝 Component Categories

### **Doctor User Components:**
- `DoctorDashboard.jsx` - Main doctor interface
- `DoctorAppointmentTable.jsx` - Appointment management
- `ChannelPopup.jsx` - Patient consultation form
- `ChannelHistoryPopup.jsx` - Patient history viewer

### **Admin Use Components:**
- `DoctorForm.jsx` - Create/edit doctor bookings
- `DoctorTable.jsx` - View all bookings
- `DoctorWeeklyReport.jsx` - Generate reports
- `ScheduleGrid.jsx` - Weekly schedule visualization

---

## ✅ Checklist for Adding New Components

When adding a new doctor component:

1. [ ] Create component file in `Doctor/` folder
2. [ ] Use PascalCase naming
3. [ ] Add export to `index.js`
4. [ ] Update this README with description
5. [ ] Create test file in `__tests__/`
6. [ ] Use barrel import in parent components
7. [ ] Add doctor authentication check (if doctor-specific)
8. [ ] Follow established patterns
9. [ ] Document props and API endpoints

---

## 🎉 Summary

The Doctor folder now follows industry best practices:

✅ **Well-Organized** - All doctor components together (9 total)
✅ **Barrel Exports** - Clean import syntax
✅ **Clear Structure** - Easy to navigate
✅ **Documented** - README explains everything
✅ **Tested** - Test coverage for key components
✅ **Scalable** - Easy to add features
✅ **Maintainable** - Clear dependencies
✅ **Professional** - Industry standards

**Components:**
- 🏥 `DoctorDashboard` - Main doctor interface
- 📋 `DoctorAppointmentTable` - Appointment management with channeling
- 💬 `ChannelPopup` - Patient consultation form
- 📜 `ChannelHistoryPopup` - Patient history viewer
- 📄 `AddMedicalRecord` - Add patient medical records (doctor use)
- 📝 `DoctorForm` - Booking form (admin use)
- 📊 `DoctorTable` - Bookings table (admin use)
- 📈 `DoctorWeeklyReport` - Analytics (admin use)
- 🗓️ `ScheduleGrid` - Schedule visualization (admin use)

This organization makes doctor features easy to find, understand, and maintain! 🚀

