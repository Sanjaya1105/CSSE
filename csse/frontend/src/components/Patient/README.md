# Patient Components

This folder contains all patient-related components for the Hospital Management System, following best practices for code organization.

---

## 📁 Folder Structure

```
Patient/
├── index.js                  # Centralized exports (barrel file)
├── PatientDashboard.jsx      # Main patient dashboard
├── MyMedicalRecords.jsx      # Patient medical records view
├── MyAppointments.jsx        # Patient appointments view
└── README.md                 # This file
```

---

## 🎯 Components Overview

### **PatientDashboard.jsx**
**Purpose:** Main dashboard for patient users

**Features:**
- **Patient Profile Display**
  - Name, email, age, ID card number
  - User information from localStorage
  
- **QR Code Generation**
  - Generate personal QR code
  - Contains patient ID only
  - Modal popup with QR display
  - Download/print capability
  - Instructions for usage
  
- **Navigation Options**
  - "My Medical Records" → View all medical history
  - "My Appointments" → View all bookings
  - "Generate QR Code" → Display QR modal
  
- **Appointment Booking**
  - View available doctors
  - Select doctor and date
  - Choose time slot
  - Navigate to payment selection
  - Book appointments
  
- **Appointments List**
  - View all patient's appointments
  - See status (Pending/Approved/Channeled)
  - Display doctor, date, time
  - Queue number information

**Route:** `/patient-dashboard`

**User Type:** `patient`

**Subcomponents Used:**
- `AppointmentForm` (from Appointment folder)
- `AppointmentSlots` (from Appointment folder)
- `AppointmentList` (from Appointment folder)
- `AvailableDoctors` (from Appointment folder)

**External Libraries:**
- `qrcode.react` - QR code generation

**API Endpoints:**
- `GET /api/doctors` - Get available doctors
- `GET /api/appointments/patient?patientName=...` - Get patient appointments
- `GET /api/appointments/slots?doctorId=...&date=...` - Get available slots
- `GET /api/doctors/register/:registerNumber` - Get doctor details

**QR Code Features:**
- Contains: Patient ID (`user._id` or `user.idCardNumber`)
- Size: 200x200 pixels
- Error correction: High (H)
- Format: SVG
- Margin: Included
- Display: Modal popup with patient info
- Usage: For doctor/admin scanning

---

### **MyMedicalRecords.jsx**
**Purpose:** Display all medical records for the logged-in patient

**Features:**
- **Medical Records List**
  - View all patient's medical records
  - Chronological display (newest first)
  - Diagnosis, medicines, recommendations
  - Next appointment dates
  - Medical report attachments
  
- **Record Details**
  - Patient name and age
  - Diagnosis information
  - Prescribed medicines
  - Doctor recommendations
  - Next visit date
  - PDF report viewing
  
- **PDF Download**
  - Download medical report PDFs
  - View reports in new tab
  - File access from server
  
- **Empty State**
  - Friendly message when no records
  - Encouragement to book appointments

**Route:** `/my-medical-records`

**User Type:** `patient`

**API Endpoints:**
- `GET /api/medical-records/patient/:patientId` - Get patient's records

**Data Display:**
- Patient information
- Diagnosis details
- Medicines prescribed
- Doctor recommendations
- Report URLs (if available)
- Next appointment date
- Creation timestamp

**UI Features:**
- Card-based layout
- Gradient backgrounds
- Responsive design
- Loading states
- Error handling
- Empty state messaging

---

### **MyAppointments.jsx**
**Purpose:** Display all appointments for the logged-in patient

**Features:**
- **Appointments List**
  - All patient's appointments
  - Status tracking (Pending/Approved/Channeled)
  - Doctor information
  - Date and time display
  - Queue numbers
  - Payment information
  
- **Appointment Actions**
  - Delete pending/approved appointments
  - Cannot delete channeled appointments
  - Confirmation before deletion
  
