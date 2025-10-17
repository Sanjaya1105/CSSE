# Admin Components

This folder contains all admin-related components for the Hospital Management System, following best practices for code organization.

---

## 📁 Folder Structure

```
Admin/
├── index.js                  # Centralized exports (barrel file)
├── AdminDashboard.jsx        # Main admin dashboard
├── PeakTimesAnalytics.jsx    # Patient peak times analytics component
└── README.md                 # This file
```

**Note:** Additional admin sub-components are in the `AdminAppointment/` folder.

---

## 🎯 Components Overview

### **AdminDashboard.jsx**
**Purpose:** Main dashboard for admin users

**Features:**
- **Doctor Booking Management**
  - Add/edit/delete doctor bookings
  - Room schedule search
  - Weekly schedule grid view
  - Doctor selection from approved doctors
  
- **Staff Management**
  - View all staff/nurses
  - Assign nurses to doctors
  - Weekly schedule management
  - Success notifications
  
- **Appointment Management**
  - View pending appointments
  - View all appointments
  - Approve/manage appointments
  - Payment details modal
  
- **Doctor Weekly Report**
  - View doctor appointment statistics
  - Weekly breakdown by doctor
  - Filter by doctor ID
  
- **Peak Times Analytics**
  - Patient appointment peak hours
  - Visual analytics charts
  - PDF export functionality

**Route:** `/admin-dashboard`

**User Type:** `admin`

**Subcomponents Used:**
- `StaffTable` (from Staff folder)
- `SuccessToast` (from Staff folder)
- `DoctorForm` (from Doctor folder)
- `DoctorTable` (from Doctor folder)
- `ScheduleGrid` (from Doctor folder)
- `DoctorWeeklyReport` (from Doctor folder)
- `AdminAppointmentTable` (from AdminAppointment folder)
- `PendingAppointmentTable` (from AdminAppointment folder)
- `PeakTimesAnalytics` (same folder)

**Navigation Features:**
- "View Patients" → `/admin-patient-scanner` (QRGen folder)
- "Generate QR for Patient" → `/generate-qr-for-patient` (QRGen folder)
- "Logout" → Clears localStorage and redirects to login

---

### **PeakTimesAnalytics.jsx**
**Purpose:** Analytics component for patient appointment peak times

**Features:**
- Fetches peak times data from backend
- Displays appointment counts by hour
- Interactive bar chart visualization
- Table view of hourly data
- PDF export with chart and table
- Loading and error states

**Used By:** AdminDashboard

**API Endpoints:**
- `GET /api/appointments/analytics/peak-times` - Get peak time data

**Data Structure:**
```javascript
[
  { date: "2025-10-15", hour: "09", count: 5 },
  { date: "2025-10-15", hour: "10", count: 8 },
  // ...
]
```

**Chart Technology:**
- Library: `recharts`
- Type: Bar chart
- X-axis: Hour (00-23)
- Y-axis: Appointment count

**Export Features:**
- PDF download with table and chart
- Chart captured as image using `html2canvas`
- Professional formatting with `jspdf-autotable`

**Visual Design:**
- Pink/rose color scheme
- Responsive container
- Clean table layout
- Interactive hover tooltips

---

## 🔄 Import Best Practices

### **Using the Barrel Export (index.js):**

**✅ Recommended:**
```javascript
// Import from the folder (uses index.js)
import { AdminDashboard, PeakTimesAnalytics } from './components/Admin';
```

**❌ Avoid:**
```javascript
// Direct file imports (harder to refactor)
import AdminDashboard from './components/Admin/AdminDashboard';
import PeakTimesAnalytics from './components/Admin/PeakTimesAnalytics';
```

### **Within Admin Folder:**

Components inside the Admin folder can import each other directly:
```javascript
// In AdminDashboard.jsx
import PeakTimesAnalytics from './PeakTimesAnalytics';
```

### **Importing from Other Folders:**

