import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GenerateQRForPatient } from '../QRGen';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock window.print
global.window.print = jest.fn();

describe('GenerateQRForPatient Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Positive Tests
  test('renders the component with all main elements', () => {
    render(
      <MemoryRouter>
        <GenerateQRForPatient />
      </MemoryRouter>
    );

    expect(screen.getByText(/Generate QR Code for Patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter patient name or ID card number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  test('allows user to enter search term', () => {
    render(
      <MemoryRouter>
        <GenerateQRForPatient />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Enter patient name or ID card number/i);
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });
    expect(searchInput.value).toBe('John Doe');
  });

  test('navigates to admin dashboard when Back button is clicked', () => {
    render(
      <MemoryRouter>
        <GenerateQRForPatient />
      </MemoryRouter>
    );

    const backButton = screen.getByText(/Back to Dashboard/i);
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
  });

  // Negative Tests
  test('shows error when searching with empty input', async () => {
    render(
      <MemoryRouter>
        <GenerateQRForPatient />
      </MemoryRouter>
    );

    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a search term/i)).toBeInTheDocument();
    });
  });

  test('shows error when no patients found', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, count: 0, data: [] }),
    });

    render(
      <MemoryRouter>
        <GenerateQRForPatient />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Enter patient name or ID card number/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(searchInput, { target: { value: 'NonExistentPatient' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/No patients found matching your search/i)).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <GenerateQRForPatient />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Enter patient name or ID card number/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(searchInput, { target: { value: 'John' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Error searching for patients/i)).toBeInTheDocument();
    });
  });

  // Edge Cases
  test('handles searching with whitespace-only input', async () => {
    render(
      <MemoryRouter>
        <GenerateQRForPatient />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Enter patient name or ID card number/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(searchInput, { target: { value: '   ' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a search term/i)).toBeInTheDocument();
    });
  });

  test('disables search button while loading', async () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <GenerateQRForPatient />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Enter patient name or ID card number/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(searchInput, { target: { value: 'John' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Searching.../i })).toBeDisabled();
    });
  });

});
