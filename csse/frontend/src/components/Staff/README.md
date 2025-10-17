# Staff/Nurse Components

This folder contains all staff and nurse-related components for the Hospital Management System, following best practices for code organization.

---

## 📁 Folder Structure

```
Staff/
├── index.js                  # Centralized exports (barrel file)
├── NurseDashboard.jsx        # Main nurse dashboard view
├── NurseModal.jsx            # Modal for nurse selection
├── NurseSelector.jsx         # Nurse dropdown selector component
├── StaffTable.jsx            # Staff management table with scheduling
├── SuccessToast.jsx          # Success notification component
└── README.md                 # This file
```

---

## 🎯 Components Overview

### **NurseDashboard.jsx**
**Purpose:** Main dashboard for nurse/staff users

**Features:**
- Displays nurse profile information
- Shows assigned schedule (doctor assignments)
- Fetches schedule from `/api/doctor-nurse-assignment`
- Logout functionality

**Route:** `/nurse-dashboard`

**User Type:** `staff`

---

### **NurseModal.jsx**
**Purpose:** Modal popup for nurse selection

**Features:**
- Shows list of available nurses
- Allows selection of nurse for assignment
- Used within admin workflows

**Props:**
- `nurses` - Array of nurse objects
- `onSelect` - Callback when nurse is selected
- `onClose` - Callback to close modal

**Used By:** Admin staff management features

---

### **NurseSelector.jsx**
**Purpose:** Dropdown component for selecting nurses

**Features:**
- Displays nurses in a dropdown
- Supports filtering/searching
- Returns selected nurse data

**Props:**
- `nurses` - Array of available nurses
- `selectedNurse` - Currently selected nurse
- `onChange` - Callback for selection change

**Used By:** Staff assignment forms

---

### **StaffTable.jsx**
**Purpose:** Main staff management table with nurse scheduling

**Features:**
- View all staff members
- Search by room number
- Weekly schedule grid
- Assign nurses to doctors
- Save assignments
- View previous assignments

**Props:**
- `onShowSuccess` - Callback for success notifications

**Used By:** AdminDashboard

**Dependencies:**
- `NurseSelector` - For selecting nurses
- `NurseModal` - For nurse assignment popups
- `ScheduleGrid` - For weekly schedule display (from Doctor folder)

---

### **SuccessToast.jsx**
**Purpose:** Reusable success notification component

**Features:**
- Shows success messages
- Auto-dismiss after timeout
- Manual close option
- Smooth animations

**Props:**
- `message` - Success message to display
- `onClose` - Callback when closed

**Used By:** AdminDashboard, Staff management workflows

---

## 🔄 Import Best Practices

### **Using the Barrel Export (index.js):**

**✅ Recommended:**
```javascript
// Import from the folder (uses index.js)
import { NurseDashboard, StaffTable, NurseModal } from './components/Staff';
```

**❌ Avoid:**
```javascript
// Direct file imports (harder to refactor)
import NurseDashboard from './components/Staff/NurseDashboard';
import StaffTable from './components/Staff/StaffTable';
```

### **Within Staff Folder:**

Components inside the Staff folder can import each other directly:
```javascript
// In StaffTable.jsx
import NurseSelector from './NurseSelector';
import NurseModal from './NurseModal';
```

---

## 🏗️ Code Organization Benefits

### **Modularity:**
- ✅ All nurse/staff components in one place
- ✅ Easy to find related functionality
- ✅ Clear separation of concerns

### **Maintainability:**
- ✅ Changes to staff features isolated to this folder
- ✅ Easier debugging and testing
- ✅ Clear component dependencies

### **Scalability:**
- ✅ Easy to add new staff-related components
- ✅ Centralized import management
- ✅ Consistent import patterns

### **Best Practices:**
- ✅ Barrel exports (index.js) for cleaner imports
- ✅ Organized folder structure
- ✅ Co-located related components
- ✅ Clear naming conventions

---

## 📦 Dependencies

### **External Libraries:**
- `react` - Core React library
- `react-router-dom` - Navigation (useNavigate)

### **Internal Components:**
- `../Doctor/ScheduleGrid` - Weekly schedule display

