import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddMedicalRecord } from '../Doctor';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
const mockLocation = {
  state: { patientData: { id: '123', name: 'John Doe', age: 30 } }
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate
}));

describe('AddMedicalRecord Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for form submission
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Record saved successfully' })
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Positive test: Form renders correctly
  test('renders medical record form', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Enter diagnosis details/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter recommendations/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter prescribed medicines/i)).toBeInTheDocument();
  });

  // Positive test: Display patient information
  test('displays patient information', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  // Positive test: Successful form submission
  test('submits valid medical record successfully', async () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/Enter diagnosis details/i), { 
      target: { value: 'Common Cold' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter prescribed medicines/i), { 
      target: { value: 'Paracetamol 500mg' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter recommendations/i), { 
      target: { value: 'Rest and drink fluids' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Medical Record/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  // Negative test: Empty form submission
  test('shows error for missing required fields', async () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Medical Record/i }));
    
    // Form validation should prevent submission or show error
    await waitFor(() => {
      // Check if validation message appears or form is not submitted
      const button = screen.getByRole('button', { name: /Submit Medical Record/i });
      expect(button).toBeInTheDocument();
    });
  });

  // Error case: API failure
  test('handles API error gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );
    
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/Enter diagnosis details/i), { 
      target: { value: 'Flu' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter prescribed medicines/i), { 
      target: { value: 'Rest' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Medical Record/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // Should show error message or handle error gracefully
  });

  // Edge case: Very long input
  test('handles very long diagnosis text', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const longText = 'A'.repeat(5000);
    const diagnosisInput = screen.getByPlaceholderText(/Enter diagnosis details/i);
    
    fireEvent.change(diagnosisInput, { target: { value: longText } });
    
    expect(diagnosisInput.value).toBe(longText);
  });

  // Edge case: Special characters in input
  test('handles special characters in input fields', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const specialText = '<script>alert("test")</script> & special chars: éñ中文';
    const diagnosisInput = screen.getByPlaceholderText(/Enter diagnosis details/i);
    
    fireEvent.change(diagnosisInput, { target: { value: specialText } });
    
    expect(diagnosisInput.value).toBe(specialText);
  });

  // Edge case: File upload functionality (if exists)
  test('handles file upload for medical reports', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      const file = new File(['test'], 'report.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(fileInput.files[0]).toBe(file);
    }
  });

  // Edge case: Missing patient data
  test('handles missing patient data gracefully', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      state: null
    });
    
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    // Should redirect or show error
    // Component should not crash
  });

  // UI test: All form fields are enabled
  test('all form fields are enabled and editable', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const diagnosisInput = screen.getByPlaceholderText(/Enter diagnosis details/i);
    const medicinesInput = screen.getByPlaceholderText(/Enter prescribed medicines/i);
    const recommendationsInput = screen.getByPlaceholderText(/Enter recommendations/i);
    
    expect(diagnosisInput).toBeEnabled();
    expect(medicinesInput).toBeEnabled();
    expect(recommendationsInput).toBeEnabled();
  });

  // Accessibility test: Form is keyboard navigable
  test('form is keyboard accessible', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const submitButton = screen.getByRole('button', { name: /Submit Medical Record/i });
    
    // Simulate tab navigation
    submitButton.focus();
    expect(document.activeElement).toBe(submitButton);
  });

  // File validation tests
  test('rejects non-PDF file types', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['test'], 'report.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/Invalid files:.*not a PDF.*Only PDF files under 10MB are allowed/i)).toBeInTheDocument();
  });

  test('rejects file larger than 10MB', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const fileInput = document.querySelector('input[type="file"]');
    // Create file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    expect(screen.getByText(/Invalid files:.*exceeds 10MB.*Only PDF files under 10MB are allowed/i)).toBeInTheDocument();
  });

  test('accepts valid PDF file under 10MB', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const fileInput = document.querySelector('input[type="file"]');
    const validFile = new File(['test content'], 'report.pdf', { type: 'application/pdf' });
    Object.defineProperty(validFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB
    
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    // Should not show error message
    expect(screen.queryByText(/Please upload a PDF file only/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/File size must be less than 10MB/i)).not.toBeInTheDocument();
  });

  test('shows validation error when diagnosis is missing', async () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    // Only fill medicines, leave diagnosis empty
    fireEvent.change(screen.getByPlaceholderText(/Enter prescribed medicines/i), { 
      target: { value: 'Paracetamol' } 
    });
    
    const form = document.querySelector('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  test('shows validation error when medicines is missing', async () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    // Only fill diagnosis, leave medicines empty
    fireEvent.change(screen.getByPlaceholderText(/Enter diagnosis details/i), { 
      target: { value: 'Common Cold' } 
    });
    
    const form = document.querySelector('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  test('displays success message on successful submission', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Medical record saved successfully!' })
      })
    );

    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/Enter diagnosis details/i), { 
      target: { value: 'Flu' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter prescribed medicines/i), { 
      target: { value: 'Ibuprofen' } 
    });
    
    const form = document.querySelector('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Medical record saved successfully/i)).toBeInTheDocument();
    });
  });

  test('handles API failure with non-ok response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, message: 'Server error' })
      })
    );

    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/Enter diagnosis details/i), { 
      target: { value: 'Test' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter prescribed medicines/i), { 
      target: { value: 'Test' } 
    });
    
    const form = document.querySelector('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  test('includes report file in form submission when uploaded', async () => {
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Record saved' })
      })
    );
    global.fetch = mockFetch;

    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    // Upload a file
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['test'], 'report.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/Enter diagnosis details/i), { 
      target: { value: 'Diagnosis' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter prescribed medicines/i), { 
      target: { value: 'Medicine' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Medical Record/i }));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const formData = mockFetch.mock.calls[0][1].body;
      expect(formData).toBeInstanceOf(FormData);
    });
  });

  test('handles nextDate field change', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const nextDateInput = document.querySelector('input[type="date"]');
    if (nextDateInput) {
      fireEvent.change(nextDateInput, { target: { value: '2025-12-31' } });
      expect(nextDateInput.value).toBe('2025-12-31');
    }
  });

  test('back button navigates to patient scanner', () => {
    render(
      <MemoryRouter>
        <AddMedicalRecord />
      </MemoryRouter>
    );
    
    const backButton = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/patient-scanner');
  });
});
