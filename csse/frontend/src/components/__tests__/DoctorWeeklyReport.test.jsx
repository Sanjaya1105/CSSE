  it('shows no results for non-existent doctorId (edge case)', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('doctors')) {
        return Promise.resolve({ json: () => Promise.resolve([
          { doctorId: 'DR001', doctorName: 'Dr. Smith', roomNo: '101' },
          { doctorId: 'DR002', doctorName: 'Dr. Jane', roomNo: '102' }
        ]) });
      }
      if (url.includes('appointments')) {
        return Promise.resolve({ json: () => Promise.resolve([
          { doctorRegisterNumber: 'DR001', date: '2025-10-01' },
          { doctorRegisterNumber: 'DR001', date: '2025-10-02' },
          { doctorRegisterNumber: 'DR002', date: '2025-10-03' }
        ]) });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });
    render(<DoctorWeeklyReport />);
    await screen.findByText('Dr. Smith');
    const input = screen.getByPlaceholderText(/Enter Doctor ID/i);
    fireEvent.change(input, { target: { value: 'DR999' } });
    fireEvent.click(screen.getByText(/Filter/i));
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Dr. Jane')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles fetch error gracefully (error case)', async () => {
    fetch.mockImplementation(() => Promise.reject('API error'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<DoctorWeeklyReport />);
    expect(screen.getByText(/Loading report/i)).toBeInTheDocument();
    // Wait for the component to finish attempting fetch
    await waitFor(() => expect(screen.getByText(/Doctor Weekly Appointment Report/i)).toBeInTheDocument());
    spy.mockRestore();
  });

  it('shows alert on PDF generation failure (error case)', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('doctors')) {
        return Promise.resolve({ json: () => Promise.resolve([
          { doctorId: 'DR001', doctorName: 'Dr. Smith', roomNo: '101' },
          { doctorId: 'DR002', doctorName: 'Dr. Jane', roomNo: '102' }
        ]) });
      }
      if (url.includes('appointments')) {
        return Promise.resolve({ json: () => Promise.resolve([
          { doctorRegisterNumber: 'DR001', date: '2025-10-01' },
          { doctorRegisterNumber: 'DR001', date: '2025-10-02' },
          { doctorRegisterNumber: 'DR002', date: '2025-10-03' }
        ]) });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });
    render(<DoctorWeeklyReport />);
    await screen.findByText('Dr. Smith');
    // Mock autoTable to throw error
    const autoTable = require('jspdf-autotable');
    autoTable.mockImplementationOnce(() => { throw new Error('PDF error'); });
    window.alert = jest.fn();
    fireEvent.click(screen.getByText(/Download PDF/i));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('PDF generation failed'));
  });
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DoctorWeeklyReport } from '../Doctor';

// Mock jsPDF and autoTable
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    save: jest.fn()
  }));
});
jest.mock('jspdf-autotable', () => jest.fn());

global.fetch = jest.fn();

describe('DoctorWeeklyReport', () => {
  const doctors = [
    { doctorId: 'DR001', doctorName: 'Dr. Smith', roomNo: '101' },
    { doctorId: 'DR002', doctorName: 'Dr. Jane', roomNo: '102' }
  ];
  const appointments = [
    { doctorRegisterNumber: 'DR001', date: '2025-10-01' },
    { doctorRegisterNumber: 'DR001', date: '2025-10-02' },
    { doctorRegisterNumber: 'DR002', date: '2025-10-03' }
  ];

  beforeEach(() => {
    fetch.mockImplementation((url) => {
      if (url.includes('doctors')) {
        return Promise.resolve({ json: () => Promise.resolve(doctors) });
      }
      if (url.includes('appointments')) {
        return Promise.resolve({ json: () => Promise.resolve(appointments) });
      }
      return Promise.reject('Unknown URL');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading initially and then table', async () => {
    render(<DoctorWeeklyReport />);
    expect(screen.getByText(/Loading report/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Doctor Weekly Appointment Report/i)).toBeInTheDocument());
    expect(await screen.findByText('Dr. Smith')).toBeInTheDocument();
    expect(await screen.findByText('Dr. Jane')).toBeInTheDocument();
  });

  it('filters by doctorId', async () => {
    render(<DoctorWeeklyReport />);
    await waitFor(() => expect(screen.getByText('Dr. Smith')).toBeInTheDocument());
    const input = screen.getByPlaceholderText(/Enter Doctor ID/i);
    fireEvent.change(input, { target: { value: 'DR002' } });
    fireEvent.click(screen.getByText(/Filter/i));
    expect(screen.getByText('Dr. Jane')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
  });

  it('resets filter when empty doctorId is entered', async () => {
    render(<DoctorWeeklyReport />);
    await waitFor(() => expect(screen.getByText('Dr. Smith')).toBeInTheDocument());
    const input = screen.getByPlaceholderText(/Enter Doctor ID/i);
    
    // First filter to specific doctor
    fireEvent.change(input, { target: { value: 'DR002' } });
    fireEvent.click(screen.getByText(/Filter/i));
    expect(screen.getByText('Dr. Jane')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
    
    // Then clear filter
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByText(/Filter/i));
    
    // Should show all doctors again
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jane')).toBeInTheDocument();
    });
  });

  it('resets filter with whitespace-only input', async () => {
    render(<DoctorWeeklyReport />);
    await waitFor(() => expect(screen.getByText('Dr. Smith')).toBeInTheDocument());
    const input = screen.getByPlaceholderText(/Enter Doctor ID/i);
    
    // First filter to specific doctor
    fireEvent.change(input, { target: { value: 'DR002' } });
    fireEvent.click(screen.getByText(/Filter/i));
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
    
    // Then clear with whitespace
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText(/Filter/i));
    
    // Should show all doctors again
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jane')).toBeInTheDocument();
    });
  });

  it('calls PDF download when button clicked', async () => {
    const jsPDF = require('jspdf');
    render(<DoctorWeeklyReport />);
    await waitFor(() => expect(screen.getByText('Dr. Smith')).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Download PDF/i));
    expect(jsPDF).toHaveBeenCalled();
  });
});
