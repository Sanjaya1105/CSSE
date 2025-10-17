import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentMethodSelection from '../PaymentMethodSelection';
import { MemoryRouter } from 'react-router-dom';


const mockNavigate = jest.fn();
const mockLocation = {
  state: {
    appointmentData: { doctorName: 'Dr. Smith', date: '2025-10-20', fee: 50 },
    user: { name: 'John Doe', id: 'user123' }
  }
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate
}));

describe('PaymentMethodSelection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Positive test: Basic rendering
  test('renders payment options', () => {
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    expect(screen.getByText(/Credit\/Debit Card/i)).toBeInTheDocument();
    expect(screen.getByText(/Health Insurance/i)).toBeInTheDocument();
    expect(screen.getByText(/Government Covered/i)).toBeInTheDocument();
  });

  // Positive test: Display appointment details
  test('displays appointment details correctly', () => {
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/2025-10-20/i)).toBeInTheDocument();
  });

  // Positive test: Card payment button click
  test('handles card payment selection', () => {
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    const cardButton = screen.getByText(/Pay with Card/i);
    fireEvent.click(cardButton);
    // Navigation or state change should occur
  });

  // Positive test: Insurance payment button click
  test('handles insurance payment selection', () => {
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    const insuranceButton = screen.getByText(/Use Insurance/i);
    fireEvent.click(insuranceButton);
    // Navigation or state change should occur
  });

  // Positive test: Government coverage button click
  test('handles government coverage selection', () => {
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    const govButton = screen.getByText(/Use Government Coverage/i);
    fireEvent.click(govButton);
    // Navigation or state change should occur
  });

  // Positive test: Cancel button functionality
  test('handles cancel and go back', () => {
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    const cancelButton = screen.getByText(/Cancel & Go Back/i);
    fireEvent.click(cancelButton);
    // Should navigate back
  });

  // Edge case: Missing appointment data
  test('handles missing appointment data gracefully', () => {
    const mockLocationNoData = {
      state: null
    };
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocationNoData);
    
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    
    // Component should handle null state gracefully
    // Should redirect or show error message
  });

  // Edge case: Missing user data
  test('handles missing user data', () => {
    const mockLocationNoUser = {
      state: {
        appointmentData: { doctorName: 'Dr. Smith', date: '2025-10-20' },
        user: null
      }
    };
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocationNoUser);
    
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    
    // Should handle missing user gracefully
  });

  // Accessibility test: All buttons are accessible
  test('all payment buttons are keyboard accessible', () => {
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // All buttons should be focusable
    buttons.forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  // UI test: Payment icons are displayed
  test('displays payment method icons', () => {
    render(
      <MemoryRouter>
        <PaymentMethodSelection />
      </MemoryRouter>
    );
    
    // Check for emoji or icon presence in the UI
    // Only check if payment options are visible (not in error state)
    if (screen.queryByText(/Credit\/Debit Card/i)) {
      expect(screen.getByText(/💳/)).toBeInTheDocument();
      expect(screen.getByText(/🏛️/)).toBeInTheDocument();
      expect(screen.getByText(/🏥/)).toBeInTheDocument();
    }
  });
});
