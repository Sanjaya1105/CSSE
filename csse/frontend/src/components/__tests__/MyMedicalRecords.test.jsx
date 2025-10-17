import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MyMedicalRecords } from '../Patient';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockMedicalRecords = [
  {
    _id: 'rec1',
    diagnosis: 'Common Cold',
    medicines: 'Paracetamol 500mg',
    recommendation: 'Rest and drink fluids',
    age: 30,
    createdAt: '2025-10-15T10:00:00Z',
    reportUrl: '/uploads/report1.pdf'
  },
  {
    _id: 'rec2',
    diagnosis: 'Flu',
    medicines: 'Ibuprofen',
    recommendation: 'Take vitamin C',
    age: 30,
    createdAt: '2025-10-10T14:30:00Z'
  }
];

describe('MyMedicalRecords Component', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userType') return 'patient';
      if (key === 'user') return JSON.stringify({ _id: 'u1', name: 'John Doe', age: 30, idCardNumber: 'ID123' });
      return null;
    });

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] })
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders medical records list', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/My Medical Records/i)).toBeInTheDocument();
    });
  });
  
  test('shows message when no records', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/No medical records found/i)).toBeInTheDocument();
    });
  });

  test('redirects to login if no user data in localStorage', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    
    render(
      <MemoryRouter>
        <MyMedicalRecords />
      </MemoryRouter>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('redirects to login if userType is not patient', () => {
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userType') return 'doctor';
      if (key === 'user') return JSON.stringify({ _id: 'u1', name: 'Dr. Smith' });
      return null;
    });
    
    render(
      <MemoryRouter>
        <MyMedicalRecords />
      </MemoryRouter>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('displays loading state while fetching records', () => {
    act(() => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    expect(screen.getByText(/Loading medical records/i)).toBeInTheDocument();
  });

  test('displays patient information', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/30 years/i)).toBeInTheDocument();
      expect(screen.getByText(/ID123/i)).toBeInTheDocument();
    });
  });

  test('displays medical records when available', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockMedicalRecords })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Record #2/i)).toBeInTheDocument();
      expect(screen.getByText(/Record #1/i)).toBeInTheDocument();
    });
  });

  test('expands record when clicked', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockMedicalRecords })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Record #2/i)).toBeInTheDocument();
    });
    const firstRecord = screen.getByText(/Record #2/i).closest('div').closest('div');
    await act(async () => {
      fireEvent.click(firstRecord);
    });
    await waitFor(() => {
      expect(screen.getByText('Common Cold')).toBeInTheDocument();
      expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument();
      expect(screen.getByText('Rest and drink fluids')).toBeInTheDocument();
    });
  });

  test('collapses record when clicked again', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockMedicalRecords })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Record #2/i)).toBeInTheDocument();
    });
    const firstRecord = screen.getByText(/Record #2/i).closest('div').closest('div');
    // Expand
    await act(async () => {
      fireEvent.click(firstRecord);
    });
    await waitFor(() => {
      expect(screen.getByText('Common Cold')).toBeInTheDocument();
    });
    // Collapse
    await act(async () => {
      fireEvent.click(firstRecord);
    });
    await waitFor(() => {
      expect(screen.queryByText('Common Cold')).not.toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Error loading medical records/i)).toBeInTheDocument();
    });
  });

  test('handles API failure with success false', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to load medical records/i)).toBeInTheDocument();
    });
  });

  test('back button navigates to patient dashboard', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
    });
    const backButton = screen.getByText(/Back to Dashboard/i);
    await act(async () => {
      fireEvent.click(backButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/patient-dashboard');
  });

  test('displays formatted date for records', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockMedicalRecords })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/October 15, 2025/i)).toBeInTheDocument();
    });
  });

  test('displays download button when reportUrl exists', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockMedicalRecords })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Record #2/i)).toBeInTheDocument();
    });
    // Expand first record which has reportUrl
    const firstRecord = screen.getByText(/Record #2/i).closest('div').closest('div');
    await act(async () => {
      fireEvent.click(firstRecord);
    });
    await waitFor(() => {
      expect(screen.getByText(/Download Report PDF/i)).toBeInTheDocument();
    });
  });

  test('does not display download button when reportUrl is missing', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [mockMedicalRecords[1]] })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Record #1/i)).toBeInTheDocument();
    });
    // Expand record
    const record = screen.getByText(/Record #1/i).closest('div').closest('div');
    await act(async () => {
      fireEvent.click(record);
    });
    await waitFor(() => {
      expect(screen.getByText('Flu')).toBeInTheDocument();
      expect(screen.queryByText(/Download Report PDF/i)).not.toBeInTheDocument();
    });
  });

  test('displays record age badge', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockMedicalRecords })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getAllByText(/Age: 30/i).length).toBeGreaterThan(0);
    });
  });

  test('displays tip message when records are available', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockMedicalRecords })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <MyMedicalRecords />
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Click on any record to expand and view full details/i)).toBeInTheDocument();
    });
  });
});
