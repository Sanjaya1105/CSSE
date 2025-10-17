import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DoctorForm } from '../Doctor';

describe('DoctorForm Component', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn(e => e.preventDefault());
  const mockOnClose = jest.fn();
  const mockOnDoctorSelect = jest.fn();
  const approvedDoctors = [
    { _id: '1', registerNumber: 'DR001', name: 'Dr. Smith', specialization: 'Cardiology' },
    { _id: '2', registerNumber: 'DR002', name: 'Dr. Jane', specialization: 'Neurology' }
  ];
  const form = {
    doctorId: 'DR001',
    doctorName: 'Dr. Smith',
    roomNo: '101',
    specialization: 'Cardiology',
    bookingDay: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
  };

  it('renders all input fields', () => {
    render(
      <DoctorForm
        form={form}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        editId={null}
        approvedDoctors={approvedDoctors}
        onDoctorSelect={mockOnDoctorSelect}
      />
    );
    expect(screen.getByPlaceholderText(/Doctor Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Room No/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Start Time/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/End Time/i)).toBeInTheDocument();
  });

  it('calls onChange when input changes', () => {
    render(
      <DoctorForm
        form={form}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        editId={null}
        approvedDoctors={approvedDoctors}
        onDoctorSelect={mockOnDoctorSelect}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Doctor Name/i), { target: { value: 'Dr. Test' } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onSubmit when form is submitted', () => {
    const { baseElement } = render(
      <DoctorForm
        form={{
          doctorId: 'DR001',
          doctorName: 'Dr. Smith',
          specialization: 'Cardiology',
          roomNo: '101',
          bookingDay: 'Monday',
          startTime: '09:00',
          endTime: '17:00',
        }}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        approvedDoctors={approvedDoctors}
      />
    );
    // Use baseElement to select the form
    const formEl = baseElement.querySelector('form');
    fireEvent.submit(formEl);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <DoctorForm
        form={form}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        editId={null}
        approvedDoctors={approvedDoctors}
        onDoctorSelect={mockOnDoctorSelect}
      />
    );
    // The close button uses the title "Close" and text "×"
    fireEvent.click(screen.getByTitle('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows doctor selection dropdown if approvedDoctors are provided', () => {
    render(
      <DoctorForm
        form={form}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        editId={null}
        approvedDoctors={approvedDoctors}
        onDoctorSelect={mockOnDoctorSelect}
      />
    );
    // There are multiple comboboxes, check for at least one
    const combos = screen.getAllByRole('combobox');
    expect(combos.length).toBeGreaterThan(0);
    expect(combos[0]).toBeInTheDocument();
  });
});