- **Status Indicators**
  - Color-coded status badges:
    - 🟡 Yellow: Pending
    - 🔵 Blue: Approved
    - 🟢 Green: Channeled
  
- **Appointment Details**
  - Patient name
  - Doctor name
  - Date (formatted)
  - Time slot
  - Queue number
  - Status
  - Payment type

**Route:** `/my-appointments`

**User Type:** `patient`

**API Endpoints:**
- `GET /api/appointments/user/:userId` - Get user's appointments
- `DELETE /api/appointments/:id` - Delete appointment

**Business Rules:**
- ✅ Can delete Pending appointments
- ✅ Can delete Approved appointments
- ❌ Cannot delete Channeled appointments

**UI Features:**
- Table layout
- Status badges
- Delete buttons
- Confirmation dialogs
- Loading states
- Error messages
- Empty state

---

## 🔄 Import Best Practices

### **Using the Barrel Export (index.js):**

**✅ Recommended:**
```javascript
// Import from the folder (uses index.js)
import { PatientDashboard, MyMedicalRecords, MyAppointments } from './components/Patient';
```

**❌ Avoid:**
```javascript
// Direct file imports (harder to refactor)
import PatientDashboard from './components/Patient/PatientDashboard';
import MyMedicalRecords from './components/Patient/MyMedicalRecords';
import MyAppointments from './components/Patient/MyAppointments';
```

### **Within Patient Folder:**

Components inside the Patient folder can import each other directly:
```javascript
// In PatientDashboard.jsx (if needed)
import MyMedicalRecords from './MyMedicalRecords';
```

### **Importing from Other Folders:**

When Patient components need components from other folders:
```javascript
// In PatientDashboard.jsx
import AppointmentForm from '../Appointment/AppointmentForm';
import AppointmentSlots from '../Appointment/AppointmentSlots';
```

---

## 🏗️ Component Relationships

```
App (Routes)
    ├── /patient-dashboard → PatientDashboard
    │       ├── AppointmentForm (from Appointment folder)
    │       ├── AppointmentSlots (from Appointment folder)
    │       ├── AppointmentList (from Appointment folder)
    │       ├── AvailableDoctors (from Appointment folder)
    │       └── QRCodeSVG (qrcode.react library)
    │
    ├── /my-medical-records → MyMedicalRecords
    │
    └── /my-appointments → MyAppointments

PatientDashboard
    ├── "My Medical Records" button → navigates to MyMedicalRecords
    ├── "My Appointments" button → navigates to MyAppointments
    └── "Generate QR Code" button → opens QR modal
```

---

## 📦 Dependencies

### **External Libraries:**
- `react` - Core React library
- `react-router-dom` - Navigation (useNavigate)
- `qrcode.react` - QR code generation (PatientDashboard)

### **Internal Components:**
- `../Appointment/*` - Appointment booking components (shared)

### **API Endpoints Used:**
- `/api/doctors` - Get available doctors
- `/api/doctors/register/:registerNumber` - Get doctor details
- `/api/appointments/patient` - Get patient appointments
- `/api/appointments/user/:userId` - Get user appointments
- `/api/appointments/slots` - Get available time slots
- `/api/appointments/:id` - Delete appointment
- `/api/medical-records/patient/:patientId` - Get patient records

---

## 🎨 Design Patterns

### **Dashboard Pattern:**
- Centralized patient hub
- Action buttons for key features
- Quick access to common tasks
- Inline functionality (QR code modal)

### **Data Fetching Pattern:**
```javascript
useEffect(() => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    navigate('/login');
    return;
  }
  
  fetchData();
}, [navigate]);
```

### **State Management:**
- localStorage for user persistence
- useState for component state
- useEffect for data fetching
- Loading/error states

### **Navigation Pattern:**
- useNavigate hook for programmatic navigation
- Button clicks trigger navigation
- Data passed via state (appointment booking)

---

## 🔐 User Permissions

