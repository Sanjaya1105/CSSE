import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleGrid } from '../Doctor';

describe('ScheduleGrid Component', () => {
  const mockOnSlotClick = jest.fn();

  const mockDoctors = [
    {
      _id: '1',
      doctorName: 'Dr. Smith',
      bookingDay: 'Monday',
      startTime: '09:00',
      endTime: '12:00',
      roomNo: '101',
    },
    {
      _id: '2',
      doctorName: 'Dr. Johnson',
      bookingDay: 'Tuesday',
      startTime: '14:00',
      endTime: '17:00',
      roomNo: '102',
      nurse: { name: 'Nurse Alice' },
    },
    {
      _id: '3',
      doctorName: 'Dr. Williams',
      bookingDay: 'Wednesday',
      startTime: '08:00',
      endTime: '11:00',
      roomNo: '103',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Positive Tests
  test('renders the schedule grid with all days of the week', () => {
    render(<ScheduleGrid filteredDoctors={[]} onSlotClick={mockOnSlotClick} />);

    expect(screen.getByText(/Weekly Doctor Schedule/i)).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
    expect(screen.getByText('Saturday')).toBeInTheDocument();
    expect(screen.getByText('Sunday')).toBeInTheDocument();
  });

  test('renders time slots from 08:00 to 19:00', () => {
    render(<ScheduleGrid filteredDoctors={[]} onSlotClick={mockOnSlotClick} />);

    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();
    expect(screen.getByText('19:00')).toBeInTheDocument();
  });

  test('displays doctor information in correct time slot', () => {
    render(<ScheduleGrid filteredDoctors={mockDoctors} onSlotClick={mockOnSlotClick} />);

    expect(screen.getAllByText('Dr. Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Room: 101/).length).toBeGreaterThan(0);
  });

  test('displays nurse information when nurse is assigned', () => {
    render(<ScheduleGrid filteredDoctors={mockDoctors} onSlotClick={mockOnSlotClick} />);

    expect(screen.getAllByText('Dr. Johnson').length).toBeGreaterThan(0);
    // Nurse Alice appears in multiple time slots (14:00, 15:00, 16:00)
    expect(screen.getAllByText(/Nurse: Nurse Alice/).length).toBeGreaterThan(0);
  });

  test('calls onSlotClick when a doctor slot is clicked', () => {
    render(<ScheduleGrid filteredDoctors={mockDoctors} onSlotClick={mockOnSlotClick} />);

    const doctorSlot = screen.getAllByText('Dr. Smith')[0].closest('td');
    fireEvent.click(doctorSlot);

    expect(mockOnSlotClick).toHaveBeenCalledWith(mockDoctors[0]);
  });

  test('applies green background when nurse is assigned', () => {
    render(<ScheduleGrid filteredDoctors={mockDoctors} onSlotClick={mockOnSlotClick} />);

    const slotWithNurse = screen.getAllByText('Dr. Johnson')[0].closest('td');
    expect(slotWithNurse).toHaveClass('bg-green-500');
  });

  test('applies red background when no nurse is assigned', () => {
    render(<ScheduleGrid filteredDoctors={mockDoctors} onSlotClick={mockOnSlotClick} />);

    const slotWithoutNurse = screen.getAllByText('Dr. Smith')[0].closest('td');
    expect(slotWithoutNurse).toHaveClass('bg-red-500');
  });

  // Negative Tests
  test('renders empty grid when no doctors provided', () => {
    render(<ScheduleGrid filteredDoctors={[]} onSlotClick={mockOnSlotClick} />);

    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
    expect(screen.getByText(/Weekly Doctor Schedule/i)).toBeInTheDocument();
  });

  test('does not call onSlotClick on empty cells', () => {
    render(<ScheduleGrid filteredDoctors={[]} onSlotClick={mockOnSlotClick} />);

    const emptyCells = screen.getAllByRole('cell');
    const emptyCell = emptyCells.find(cell => !cell.textContent || cell.textContent.includes('08:00'));
    
    if (emptyCell && !emptyCell.textContent.includes('Dr.')) {
      fireEvent.click(emptyCell);
      expect(mockOnSlotClick).not.toHaveBeenCalled();
    }
  });

  test('handles missing onSlotClick prop gracefully', () => {
    render(<ScheduleGrid filteredDoctors={mockDoctors} />);

    const doctorSlot = screen.getAllByText('Dr. Smith')[0].closest('td');
    expect(() => fireEvent.click(doctorSlot)).not.toThrow();
  });

  // Edge Cases
  test('handles doctor with multiple hour slots correctly', () => {
    const longSlotDoctor = {
      _id: '4',
      doctorName: 'Dr. LongShift',
      bookingDay: 'Thursday',
      startTime: '09:00',
      endTime: '15:00',
      roomNo: '104',
    };

    render(<ScheduleGrid filteredDoctors={[longSlotDoctor]} onSlotClick={mockOnSlotClick} />);

    const doctorSlots = screen.getAllByText('Dr. LongShift');
    expect(doctorSlots.length).toBeGreaterThan(1);
  });

  test('handles doctor with exact one-hour slot', () => {
    const oneHourDoctor = {
      _id: '5',
      doctorName: 'Dr. OneHour',
      bookingDay: 'Friday',
      startTime: '10:00',
      endTime: '11:00',
      roomNo: '105',
    };

    render(<ScheduleGrid filteredDoctors={[oneHourDoctor]} onSlotClick={mockOnSlotClick} />);

    expect(screen.getByText('Dr. OneHour')).toBeInTheDocument();
  });

  test('handles very long doctor names', () => {
    const longNameDoctor = {
      _id: '6',
      doctorName: 'Dr. ' + 'A'.repeat(100),
      bookingDay: 'Saturday',
      startTime: '13:00',
      endTime: '16:00',
      roomNo: '106',
    };

    render(<ScheduleGrid filteredDoctors={[longNameDoctor]} onSlotClick={mockOnSlotClick} />);

    expect(screen.getAllByText('Dr. ' + 'A'.repeat(100)).length).toBeGreaterThan(0);
  });

  test('handles very long nurse names', () => {
    const longNurseNameDoctor = {
      _id: '7',
      doctorName: 'Dr. Test',
      bookingDay: 'Sunday',
      startTime: '11:00',
      endTime: '14:00',
      roomNo: '107',
      nurse: { name: 'Nurse ' + 'B'.repeat(100) },
    };

    render(<ScheduleGrid filteredDoctors={[longNurseNameDoctor]} onSlotClick={mockOnSlotClick} />);

    expect(screen.getAllByText(/Nurse: Nurse B/).length).toBeGreaterThan(0);
  });

  test('handles doctor with missing nurse object correctly', () => {
    const noNurseDoctor = {
      _id: '8',
      doctorName: 'Dr. NoNurse',
      bookingDay: 'Monday',
      startTime: '15:00',
      endTime: '18:00',
      roomNo: '108',
      nurse: null,
    };

    render(<ScheduleGrid filteredDoctors={[noNurseDoctor]} onSlotClick={mockOnSlotClick} />);

    expect(screen.getAllByText('Dr. NoNurse').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Nurse:/)).not.toBeInTheDocument();
  });

  test('handles multiple doctors in different time slots on same day', () => {
    const multipleDoctors = [
      {
        _id: '9',
        doctorName: 'Dr. Morning',
        bookingDay: 'Tuesday',
        startTime: '08:00',
        endTime: '10:00',
        roomNo: '201',
      },
      {
        _id: '10',
        doctorName: 'Dr. Afternoon',
        bookingDay: 'Tuesday',
        startTime: '14:00',
        endTime: '16:00',
        roomNo: '202',
      },
    ];

    render(<ScheduleGrid filteredDoctors={multipleDoctors} onSlotClick={mockOnSlotClick} />);

    expect(screen.getAllByText('Dr. Morning').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dr. Afternoon').length).toBeGreaterThan(0);
  });

  test('renders with cursor-pointer class on doctor slots', () => {
    render(<ScheduleGrid filteredDoctors={mockDoctors} onSlotClick={mockOnSlotClick} />);

    const doctorSlots = screen.getAllByText('Dr. Smith');
    const doctorSlot = doctorSlots[0].closest('td');
    expect(doctorSlot).toHaveClass('cursor-pointer');
  });

  test('displays room number for all doctor slots', () => {
    render(<ScheduleGrid filteredDoctors={mockDoctors} onSlotClick={mockOnSlotClick} />);

    expect(screen.getAllByText(/Room: 101/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Room: 102/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Room: 103/).length).toBeGreaterThan(0);
  });
});
