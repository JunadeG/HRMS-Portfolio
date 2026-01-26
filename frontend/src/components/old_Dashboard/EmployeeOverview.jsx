// src/components/Dashboard/EmployeeOverview.jsx
import React from 'react';
import styled from 'styled-components';

const OverviewContainer = styled.div`
  display: flex;
  gap: 20px; //  Spacing between widgets
`;

const Widget = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 15px;
  width: 200px;
`;

const EmployeeOverview = () => {
  return (
    <OverviewContainer>
      <Widget>
        <h3>Total Employees</h3>
        <p>350</p>
      </Widget>
      <Widget>
        <h3>New Hires</h3>
        <p>15 (+2)</p> {/* (+2) indicates trend */}
      </Widget>
      <Widget>
        <h3>Departures</h3>
        <p>5 (-1)</p> {/* (-1) indicates trend */}
      </Widget>
    </OverviewContainer>
  );
};

export default EmployeeOverview;