### **Patient Users Can:**
- ✅ View their own dashboard
- ✅ Generate personal QR code
- ✅ View own medical records
- ✅ View own appointments
- ✅ Book new appointments
- ✅ Delete pending/approved appointments
- ✅ Navigate to payment selection

### **Patient Users Cannot:**
- ❌ View other patients' data
- ❌ Access admin features
- ❌ Manage doctor bookings
- ❌ Delete channeled appointments
- ❌ View system analytics

---

## 🧪 Testing

### **Test Files Location:**
`src/components/__tests__/MyMedicalRecords.test.jsx`

### **Test Coverage:**
- ✅ Component rendering
- ✅ Data loading
- ✅ Medical records display
- ✅ Error handling
- ✅ Empty states

### **Running Tests:**
```bash
cd csse/frontend
npm test MyMedicalRecords
```

---

## 🚀 Use Cases

### **1. Patient Login and Overview:**
1. Patient logs in
2. Redirected to PatientDashboard
3. Sees profile information
4. Can access all features from dashboard

### **2. Generate QR Code:**
1. Click "Generate QR Code" button
2. Modal opens with QR code
3. QR contains patient ID
4. Can print or save QR
5. Use for quick check-in at hospital

### **3. Book Appointment:**
1. View available doctors
2. Select doctor and date
3. Choose time slot
4. Navigate to payment
5. Complete booking
6. Appointment saved

### **4. View Medical History:**
1. Click "My Medical Records"
2. See all past consultations
3. View diagnoses and medicines
4. Download medical reports
5. Check next appointment dates

### **5. Manage Appointments:**
1. Click "My Appointments"
2. See all bookings
3. Check status (Pending/Approved/Channeled)
4. Delete if needed
5. Plan upcoming visits

---

## 💡 Best Practices Implemented

### **Code Organization:**
- ✅ Feature-based folder structure
- ✅ Barrel export pattern
- ✅ Clear component hierarchy
- ✅ Proper import order

### **React Best Practices:**
- ✅ Functional components with hooks
- ✅ Proper useEffect dependencies
- ✅ useState for state management
- ✅ Clean up on unmount
- ✅ Conditional rendering

### **UI/UX Best Practices:**
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Success feedback
- ✅ Confirmation dialogs
- ✅ Responsive design

### **Security:**
- ✅ Authentication checks
- ✅ User verification (localStorage)
- ✅ Redirect if not logged in
- ✅ QR contains ID only (not sensitive data)

---

## 🎨 Design System

### **Color Scheme:**
- **Blue gradient:** Primary theme
- **Purple:** QR code features
- **Green:** Success states
- **Red:** Logout/Delete actions
- **Yellow/Blue/Green:** Status badges

### **Layout:**
- Responsive grid layouts
- Card-based UI
- Modal popups
- Clean spacing
- Professional styling

---

## 🔧 Configuration

### **API Base URL:**
Currently hardcoded: `http://localhost:5000`

**Recommendation:**
```javascript
// In a config file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### **QR Code Settings:**
```javascript
<QRCodeSVG 
  value={user._id || user.idCardNumber}
  size={200}
  level="H"
  includeMargin={true}
/>
```

---

## 📊 Data Flow

### **PatientDashboard:**
```
Load user from localStorage
    ↓
Fetch available doctors
    ↓
Fetch patient appointments
    ↓
Display dashboard with all options
    ↓
User can: Generate QR, Book appointment, View records/appointments
```

### **MyMedicalRecords:**
```
Get patient ID from localStorage
    ↓
Fetch medical records from API
    ↓
Display records in cards
    ↓
User can view details, download reports
```

### **MyAppointments:**
```
Get patient from localStorage
    ↓
Fetch appointments using patient ID
    ↓
Display in table with status
    ↓
