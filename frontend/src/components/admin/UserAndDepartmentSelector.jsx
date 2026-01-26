import React from 'react';
import styled from 'styled-components';

// Simple styled select for consistency
const SimpleSelect = styled.select`
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    background-color: var(--background-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
`;

const UserAndDepartmentSelector = ({ 
    users, 
    departments, 
    selectedUsers,       // This will now be an array of IDs
    onUserChange,        // This will be a new handler
    selectedDepartments, // This will be an array of IDs
    onDepartmentChange,  // This will be a new handler
    isDisabled 
}) => {
    
    return (
        <div>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                    Invite Specific Employees (Hold Ctrl or Cmd to select multiple)
                </label>
                <SimpleSelect
                    multiple
                    value={selectedUsers}
                    onChange={onUserChange}
                    disabled={isDisabled}
                    size="5" // Show 5 items at a time
                >
                    {users.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.username})
                        </option>
                    ))}
                </SimpleSelect>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                    Invite Entire Departments (Hold Ctrl or Cmd to select multiple)
                </label>
                <SimpleSelect
                    multiple
                    value={selectedDepartments}
                    onChange={onDepartmentChange}
                    disabled={isDisabled}
                    size="5"
                >
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>
                            {d.name} Department
                        </option>
                    ))}
                </SimpleSelect>
            </div>
        </div>
    );
};

export default UserAndDepartmentSelector;