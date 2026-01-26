import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import styled from 'styled-components';
import { fetchCompanies, fetchDepartments, registerUser } from '../services/apiService'; // Import API functions

// ... (Styled Components: PopupOverlay, PopupContainer, RegistrationForm, SuccessMessage - remain the same) ...
const PopupOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center;
  align-items: center; z-index: 1000; display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
`;
const PopupContainer = styled.div`
  background-color: white; padding: 20px; border-radius: 5px; width: 400px;
  max-height: 90vh; overflow-y: auto;
`;
const RegistrationForm = styled.form`
  display: flex; flex-direction: column;
  input, select { margin-bottom: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95em; }
  button[type="submit"] { padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; margin-top: 10px; }
  button[type="submit"]:disabled { background-color: #cccccc; cursor: not-allowed; }
`;
const SuccessMessage = styled.div`
  text-align: center; padding: 20px;
  h2 { color: #28a745; margin-bottom: 15px; }
  p { margin-bottom: 10px; line-height: 1.5; }
  button { padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px; }
`;
const ErrorDisplay = styled.div`
  color: red; margin-bottom: 10px; border: 1px solid red; padding: 5px;
  border-radius: 4px; font-size: 0.9em;
`;


const RegistrationPopup = ({ isOpen, onClose }) => {
    // --- Form State ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [departmentName, setDepartmentName] = useState(''); // Store selected department NAME
    const [role] = useState('USER'); // Fixed role
    const [companyId, setCompanyId] = useState('');

    // --- Data Loading State ---
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]); // State for departments
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false); // Loading state for departments

    // --- UI/Error State ---
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registrationError, setRegistrationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Fetch Companies ---
    const loadCompanies = useCallback(async () => {
        if (!isOpen) return;
        setLoadingCompanies(true);
        setRegistrationError(''); // Clear error on load attempt
        try {
            const data = await fetchCompanies();
            setCompanies(data || []);
            if (data && data.length > 0 && !companyId) {
                setCompanyId(data[0].id.toString()); // Default to first company
            } else if (!data || data.length === 0) {
                 setRegistrationError(prev => prev + (prev ? '; ' : '') + 'No companies available.');
            }
        } catch (error) {
            console.error("Fetch companies error:", error);
             setRegistrationError(prev => prev + (prev ? '; ' : '') + `Failed to load companies: ${error.message}`);
            setCompanies([]);
        } finally {
            setLoadingCompanies(false);
        }
    }, [isOpen, companyId]); // Rerun if isOpen changes or companyId is reset

    // --- Fetch Departments ---
    const loadDepartments = useCallback(async () => {
         if (!isOpen) return;
         setLoadingDepartments(true);
         setRegistrationError(''); // Clear error
         try {
             const data = await fetchDepartments();
             // Filter out 'Unassigned' if you don't want it as a user choice
             const filteredData = data ? data.filter(d => d.name.toLowerCase() !== 'unassigned') : [];
             setDepartments(filteredData || []);
             // Set default department selection if needed (e.g., first in the list)
             if (filteredData && filteredData.length > 0 && !departmentName) {
                  // setDepartmentName(filteredData[0].name); // Optional: Default selection
             } else if (!filteredData || filteredData.length === 0) {
                 setRegistrationError(prev => prev + (prev ? '; ' : '') + 'No departments available.');
             }
         } catch (error) {
             console.error("Fetch departments error:", error);
             setRegistrationError(prev => prev + (prev ? '; ' : '') + `Failed to load departments: ${error.message}`);
             setDepartments([]);
         } finally {
             setLoadingDepartments(false);
         }
    }, [isOpen, departmentName]); // Rerun if isOpen changes

    // --- Load data when popup opens ---
    useEffect(() => {
        if (isOpen) {
            loadCompanies();
            loadDepartments();
        } else {
            // Reset state when closing (optional, handleClose does most of this)
            // setRegistrationError('');
            // setRegistrationSuccess(false);
        }
    }, [isOpen, loadCompanies, loadDepartments]);


    // --- Handle Registration Submit ---
    const handleRegistration = async (e) => {
        e.preventDefault();
        if (!companyId) {
            setRegistrationError('Please select a company.');
            return;
        }
         if (!departmentName) { // Check if department is selected
             setRegistrationError('Please select a department.');
             return;
         }
        setRegistrationError('');
        setIsSubmitting(true);
        try {
            const registrationData = {
                firstName, lastName, username, mobileNumber, password,
                role, // Fixed to USER
                companyId: parseInt(companyId, 10),
                department: departmentName, // Send selected department NAME
            };
            const response = await registerUser(registrationData); // Use apiService function
            const result = await response.json(); // Assume JSON response always

            if (response.ok) {
                setRegistrationSuccess(true);
                console.log('Registration successful:', result.message);
            } else {
                setRegistrationError(result.error || result.message || 'Registration failed.');
                console.error('Registration failed:', result);
            }
        } catch (error) {
            setRegistrationError(`Network error: ${error.message}. Please try again.`);
            console.error('Network error during registration:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Reset form state and call parent's onClose ---
    const handleClose = () => {
        setFirstName(''); setLastName(''); setUsername('');
        setMobileNumber(''); setPassword(''); setDepartmentName('');
        setCompanyId(companies.length > 0 ? companies[0].id.toString() : '');
        setRegistrationSuccess(false); setRegistrationError('');
        setIsSubmitting(false);
        // Don't reset companies/departments lists here
        onClose(); // Call the original onClose prop
    };

    const isLoading = loadingCompanies || loadingDepartments;

    // --- Render logic ---
    return (
        <PopupOverlay $isOpen={isOpen}>
            <PopupContainer>
                {registrationSuccess ? (
                    <SuccessMessage>
                        <h2>Registration Submitted!</h2>
                        <p>Your registration request has been sent.</p>
                        <p><strong>Please wait for an administrator to approve your account.</strong></p>
                        <button onClick={handleClose}>Close</button>
                    </SuccessMessage>
                ) : (
                    <>
                        <h2>Register</h2>
                        {registrationError && <ErrorDisplay>{registrationError}</ErrorDisplay>}

                        <RegistrationForm onSubmit={handleRegistration}>
                            {/* Input Fields */}
                            <input type="text" placeholder="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
                            <input type="text" placeholder="Last Name *" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
                            <input type="text" placeholder="Username *" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
                            <input type="tel" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} autoComplete="tel" pattern="[0-9]*" title="Please enter only numbers" />
                            <input type="password" placeholder="Password (min 5 chars, no spaces) *" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" minLength="5" pattern="^\S+$" title="Min 5 chars, no spaces."/>

                            {/* Company Selection */}
                            <label htmlFor="reg-company">Company *</label>
                            <select id="reg-company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} required disabled={loadingCompanies || isSubmitting}>
                                {loadingCompanies && <option value="">Loading Companies...</option>}
                                {!loadingCompanies && companies.length === 0 && <option value="">No companies found</option>}
                                {!loadingCompanies && companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            {/* --- Department Selection (Dropdown) --- */}
                            <label htmlFor="reg-department">Department *</label>
                             <select
                                id="reg-department"
                                value={departmentName} // Bind to departmentName state
                                onChange={(e) => setDepartmentName(e.target.value)} // Update departmentName state
                                required
                                disabled={loadingDepartments || isSubmitting}
                             >
                                <option value="">-- Select Department --</option> {/* Default empty option */}
                                {loadingDepartments && <option value="">Loading Departments...</option>}
                                {!loadingDepartments && departments.length === 0 && <option value="" disabled>No departments available</option>}
                                {!loadingDepartments && departments.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option> // Use department NAME as value
                                ))}
                            </select>
                             {/* --- End Department Selection --- */}

                            {/* Submit Button */}
                            <button type="submit" disabled={isLoading || isSubmitting || !companyId || !departmentName}>
                                {isSubmitting ? 'Submitting...' : 'Register'}
                            </button>
                        </RegistrationForm>

                        {/* Cancel Button */}
                        <button onClick={handleClose} style={{ background: '#6c757d', marginTop: '10px', width: '100%', border: 'none', padding: '10px', borderRadius: '5px', color: 'white', cursor: 'pointer', fontSize: '1em' }} disabled={isSubmitting}>
                             Cancel
                        </button>

                        {/* Link to Login (Closes popup) */}
                        <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9em' }}>
                             Already have an account?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); handleClose(); }}>
                                Login
                            </a>
                        </p>
                    </>
                )}
            </PopupContainer>
        </PopupOverlay>
    );
};

export default RegistrationPopup;