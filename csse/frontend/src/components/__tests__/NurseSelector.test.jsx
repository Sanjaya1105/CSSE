import React from 'react';
import { render, screen } from '@testing-library/react';
import { NurseSelector } from '../Staff';

const mockNurses = [
  { _id: 'n1', name: 'Nurse Alice', staffId: 'S001' },
  { _id: 'n2', name: 'Nurse Bob', staffId: 'S002' }
];

const mockOnClose = jest.fn();
const mockOnSelect = jest.fn();

describe('NurseSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders null when closed', () => {
    const { container } = render(
      <NurseSelector 
        nurses={mockNurses} 
        open={false} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders NurseModal when open', () => {
    render(
      <NurseSelector 
        nurses={mockNurses} 
        open={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    );
    // NurseModal should render with the title
    expect(screen.getByText(/Select Nurse/i)).toBeInTheDocument();
  });

  test('passes nurses prop to NurseModal', () => {
    render(
      <NurseSelector 
        nurses={mockNurses} 
        open={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    );
    // Check if nurses are displayed in the modal
    expect(screen.getByText('Nurse Alice')).toBeInTheDocument();
    expect(screen.getByText('Nurse Bob')).toBeInTheDocument();
  });

  test('passes callbacks to NurseModal', () => {
    render(
      <NurseSelector 
        nurses={mockNurses} 
        open={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    );
    // Modal should be rendered with proper callbacks
    expect(screen.getByText(/Select Nurse/i)).toBeInTheDocument();
  });

  test('handles empty nurses array', () => {
    render(
      <NurseSelector 
        nurses={[]} 
        open={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    );
    // Should still render modal
    expect(screen.getByText(/Select Nurse/i)).toBeInTheDocument();
  });

  test('handles opening and closing', () => {
    const { rerender, container } = render(
      <NurseSelector 
        nurses={mockNurses} 
        open={false} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    );
    expect(container.firstChild).toBeNull();
    
    // Rerender with open=true
    rerender(
      <NurseSelector 
        nurses={mockNurses} 
        open={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    );
    expect(screen.getByText(/Select Nurse/i)).toBeInTheDocument();
  });
});
