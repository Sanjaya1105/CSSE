import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StaffTable } from '../Staff';
import { MemoryRouter } from 'react-router-dom';

const mockStaff = [
  { id: 1, name: 'Alice', role: 'Nurse', date: '2025-10-21' },
  { id: 2, name: 'Bob', role: 'Doctor', date: '2025-10-22' }
];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('StaffTable Component', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStaff)
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders staff table', async () => {
    render(
      <MemoryRouter>
        <StaffTable />
      </MemoryRouter>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
    
    // Click the "Show Staff Table" button to display the table
    const showButton = await screen.findByText(/Show Staff Table/i);
    fireEvent.click(showButton);
    
    // Wait for the data to load and table to be visible
    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Bob/i)).toBeInTheDocument();
  });
});
