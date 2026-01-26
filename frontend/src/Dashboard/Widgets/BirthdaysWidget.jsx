import React from 'react';
import styled from 'styled-components';
import { FaBirthdayCake } from 'react-icons/fa';
import './Widgets.css';

const BirthdayList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const BirthdayItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px;
  border-bottom: 1px solid var(--border-secondary);

  &:last-child {
    border-bottom: none;
  }
`;

const BirthdayName = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`;

const BirthdayDate = styled.span`
  font-weight: 600;
  color: var(--text-accent);
  background-color: var(--background-tertiary);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.85em;
`;

const SubHeader = styled.h5`
  font-size: 0.8em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 15px 0 5px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-secondary);
`;

const BirthdaysWidget = ({ upcoming = [], recent = [] }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="widget-card">
            <h4><FaBirthdayCake style={{ marginRight: '8px', color: 'var(--text-accent)' }}/> Birthdays</h4>
            <div className="widget-content">
                {upcoming.length === 0 && recent.length === 0 ? (
                    <p style={{ textAlign: 'center', margin: 'auto 0', color: 'var(--text-muted)' }}>
                        No recent or upcoming birthdays.
                    </p>
                ) : (
                    <>
                        {upcoming.length > 0 && (
                            <>
                                <SubHeader>Upcoming</SubHeader>
                                <BirthdayList>
                                    {upcoming.map((b, index) => (
                                        <BirthdayItem key={`up-${index}`}>
                                            <BirthdayName>{b.name}</BirthdayName>
                                            <BirthdayDate>{formatDate(b.birthDate)}</BirthdayDate>
                                        </BirthdayItem>
                                    ))}
                                </BirthdayList>
                            </>
                        )}
                        {recent.length > 0 && (
                            <>
                                <SubHeader>Recently Passed</SubHeader>
                                <BirthdayList>
                                    {recent.map((b, index) => (
                                        <BirthdayItem key={`rec-${index}`}>
                                            <BirthdayName>{b.name}</BirthdayName>
                                            <BirthdayDate>{formatDate(b.birthDate)}</BirthdayDate>
                                        </BirthdayItem>
                                    ))}
                                </BirthdayList>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BirthdaysWidget;