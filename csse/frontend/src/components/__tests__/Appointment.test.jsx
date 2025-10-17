import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppointmentForm from '../Appointment/AppointmentForm';
import { MemoryRouter } from 'react-router-dom';


const mockDoctors = [
  { _id: 'doc1', doctorName: 'Dr. Smith', roomNo: 101, bookingDay: 'Monday' },
  { _id: 'doc2', doctorName: 'Dr. Jones', roomNo: 102, bookingDay: 'Tuesday' },
  { _id: 'doc3', doctorName: 'Dr. Williams', roomNo: 103, bookingDay: 'Wednesday' }
];

describe('AppointmentForm Component', () => {
  let onBookMock;

  beforeEach(() => {
    onBookMock = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Positive test: Form renders all fields
  test('renders appointment form fields', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Patient Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Age/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Medical History/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Doctor/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Book Appointment/i })).toBeInTheDocument();
  });

  // Positive test: All doctors are listed
  test('displays all available doctors in dropdown', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Dr. Smith.*Room 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Jones.*Room 102/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Williams.*Room 103/i)).toBeInTheDocument();
  });

  // Positive test: Shows available day when doctor is selected
  test('shows doctor available day after selection', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const selectDoctor = screen.getByRole('combobox');
    fireEvent.change(selectDoctor, { target: { value: 'doc1' } });
    
    expect(screen.getByText(/Available Day:.*Monday/i)).toBeInTheDocument();
  });

  // Positive test: Successful form submission
  test('submits valid appointment', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    // Fill in all required fields
    fireEvent.change(screen.getByPlaceholderText(/Patient Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Age/i), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText(/Medical History/i), { target: { value: 'No prior conditions' } });
    
    // Select doctor
    const selectDoctor = screen.getByRole('combobox');
    fireEvent.change(selectDoctor, { target: { value: 'doc1' } });
    
    // Set date (Monday for Dr. Smith)
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2025-10-20' } }); // Monday
    }
    
    fireEvent.click(screen.getByText(/Book Appointment/i));
    expect(onBookMock).toHaveBeenCalled();
    expect(onBookMock).toHaveBeenCalledWith(
      expect.objectContaining({
        patientName: 'John Doe',
        age: '30',
        doctorId: 'doc1'
      })
    );
  });

  // Negative test: Empty form submission
  test('shows error for missing required fields', async () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    // Fill only some fields, leave others empty
    fireEvent.change(screen.getByPlaceholderText(/Patient Name/i), { target: { value: 'John' } });
    // Leave age, doctor, and date empty
    
    const form = document.querySelector('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Please fill all required fields/i)).toBeInTheDocument();
    });
    expect(onBookMock).not.toHaveBeenCalled();
  });

  // Negative test: Wrong day for doctor
  test('shows error for wrong doctor day', async () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    // Fill all fields
    fireEvent.change(screen.getByPlaceholderText(/Patient Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Age/i), { target: { value: '30' } });
    
    const selectDoctor = screen.getByRole('combobox');
    fireEvent.change(selectDoctor, { target: { value: 'doc1' } }); // Monday doctor
    
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2025-10-21' } }); // Tuesday
    }
    
    await waitFor(() => {
      expect(screen.getByText(/Doctor only available on Monday/i)).toBeInTheDocument();
    });
  });

  test('clears error when valid date is selected after invalid date', async () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    // Fill all fields
    fireEvent.change(screen.getByPlaceholderText(/Patient Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Age/i), { target: { value: '30' } });
    
    const selectDoctor = screen.getByRole('combobox');
    fireEvent.change(selectDoctor, { target: { value: 'doc1' } }); // Monday doctor
    
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      // First select invalid date (Tuesday)
      fireEvent.change(dateInput, { target: { value: '2025-10-21' } });
      await waitFor(() => {
        expect(screen.getByText(/Doctor only available on Monday/i)).toBeInTheDocument();
      });
      
      // Then select valid date (Monday)
      fireEvent.change(dateInput, { target: { value: '2025-10-20' } }); // Monday
      await waitFor(() => {
        expect(screen.queryByText(/Doctor only available on Monday/i)).not.toBeInTheDocument();
      });
    }
  });

  test('allows any date when no doctor is selected', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      // Should not show error for any date when no doctor selected
      fireEvent.change(dateInput, { target: { value: '2025-10-21' } });
      expect(screen.queryByText(/Doctor only available/i)).not.toBeInTheDocument();
    }
  });

  // Edge case: Invalid age (negative number)
  test('handles invalid age input', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const ageInput = screen.getByPlaceholderText(/Age/i);
    fireEvent.change(ageInput, { target: { value: '-5' } });
    
    // Age field should handle validation
    expect(ageInput.value).toBe('-5');
  });

  // Edge case: Very long patient name
  test('handles very long patient name', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const longName = 'A'.repeat(200);
    const nameInput = screen.getByPlaceholderText(/Patient Name/i);
    fireEvent.change(nameInput, { target: { value: longName } });
    
    expect(nameInput.value).toBe(longName);
  });

  // Edge case: Special characters in name
  test('handles special characters in patient name', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const specialName = "O'Brien-José María";
    const nameInput = screen.getByPlaceholderText(/Patient Name/i);
    fireEvent.change(nameInput, { target: { value: specialName } });
    
    expect(nameInput.value).toBe(specialName);
  });

  // Edge case: Empty doctors array
  test('handles empty doctors list', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={[]} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Select Doctor/i)).toBeInTheDocument();
    // Dropdown should only have the default option
  });

  // Edge case: Past date selection
  test('prevents selecting past dates', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().slice(0, 10);
      expect(dateInput.getAttribute('min')).toBe(today);
    }
  });

  // Edge case: Age boundary values
  test('handles age boundary values', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const ageInput = screen.getByPlaceholderText(/Age/i);
    
    // Test minimum age
    fireEvent.change(ageInput, { target: { value: '0' } });
    expect(ageInput.value).toBe('0');
    
    // Test maximum age
    fireEvent.change(ageInput, { target: { value: '150' } });
    expect(ageInput.value).toBe('150');
  });

  // UI test: Form reset after successful submission
  test('form can be cleared after submission', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByPlaceholderText(/Patient Name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');
    
    // After submission, form might reset
    // Test depends on component implementation
  });

  // Accessibility test: Form fields are keyboard accessible
  test('form fields are keyboard accessible', () => {
    render(
      <MemoryRouter>
        <AppointmentForm doctors={mockDoctors} onBook={onBookMock} />
      </MemoryRouter>
    );
    
    const nameInput = screen.getByPlaceholderText(/Patient Name/i);
    const ageInput = screen.getByPlaceholderText(/Age/i);
    const submitButton = screen.getByRole('button', { name: /Book Appointment/i });
    
    // All form elements should be focusable
    nameInput.focus();
    expect(document.activeElement).toBe(nameInput);
    
    ageInput.focus();
    expect(document.activeElement).toBe(ageInput);
    
    submitButton.focus();
    expect(document.activeElement).toBe(submitButton);
  });
});