User can delete pending/approved appointments
```

---

## 🔄 Navigation Flow

```
PatientDashboard (main hub)
    ├── "My Medical Records" → /my-medical-records
    ├── "My Appointments" → /my-appointments
    ├── "Generate QR Code" → Modal (inline)
    └── Appointment booking → /payment-method-selection
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
- ✅ Hooks usage (useState, useEffect, useNavigate)
- ✅ Props passing
- ✅ Event handling
- ✅ Conditional rendering
- ✅ List rendering with keys

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Add patient health timeline
- [ ] Implement appointment reminders
- [ ] Add medication tracking
- [ ] Create health metrics dashboard
- [ ] Add prescription management
- [ ] Implement chat with doctor
- [ ] Add appointment cancellation with refund
- [ ] Create health tips section
- [ ] Add emergency contact management
- [ ] Implement family member access

---

## 📝 Related Components

### **Shared with Other Features:**
- `../Appointment/*` - Appointment booking (shared)
  - Used by PatientDashboard for booking
  
### **Used by Patient:**
- `../QRGen/PatientScanner` - Doctors use to scan patient QR
- `../Payment/*` - Payment processing after booking

---

## 🧪 Testing

### **Test Files:**
- `__tests__/MyMedicalRecords.test.jsx` - Medical records tests

### **Test Coverage:**
- Component rendering
- Data fetching
- Record display
- Error handling
- Empty states

### **Running Tests:**
```bash
cd csse/frontend
npm test Patient
# or
npm test MyMedicalRecords
```

---

## 🔐 Data Privacy

### **Patient Data Security:**
- User data stored in localStorage
- Authentication check on component mount
- Redirect to login if not authenticated
- QR code contains ID only (not sensitive data)
- Backend validates all requests
- Only patient's own data accessible

### **Medical Records Privacy:**
- Only patient's own records viewable
- No access to other patients' data
- Secure API endpoints
- Role-based access control

---

## 💡 User Experience

### **Key Features:**
1. **Quick Access** - All patient features in dashboard
2. **Easy Navigation** - Clear buttons for main actions
3. **Visual Feedback** - Loading/error/success states
4. **Mobile Responsive** - Works on all devices
5. **Intuitive Design** - Clean, modern interface

### **Patient Journey:**
```
Login → PatientDashboard → Choose Action
    ├── Generate QR → Use at hospital
    ├── Book Appointment → Select doctor → Pay → Confirmed
    ├── View Records → See medical history
    └── View Appointments → Track bookings
```

---

## 📊 Technical Specifications

### **State Management:**
```javascript
// User state from localStorage
const [user, setUser] = useState(null);

// Appointments
const [appointments, setAppointments] = useState([]);

// Medical records
const [records, setRecords] = useState([]);

// UI states
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
```

### **Authentication:**
```javascript
useEffect(() => {
  const userType = localStorage.getItem('userType');
  const userData = localStorage.getItem('user');

  if (!userData || userType !== 'patient') {
    navigate('/login');
    return;
  }
  
  setUser(JSON.parse(userData));
}, [navigate]);
```

---

## ✅ Checklist for Adding New Components

When adding a new patient component:

1. [ ] Create component file in `Patient/` folder
2. [ ] Use PascalCase naming
3. [ ] Add export to `index.js`
4. [ ] Update this README with description
5. [ ] Create test file in `__tests__/`
6. [ ] Use barrel import in parent components
7. [ ] Add authentication check
8. [ ] Follow established patterns

---

## 🎉 Summary

The Patient folder now follows industry best practices:

✅ **Well-Organized** - All patient components together
✅ **Barrel Exports** - Clean import syntax
✅ **Clear Structure** - Easy to navigate
✅ **Documented** - README explains everything
✅ **Tested** - Test coverage available
✅ **Scalable** - Easy to add features
✅ **Maintainable** - Clear dependencies
✅ **Professional** - Industry standards

**Components:**
- 🏠 `PatientDashboard` - Main patient interface
- 📋 `MyMedicalRecords` - Medical history view
- 📅 `MyAppointments` - Appointment management

This organization makes patient features easy to find, understand, and maintain! 🚀