When Admin components need components from other folders:
```javascript
// In AdminDashboard.jsx
import { StaffTable, SuccessToast } from '../Staff';
import DoctorForm from '../Doctor/DoctorForm';
import AdminAppointmentTable from '../AdminAppointment/AdminAppointmentTable';
```

---

## 🏗️ Component Relationships

```
App (Routes)
    └── /admin-dashboard → AdminDashboard
            ├── StaffTable (from Staff folder)
            │   ├── NurseSelector
            │   ├── NurseModal
            │   └── SuccessToast
            ├── DoctorForm (from Doctor folder)
            ├── DoctorTable (from Doctor folder)
            ├── ScheduleGrid (from Doctor folder)
            ├── DoctorWeeklyReport (from Doctor folder)
            ├── AdminAppointmentTable (from AdminAppointment folder)
            │   └── PaymentDetailsModal
            ├── PendingAppointmentTable (from AdminAppointment folder)
            └── PeakTimesAnalytics (same folder)
```

---

## 📦 Dependencies

### **External Libraries:**
- `react` - Core React library
- `react-router-dom` - Navigation (useNavigate)
- `recharts` - Chart visualization
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF table formatting
- `html2canvas` - Chart to image conversion

### **Internal Components:**
- `../Staff/*` - Staff management components
- `../Doctor/*` - Doctor management components
- `../AdminAppointment/*` - Appointment management components

### **API Endpoints Used:**
- `/api/doctors` - Doctor CRUD operations
- `/api/staff` - Staff management
- `/api/doctor-nurse-assignment` - Nurse assignments
- `/api/appointments` - Appointment management
- `/api/appointments/analytics/peak-times` - Analytics data

---

## 🎨 Design Patterns

### **Dashboard Layout:**
- Sectioned design with colored borders
- Card-based UI components
- Responsive grid layouts
- Collapsible sections
- Modal popups for forms

### **Color Scheme:**
- **Blue:** Doctor management section
- **Green:** Staff management section
- **Purple:** Appointment management section
- **Yellow:** Reports section
- **Pink:** Analytics section

### **State Management:**
- React hooks (useState, useEffect, useRef)
- Local component state
- Form state management
- Modal visibility states
- Success message state with timeout

---

## 🔐 User Permissions

### **Admin Users Can:**
- ✅ Manage doctor bookings (CRUD)
- ✅ Assign nurses to doctors
- ✅ View and approve appointments
- ✅ Generate QR codes for patients
- ✅ View patient information via scanner
- ✅ Access analytics and reports
- ✅ Manage staff schedules
- ✅ View doctor weekly reports

### **Admin Users Cannot:**
- ❌ Approve/reject doctor registrations (SuperAdmin only)
- ❌ Create/delete admin accounts (SuperAdmin only)
- ❌ Access SuperAdmin analytics
- ❌ Manage system-wide settings

---

## 🧪 Testing

### **Test Files Location:**
`src/components/__tests__/PeakTimesAnalytics.test.jsx`

### **Test Coverage:**
- ✅ Data loading states
- ✅ Chart rendering
- ✅ Table display
- ✅ PDF export
- ✅ Error handling

### **Running Tests:**
```bash
cd csse/frontend
npm test PeakTimesAnalytics
```

---

## 📊 AdminDashboard Sections

### **Section 1: Doctor Booking Management**
- Add new doctor bookings
- View all doctor bookings table
- Search by room number
- Weekly schedule view

### **Section 2: Staff Management**
- Staff table with nurse assignments
- Room-based scheduling
- Week-based assignments
- Success notifications

### **Section 3: Appointment Management**
- Pending appointments (awaiting approval)
- All appointments list
- Payment details viewing
- Status management

### **Section 4: Doctor Weekly Report**
- Filter by doctor
- Weekly appointment counts
- Downloadable reports

### **Section 5: Peak Times Analytics**
- Hourly appointment distribution
- Visual bar charts
- PDF export capability

---

## 🚀 Use Cases

### **1. Managing Doctor Bookings:**
1. Admin logs in
2. Goes to "Doctor Booking Management" section
3. Selects approved doctor from dropdown
4. Sets room, day, time slots
5. Saves booking
6. Doctor appears in schedule

### **2. Assigning Nurses:**
1. Enter room number and week dates
2. View doctor schedule for that room
3. Click on time slots
4. Select nurse for each slot
5. Confirm and save assignments
6. Nurses get notified of schedule

### **3. Approving Appointments:**
1. Check "Pending Appointments" section
2. Review appointment details
3. View payment information
4. Approve appointment
5. Status changes to "Approved"

### **4. Viewing Analytics:**
1. Scroll to "Peak Times Analytics" section
2. Review hourly appointment chart
3. Identify busy hours
4. Download PDF report
5. Use for staffing decisions

---

## 💡 Best Practices Implemented

### **Code Organization:**
- ✅ Feature-based folder structure
- ✅ Barrel export pattern
- ✅ Clear component hierarchy
- ✅ Proper import order (React → Libraries → Internal → Local)

### **React Best Practices:**
- ✅ Functional components with hooks
- ✅ Proper useEffect cleanup
- ✅ useState for state management
- ✅ Event handlers with clear names
- ✅ Conditional rendering

### **UI/UX Best Practices:**
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback
- ✅ Responsive design
- ✅ Accessible color contrast

---

## 🔧 Configuration

### **API Base URL:**
Currently uses: `http://localhost:5000`

**Recommendation:**
```javascript
// In a config file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### **Polling Intervals:**
- No polling in admin components currently
- Could add real-time updates for appointments

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

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Add admin-specific analytics dashboard
- [ ] Implement real-time appointment updates
- [ ] Add doctor performance tracking
- [ ] Create custom report builder
- [ ] Add email notification system
- [ ] Implement audit log viewer
- [ ] Add backup/restore functionality
- [ ] Create dashboard customization options
- [ ] Add bulk operations for appointments
- [ ] Implement advanced filtering

---

## 📝 Related Folders

### **AdminAppointment/** (separate folder)
Contains admin appointment management sub-components:
- `AdminAppointmentTable.jsx` - All appointments view
- `PaymentDetailsModal.jsx` - Payment information modal
- `PendingAppointmentTable.jsx` - Pending approvals

**Why Separate?**
- More granular organization
- Focused on appointment management
- Can have its own barrel export

### **Potential Future Structure:**
```
Admin/
├── index.js
├── AdminDashboard.jsx
├── PeakTimesAnalytics.jsx
├── README.md
└── Appointments/              (Could merge AdminAppointment here)
    ├── AdminAppointmentTable.jsx
    ├── PaymentDetailsModal.jsx
    └── PendingAppointmentTable.jsx
```

---

## ✅ Checklist for Adding New Components

When adding a new admin component:

1. [ ] Create component file in `Admin/` folder
2. [ ] Use PascalCase naming
3. [ ] Add export to `index.js`
4. [ ] Update this README with description
5. [ ] Create test file in `__tests__/`
6. [ ] Use barrel import in parent components
7. [ ] Follow established patterns
8. [ ] Document props and usage

---

## 🎉 Summary

The Admin folder now follows industry best practices:

✅ **Well-Organized** - Admin components together
✅ **Barrel Exports** - Clean import syntax
✅ **Clear Structure** - Easy to navigate
✅ **Documented** - README explains everything
✅ **Tested** - Test coverage for components
✅ **Scalable** - Easy to add features
✅ **Maintainable** - Clear dependencies
✅ **Professional** - Industry standards

**Components:**
- 🏥 `AdminDashboard` - Main admin interface
- 📊 `PeakTimesAnalytics` - Analytics and reporting

This organization makes admin features easy to find, understand, and maintain! 🚀

