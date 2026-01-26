// src/components/Dashboard/Announcements.jsx
import React from 'react';
import styled from 'styled-components';

const Widget = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 15px;
  width: 400px;
`;

const Announcements = () => {
  return (
    <Widget>
      <h3>Announcements</h3>
      <p>News feed coming soon...</p>
    </Widget>
  );
};

export default Announcements;