### **API Endpoints Used:**
- `/api/doctor-nurse-assignment` - Nurse schedules
- `/api/doctor-nurse-assignment/by-room-week` - Previous assignments
- `/api/staff` - Staff CRUD operations

---

## 🎨 Component Relationships

```
AdminDashboard
    └── StaffTable
            ├── NurseSelector (for assignment)
            ├── NurseModal (for selection popup)
            ├── SuccessToast (for notifications)
            └── ScheduleGrid (from Doctor folder)

App (Routes)
    └── NurseDashboard (staff login route)
```

---

## 🧪 Testing

### **Test Files Location:**
`src/components/__tests__/`

### **Test Coverage:**
- ✅ `NurseModal.test.jsx` - Modal functionality
- ✅ `NurseSelector.test.jsx` - Selector component
- ✅ `StaffTable.test.jsx` - Staff table operations
- ✅ `Staff.test.jsx` - General staff tests

### **Running Tests:**
```bash
cd csse/frontend
npm test Staff
```

---

## 🔐 User Permissions

### **Nurse/Staff Users:**
- Can view their own dashboard
- Can see assigned schedules
- Cannot modify assignments
- Read-only access to schedule

### **Admin Users:**
- Can manage staff
- Can assign nurses to doctors
- Can create/update/delete assignments
- Full access to StaffTable

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Add nurse performance tracking
- [ ] Implement shift swapping
- [ ] Add nurse availability management
- [ ] Create nurse-specific analytics
- [ ] Add notification system for assignments
- [ ] Implement time-off requests
- [ ] Add workload balancing features

---

## 📝 Naming Conventions

### **Files:**
- PascalCase for component files: `NurseDashboard.jsx`
- Descriptive names: `SuccessToast.jsx` not `Toast.jsx`
- Clear purpose in name

### **Components:**
- Match filename: `NurseDashboard` component in `NurseDashboard.jsx`
- Default exports for main components
- Named exports in index.js

### **Props:**
- camelCase: `onShowSuccess`, `onClose`
- Descriptive: `selectedNurse` not `selected`
- Callback prefix: `on` (onClick, onSelect, onClose)

---

## 🎯 Code Quality Standards

### **Followed Best Practices:**
- ✅ Single Responsibility Principle (each component has one purpose)
- ✅ DRY (Don't Repeat Yourself) - shared components reused
- ✅ Consistent naming conventions
- ✅ Proper folder organization
- ✅ Centralized exports (barrel pattern)
- ✅ Clear component hierarchy
- ✅ Separated concerns (UI, logic, data)

### **React Best Practices:**
- ✅ Functional components with hooks
- ✅ useState for local state
- ✅ useEffect for side effects
- ✅ useNavigate for routing
- ✅ Props validation (through usage)
- ✅ Proper event handling

### **Import Organization:**
- ✅ React imports first
- ✅ Third-party libraries second
- ✅ Internal components third
- ✅ Relative imports last

---

## 📚 Documentation

### **Component Documentation:**
Each component should have:
- Purpose comment at top
- Props documentation (if accepts props)
- Usage examples (in this README)

### **Inline Comments:**
- Complex logic explained
- Business rules documented
- API endpoints noted

---

## ✅ Checklist for Adding New Components

When adding a new staff/nurse component:

1. [ ] Create component file in `Staff/` folder
2. [ ] Use PascalCase naming: `ComponentName.jsx`
3. [ ] Add export to `index.js`
4. [ ] Update this README with component description
5. [ ] Create test file in `__tests__/`
6. [ ] Use barrel import in parent components
7. [ ] Follow existing code patterns
8. [ ] Add prop validation if needed

---

## 🎉 Summary

The Staff folder now follows industry best practices:

✅ **Well-Organized** - All related components together
✅ **Barrel Exports** - Clean import syntax
✅ **Clear Structure** - Easy to navigate
✅ **Documented** - README explains everything
✅ **Tested** - Comprehensive test coverage
✅ **Scalable** - Easy to add new features
✅ **Maintainable** - Clear dependencies and relationships

This organization makes the codebase more professional and easier to work with! 🚀

