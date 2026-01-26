import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// --- STYLED COMPONENTS for an EXTRA COMPACT Calendar ---

const CalendarContainer = styled.div`
  width: 100%;
  background: transparent;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px 6px 2px; /* Minimal padding */
  border-bottom: 1px solid var(--border-secondary);
  margin-bottom: 6px; /* Tighter margin */
`;

const MonthDisplay = styled.h4`
  font-weight: 600;
  font-size: 0.95em; /* Smaller month/year font */
  margin: 0;
  color: var(--text-primary);
`;

const NavButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.8em;
  padding: 4px; /* Smaller button padding */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: var(--background-hover);
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 7px; /* Minimal gap */
`;

const DayHeader = styled.div`
  text-align: center;
  font-weight: 500;
  font-size: 0.7em; /* Very small weekday text */
  color: var(--text-muted);
  padding-bottom: 4px;
  text-transform: uppercase;
`;

const DayCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px; /* <<< MAJOR CHANGE: Reduced height further */
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8em; /* Smaller date numbers */
  color: ${props => (props.$isOtherMonth ? 'var(--text-muted)' : 'var(--text-primary)')};
  background-color: ${props => (props.$isToday ? 'var(--background-accent-light)' : 'transparent')};
  color: ${props => (props.$isToday ? 'var(--text-accent)' : props.$isOtherMonth ? 'var(--text-muted)' : 'var(--text-primary)')};
  border: 1.5px solid ${props => (props.$isSelected ? 'var(--text-accent)' : 'transparent')}; /* Thinner border */
  font-weight: ${props => (props.$isToday || props.$isSelected ? '600' : 'normal')};
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: var(--background-hover);
  }
`;

// --- The Custom Calendar Component Logic (no changes here) ---

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleDayClick = (day) => setSelectedDate(day);
  
  useEffect(() => {
    const timer = setInterval(() => {
      const today = new Date();
      if (selectedDate.getDate() !== today.getDate()) {
        setSelectedDate(today);
        setCurrentDate(today);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [selectedDate]);

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    let startDay = firstDayOfMonth.getDay();
    startDay = (startDay === 0) ? 6 : startDay - 1; // Monday = 0, Sunday = 6
    const days = [];
    for (let i = startDay; i > 0; i--) {
        const day = new Date(year, month, 1 - i);
        days.push(<DayCell key={`prev-${i}`} $isOtherMonth>{day.getDate()}</DayCell>);
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const day = new Date(year, month, i);
        days.push(
            <DayCell
                key={`current-${i}`}
                $isToday={isToday(day)}
                $isSelected={isSelected(day)}
                onClick={() => handleDayClick(day)}
            >
                {day.getDate()}
            </DayCell>
        );
    }
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        const day = new Date(year, month + 1, i);
        days.push(<DayCell key={`next-${i}`} $isOtherMonth>{day.getDate()}</DayCell>);
    }
    return days;
  };

  return (
    <div className="widget-card" style={{padding: '12px 15px'}}> {/* Reduced parent padding */}
        <Header>
            <NavButton onClick={handlePrevMonth} title="Previous month"><FaChevronLeft /></NavButton>
            <MonthDisplay>
                {currentDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
            </MonthDisplay>
            <NavButton onClick={handleNextMonth} title="Next month"><FaChevronRight /></NavButton>
        </Header>
        <CalendarContainer>
            <CalendarGrid>
                <DayHeader>Mon</DayHeader>
                <DayHeader>Tue</DayHeader>
                <DayHeader>Wed</DayHeader>
                <DayHeader>Thu</DayHeader>
                <DayHeader>Fri</DayHeader>
                <DayHeader>Sat</DayHeader>
                <DayHeader>Sun</DayHeader>
                {renderCalendarDays()}
            </CalendarGrid>
        </CalendarContainer>
    </div>
  );
};

export default CalendarWidget;