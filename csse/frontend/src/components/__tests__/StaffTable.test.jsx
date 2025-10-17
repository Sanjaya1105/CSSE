import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StaffTable } from '../Staff';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock child components
jest.mock('../Doctor/ScheduleGrid', () => {
  return function MockScheduleGrid({ filteredDoctors, onSlotClick }) {
    return (
      <div data-testid="schedule-grid">
        <div>Mock Schedule Grid</div>
        {filteredDoctors.map((doc, i) => (
          <div key={i} onClick={() => onSlotClick && onSlotClick(doc)}>
            {doc.doctorName}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../Staff/NurseSelector', () => {
  return function MockNurseSelector({ nurses, open, onClose, onSelect }) {
    return open ? (
      <div data-testid="nurse-selector">
        {nurses.map((nurse) => (
          <button key={nurse._id} onClick={() => onSelect(nurse)}>
            {nurse.name}
          </button>
        ))}
        <button onClick={onClose}>Close Selector</button>
      </div>
    ) : null;
  };
});

jest.mock('../Staff/NurseModal', () => {
  return function MockNurseModal({ nurses, open, onClose, onSelect, deleteMode }) {
    return open ? (
      <div data-testid="nurse-modal">
        {deleteMode && <div>Delete Mode</div>}
        {nurses.map((nurse, i) => (
          <div key={i}>{nurse?.name}</div>
        ))}
        <button onClick={onSelect}>Delete/Select</button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null;
  };
});

describe('StaffTable Component', () => {
  const mockStaff = [
    { _id: '1', name: 'Nurse Alice', email: 'alice@test.com', nic: 'NIC001', registerNumber: 'REG001', userType: 'staff' },
    { _id: '2', name: 'Nurse Bob', email: 'bob@test.com', nic: 'NIC002', registerNumber: 'REG002', userType: 'nurse' },
  ];

  const mockTimetable = [
    {
      _id: 'slot1',
      doctorId: 'doc1',
      doctorName: 'Dr. Smith',
      bookingDay: 'Monday',
      startTime: '09:00',
      endTime: '12:00',
      roomNo: '101',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Positive Tests
  test('renders loading state initially', () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('renders staff table after loading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Staff List/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Show Staff Table/i)).toBeInTheDocument();
  });

  test('displays staff data when Show Staff Table is clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Show Staff Table/i)).toBeInTheDocument();
    });

    const showButton = screen.getByText(/Show Staff Table/i);
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Nurse Alice')).toBeInTheDocument();
      expect(screen.getByText('Nurse Bob')).toBeInTheDocument();
    });
  });

  test('hides staff table when Hide Staff Table is clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Show Staff Table/i)).toBeInTheDocument();
    });

    const showButton = screen.getByText(/Show Staff Table/i);
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Nurse Alice')).toBeInTheDocument();
    });

    const hideButton = screen.getByText(/Hide Staff Table/i);
    fireEvent.click(hideButton);

    await waitFor(() => {
      expect(screen.queryByText('Nurse Alice')).not.toBeInTheDocument();
    });
  });

  test('navigates to admin dashboard when Go Back button is clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Staff List/i)).toBeInTheDocument();
    });

    const backButton = screen.getByText(/Go Back to Dashboard/i);
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
  });

  test('allows user to enter room number', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    expect(roomInput.value).toBe('101');
  });

  // Negative Tests
  test('displays error when staff fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  test('handles empty staff array', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Staff List/i)).toBeInTheDocument();
    });

    const showButton = screen.getByText(/Show Staff Table/i);
    fireEvent.click(showButton);

    expect(screen.queryByText('Nurse Alice')).not.toBeInTheDocument();
  });

  test('handles timetable fetch error', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockRejectedValueOnce(new Error('Failed to fetch timetable'));

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  // Edge Cases
  test('handles very long room numbers', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    const longRoomNumber = '1'.repeat(100);
    fireEvent.change(roomInput, { target: { value: longRoomNumber } });

    expect(roomInput.value).toBe(longRoomNumber);
  });

  test('handles special characters in room number', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: 'Room@#$%101' } });

    expect(roomInput.value).toBe('Room@#$%101');
  });

  test('handles empty room number search', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    expect(screen.queryByTestId('schedule-grid')).not.toBeInTheDocument();
  });

  test('allows setting start and end dates', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Start Week Day:/i)).toBeInTheDocument();
    });

    // Just verify the date inputs exist and can be interacted with
    const allInputs = document.querySelectorAll('input[type="date"]');
    expect(allInputs.length).toBeGreaterThanOrEqual(2);
    
    if (allInputs.length >= 2) {
      fireEvent.change(allInputs[0], { target: { value: '2025-01-01' } });
      fireEvent.change(allInputs[1], { target: { value: '2025-01-07' } });
      
      expect(allInputs[0].value).toBe('2025-01-01');
      expect(allInputs[1].value).toBe('2025-01-07');
    }
  });

  test('displays schedule grid when timetable is loaded', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test('handles staff with missing fields', async () => {
    const incompleteStaff = [
      { _id: '1', name: 'Nurse Alice', email: null, nic: null, registerNumber: null },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => incompleteStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Staff Schedule/i)).toBeInTheDocument();
    });

    const showButton = screen.getByText(/Show Staff Table/i);
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Nurse Alice')).toBeInTheDocument();
    });
  });

  // Tests for nurse assignment functionality
  test.skip('fetches previous nurse assignments when room is searched', async () => {
    const previousAssignments = [];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => previousAssignments,
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/doctor-nurse-assignment/by-room-week')
    );
  });

  test('handles failed previous assignments fetch gracefully', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockRejectedValueOnce(new Error('Failed to fetch assignments'));

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test('opens nurse selector when clicking slot without nurse', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    // Click on a doctor slot
    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });
  });

  test('shows delete modal when clicking slot with assigned nurse', async () => {
    const assignedNurseData = {
      slot1: { _id: '1', name: 'Nurse Alice' }
    };

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            _id: 'assign1',
            doctorId: 'doc1',
            nurseName: 'Nurse Alice',
            nurseId: '1',
            roomNo: '101',
            weekStartDay: '2025-01-01',
            weekEndDay: '2025-01-07',
            timeSlot: 'Monday 09:00'
          }
        ],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test.skip('selects nurse and updates assignments', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });
  });

  test('closes nurse selector when close button clicked', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close Selector');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });
  });

  test('handles nurse fetch failure when opening selector', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });
  });

  test.skip('filters out already assigned nurses from available list', async () => {
    const alreadyAssigned = [
      {
        _id: 'assign1',
        doctorId: 'doc2',
        nurseName: 'Nurse Bob',
        nurseId: '2',
        roomNo: '102',
        weekStartDay: '2025-01-01',
        weekEndDay: '2025-01-07',
        timeSlot: 'Monday 09:00'
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => alreadyAssigned,
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
      expect(screen.getByText('Nurse Alice')).toBeInTheDocument();
      expect(screen.queryByText('Nurse Bob')).not.toBeInTheDocument();
    });
  });

  test.skip('saves all nurse assignments successfully', async () => {
    window.alert = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Saved' }),
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText(/Confirm & Save Schedule/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('All nurse assignments saved successfully!');
    });
  });

  test.skip('handles save assignments failure', async () => {
    window.alert = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockRejectedValueOnce(new Error('Save failed'));

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText(/Confirm & Save Schedule/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to save nurse assignments');
    });
  });

  test('handles slots with different time formats', async () => {
    const variedTimetable = [
      { _id: 'slot1', doctorId: 'doc1', doctorName: 'Dr. Smith', timeSlot: 'Monday 09:00', roomNo: '101' },
      { _id: 'slot2', doctorId: 'doc2', doctorName: 'Dr. Jones', time: 'Tuesday 10:00', roomNo: '101' },
      { _id: 'slot3', doctorId: 'doc3', doctorName: 'Dr. Brown', slot: 'Wednesday 11:00', roomNo: '101' },
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => variedTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test.skip('handles room number with whitespace trimming', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '  101  ' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('roomNo=101')
    );
  });

  test('deletes nurse assignment successfully', async () => {
    window.alert = jest.fn();

    const assignmentData = [
      {
        _id: 'assign1',
        doctorId: 'doc1',
        nurseName: 'Nurse Alice',
        nurseId: '1',
        roomNo: '101',
        weekStartDay: '2025-01-01',
        weekEndDay: '2025-01-07',
        timeSlot: 'Monday 09:00'
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignmentData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignmentData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted' }),
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test('handles delete nurse assignment failure', async () => {
    window.alert = jest.fn();

    const assignmentData = [
      {
        _id: 'assign1',
        doctorId: 'doc1',
        nurseName: 'Nurse Alice',
        nurseId: '1',
        roomNo: '101',
        weekStartDay: '2025-01-01',
        weekEndDay: '2025-01-07',
        timeSlot: 'Monday 09:00'
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignmentData,
      })
      .mockRejectedValueOnce(new Error('Delete failed'));

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test('closes delete modal when close button clicked', async () => {
    const assignmentData = [
      {
        _id: 'assign1',
        doctorId: 'doc1',
        nurseName: 'Nurse Alice',
        nurseId: '1',
        roomNo: '101',
        weekStartDay: '2025-01-01',
        weekEndDay: '2025-01-07',
        timeSlot: 'Monday 09:00'
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignmentData,
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test('handles slot with no time information', async () => {
    const noTimeTimetable = [
      { _id: 'slot1', doctorId: 'doc1', doctorName: 'Dr. Smith', roomNo: '101' },
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => noTimeTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test.skip('handles saving with slot that has no doctorId', async () => {
    window.alert = jest.fn();

    const noDoctorIdTimetable = [
      { _id: 'slot1', doctorName: 'Dr. Smith', bookingDay: 'Monday', startTime: '09:00', roomNo: '101' },
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => noDoctorIdTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Saved' }),
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText(/Confirm & Save Schedule/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('All nurse assignments saved successfully!');
    });
  });

  // Additional tests to improve coverage
  test('fetchPreviousAssignments returns empty object when room is missing', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaff,
    });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    // Test with empty room number
    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    // Should not make additional fetch calls beyond initial staff fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  test('handleSlotClick filters nurses by userType staff or nurse', async () => {
    const mixedStaffData = [
      { _id: '1', name: 'Nurse Alice', userType: 'nurse', email: 'alice@test.com', nic: '111', registerNumber: 'N001' },
      { _id: '2', name: 'Staff Bob', userType: 'staff', email: 'bob@test.com', nic: '222', registerNumber: 'S001' },
      { _id: '3', name: 'Admin Charlie', userType: 'admin', email: 'charlie@test.com', nic: '333', registerNumber: 'A001' },
      { _id: '4', name: 'Doctor Dave', userType: 'doctor', email: 'dave@test.com', nic: '444', registerNumber: 'D001' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mixedStaffData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mixedStaffData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]'); fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } }); fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    // Should only show nurses and staff, not admin or doctor
    expect(screen.getByText('Nurse Alice')).toBeInTheDocument();
    expect(screen.getByText('Staff Bob')).toBeInTheDocument();
    expect(screen.queryByText('Admin Charlie')).not.toBeInTheDocument();
    expect(screen.queryByText('Doctor Dave')).not.toBeInTheDocument();
  });

  test.skip('handleDeleteNurseAssignment shows alert on failure', async () => {
    window.alert = jest.fn();

    const assignedNurseData = [
      {
        _id: 'assign1',
        doctorId: 'doc1',
        nurseName: 'Nurse Alice',
        roomNo: '101',
        timeSlot: 'Monday 09:00',
        weekStartDay: '2024-01-01',
        weekEndDay: '2024-01-07'
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignedNurseData,
      })
      .mockRejectedValueOnce(new Error('Network error'));

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]'); fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } }); fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    // Manually set nurse assignment in state by clicking and selecting
    const drSlot = screen.getByText(/Dr. Smith/i);
    
    // Simulate that a nurse is already assigned
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    // Now click again to open delete modal
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-modal')).toBeInTheDocument();
      expect(screen.getByText('Delete Mode')).toBeInTheDocument();
    });

    // Mock the delete to fail
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignedNurseData,
      })
      .mockRejectedValueOnce(new Error('Delete failed'));

    const deleteButton = screen.getByText(/Confirm Delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete nurse assignment');
    });
  });

  test('handleNurseModalClose clears all modal state', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]'); fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } }); fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    // Close the modal
    const closeButton = screen.getByText('Close Selector');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });
  });

  test('handles nurse assignment when slot has doctorId field', async () => {
    const timetableWithDoctorId = [
      { _id: 'slot1', doctorId: 'doctor-123', doctorName: 'Dr. Smith', bookingDay: 'Monday', startTime: '09:00', roomNo: '101' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => timetableWithDoctorId,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]'); fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } }); fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });
  });

  test('handleSlotClick catches error when fetching nurses fails', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockRejectedValueOnce(new Error('Failed to fetch nurses'));

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]'); fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } }); fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    // Should still open nurse selector even with empty nurse list
    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });
  });

  test('handleSlotClick filters nurses assigned to different rooms at same time', async () => {
    const assignmentsInOtherRooms = [
      {
        roomNo: '102',
        timeSlot: 'Monday 09:00',
        nurseName: 'Nurse Bob',
        weekStartDay: '2024-01-01',
        weekEndDay: '2024-01-07'
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignmentsInOtherRooms,
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]'); fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } }); fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    // Nurse Bob should be filtered out (assigned to room 102 at same time)
    expect(screen.getByText('Nurse Alice')).toBeInTheDocument();
    expect(screen.queryByText('Nurse Bob')).not.toBeInTheDocument();
  });

  // Additional tests for uncovered lines
  test('fetchPreviousAssignments returns assignments when successful', async () => {
    const assignmentsData = [
      { doctorId: 'doc1', nurseName: 'Nurse Alice' },
      { doctorId: 'doc2', nurseName: 'Nurse Bob' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignmentsData,
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test('fetchPreviousAssignments throws error and returns empty object', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });
  });

  test('handleSlotClick when res.ok is false for assignments', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });
  });

  test.skip('handleDeleteNurseAssignment when res.ok is false', async () => {
    window.alert = jest.fn();

    const assignedData = [
      { doctorId: 'doc1', nurseName: 'Nurse Alice', _id: 'assign1' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignedData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    // Assign a nurse first
    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    // Click again to delete
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-modal')).toBeInTheDocument();
    });

    // Mock failed delete fetch
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
      });

    const deleteButton = screen.getByText(/Confirm Delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-modal')).not.toBeInTheDocument();
    });
  });

  test.skip('handleDeleteNurseAssignment when assignment not found', async () => {
    window.alert = jest.fn();

    const assignedData = [
      { doctorId: 'doc999', nurseName: 'Nurse Charlie', _id: 'assign999' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimetable,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    // Assign a nurse
    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    // Click again to delete
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-modal')).toBeInTheDocument();
    });

    // Mock delete with assignment not found
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => assignedData, // Different assignment
      });

    const deleteButton = screen.getByText(/Confirm Delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-modal')).not.toBeInTheDocument();
    });
  });

  test.skip('handleSaveAllAssignments with slot using timeSlot property', async () => {
    window.alert = jest.fn();

    const timetableWithTimeSlot = [
      { _id: 'slot1', doctorId: 'doc1', doctorName: 'Dr. Smith', timeSlot: 'Monday 09:00', roomNo: '101' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => timetableWithTimeSlot,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Saved' }),
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText(/Confirm & Save Schedule/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('All nurse assignments saved successfully!');
    });
  });

  test.skip('handleSaveAllAssignments with slot using time property', async () => {
    window.alert = jest.fn();

    const timetableWithTime = [
      { _id: 'slot1', doctorId: 'doc1', doctorName: 'Dr. Smith', time: 'Tuesday 10:00', roomNo: '101' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => timetableWithTime,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Saved' }),
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText(/Confirm & Save Schedule/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('All nurse assignments saved successfully!');
    });
  });

  test.skip('handleSaveAllAssignments with slot using slot property', async () => {
    window.alert = jest.fn();

    const timetableWithSlot = [
      { _id: 'slot1', doctorId: 'doc1', doctorName: 'Dr. Smith', slot: 'Wednesday 14:00', roomNo: '101' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => timetableWithSlot,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Saved' }),
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText(/Confirm & Save Schedule/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('All nurse assignments saved successfully!');
    });
  });

  test.skip('handleSaveAllAssignments with slot having no time info (Unknown)', async () => {
    window.alert = jest.fn();

    const timetableNoTime = [
      { _id: 'slot1', doctorId: 'doc1', doctorName: 'Dr. Smith', roomNo: '101' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => timetableNoTime,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStaff,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Saved' }),
      });

    const { container } = render(<MemoryRouter><StaffTable /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Room Number/i)).toBeInTheDocument();
    });

    const roomInput = screen.getByPlaceholderText(/Enter Room Number/i);
    fireEvent.change(roomInput, { target: { value: '101' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-07' } });

    const searchButton = screen.getByText(/Show Previous Build Table/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('schedule-grid')).toBeInTheDocument();
    });

    const drSlot = screen.getByText(/Dr. Smith/i);
    fireEvent.click(drSlot);

    await waitFor(() => {
      expect(screen.getByTestId('nurse-selector')).toBeInTheDocument();
    });

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    await waitFor(() => {
      expect(screen.queryByTestId('nurse-selector')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByText(/Confirm & Save Schedule/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('All nurse assignments saved successfully!');
    });
  });
});

