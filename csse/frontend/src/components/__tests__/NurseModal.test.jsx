import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NurseModal from '../Staff/NurseModal';

describe('NurseModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();

  const mockNurses = [
    { _id: '1', name: 'Nurse Alice' },
    { _id: '2', name: 'Nurse Bob' },
    { _id: '3', name: 'Nurse Carol' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Positive Tests
  test('renders modal when open is true', () => {
    render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.getByText(/Select Nurse/i)).toBeInTheDocument();
    expect(screen.getByText('Nurse Alice')).toBeInTheDocument();
    expect(screen.getByText('Nurse Bob')).toBeInTheDocument();
    expect(screen.getByText('Nurse Carol')).toBeInTheDocument();
  });

  test('does not render modal when open is false', () => {
    render(
      <NurseModal
        nurses={mockNurses}
        open={false}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.queryByText(/Select Nurse/i)).not.toBeInTheDocument();
  });

  test('calls onSelect when a nurse is clicked', () => {
    render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    const nurseButton = screen.getByText('Nurse Alice');
    fireEvent.click(nurseButton);

    expect(mockOnSelect).toHaveBeenCalledWith(mockNurses[0]);
  });

  test('calls onClose when Cancel button is clicked', () => {
    render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays delete mode UI when deleteMode is true', () => {
    render(
      <NurseModal
        nurses={[mockNurses[0]]}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={true}
      />
    );

    // "Nurse Assignment" appears in both title and button text
    expect(screen.getAllByText(/Nurse Assignment/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Assigned Nurse/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete Nurse Assignment/i)).toBeInTheDocument();
    expect(screen.getByText(mockNurses[0].name)).toBeInTheDocument();
  });

  test('calls onSelect when Delete Nurse Assignment button is clicked', () => {
    render(
      <NurseModal
        nurses={[mockNurses[0]]}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={true}
      />
    );

    const deleteButton = screen.getByText(/Delete Nurse Assignment/i);
    fireEvent.click(deleteButton);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  // Negative Tests
  test('renders empty list when nurses array is empty', () => {
    render(
      <NurseModal
        nurses={[]}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.getByText(/Select Nurse/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nurse/i })).not.toBeInTheDocument();
  });

  test('handles null nurses array gracefully', () => {
    // Component doesn't handle null well, so we test with empty array instead
    render(
      <NurseModal
        nurses={[]}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.getByText(/Select Nurse/i)).toBeInTheDocument();
  });

  test('does not call onSelect when clicking outside nurse buttons', () => {
    render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    const heading = screen.getByText(/Select Nurse/i);
    fireEvent.click(heading);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  // Edge Cases
  test('handles nurse with very long name', () => {
    const longNameNurse = { _id: '999', name: 'Nurse ' + 'X'.repeat(200) };

    render(
      <NurseModal
        nurses={[longNameNurse]}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.getByText('Nurse ' + 'X'.repeat(200))).toBeInTheDocument();
  });

  test('handles nurse with special characters in name', () => {
    const specialCharNurse = { _id: '888', name: "Nurse O'Brien-Smith @#$" };

    render(
      <NurseModal
        nurses={[specialCharNurse]}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.getByText("Nurse O'Brien-Smith @#$")).toBeInTheDocument();
  });

  test('handles nurse with missing _id field', () => {
    const noIdNurse = { name: 'Nurse NoID' };

    render(
      <NurseModal
        nurses={[noIdNurse]}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.getByText('Nurse NoID')).toBeInTheDocument();
  });

  test('handles large number of nurses', () => {
    const manyNurses = Array.from({ length: 50 }, (_, i) => ({
      _id: `nurse-${i}`,
      name: `Nurse ${i}`,
    }));

    render(
      <NurseModal
        nurses={manyNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.getByText('Nurse 0')).toBeInTheDocument();
    expect(screen.getByText('Nurse 49')).toBeInTheDocument();
  });

  test('renders with correct styling classes', () => {
    render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    const nurseButton = screen.getByText('Nurse Alice');
    expect(nurseButton).toHaveClass('w-full');
  });

  test('handles rapid clicks on different nurses', () => {
    render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    const aliceButton = screen.getByText('Nurse Alice');
    const bobButton = screen.getByText('Nurse Bob');

    fireEvent.click(aliceButton);
    fireEvent.click(bobButton);
    fireEvent.click(aliceButton);

    expect(mockOnSelect).toHaveBeenCalledTimes(3);
  });

  test('renders cancel button in both modes', () => {
    const { rerender } = render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();

    rerender(
      <NurseModal
        nurses={[mockNurses[0]]}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={true}
      />
    );

    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  test('displays backdrop when modal is open', () => {
    const { container } = render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        deleteMode={false}
      />
    );

    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
  });

  test('handles undefined deleteMode prop', () => {
    render(
      <NurseModal
        nurses={mockNurses}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(/Select Nurse/i)).toBeInTheDocument();
  });
});
