// src/components/ForgotPasswordPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import forgetAndResetImage from '../forgetAndReset.jpg';
import '../styles/authPages.css';
import { fetchCompanies, forgotPasswordRequest } from '../services/apiService';

// --- Styled Components ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const ForgotPasswordContainer = styled.div` /* Styles... */
  height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center;
  background-image: url(${forgetAndResetImage}); background-size: cover; background-position: center;
  background-repeat: no-repeat; font-family: sans-serif;
`;
const ForgotPasswordForm = styled.form` /* Styles... */
  display: flex; flex-direction: column; width: 450px; padding: 30px 40px; border: 1px solid #ddd;
  border-radius: 8px; background-color: rgba(255, 255, 255, 0.95); box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
  opacity: 0; animation: ${fadeIn} 0.8s ease-out forwards;
  h2 { text-align: center; margin-bottom: 20px; color: #333; font-size: 1.8em; }
`;
const FormLabel = styled.label` /* Styles... */ margin-bottom: 8px; font-weight: bold; color: #333; font-size: 0.9em; `;
const FormInput = styled.input` /* Styles... */ padding: 10px 12px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; font-size: 1em;`;
const FormSelect = styled.select` /* Styles... */ padding: 10px 12px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; font-size: 1em; background-color: white;
  &:disabled { background-color: #e9ecef; cursor: not-allowed; }
`;
const FormGroup = styled.div` /* Styles... */ display: flex; flex-direction: column; margin-bottom: 15px; `;
const FormButton = styled.button` /* Styles... */
  background-color: #5B40B4; color: white; padding: 12px 15px; border: none; border-radius: 4px;
  cursor: pointer; font-size: 1em; margin-top: 10px; transition: background-color 0.2s ease;
  &:disabled { background-color: #cccccc; cursor: not-allowed; }
  &:not(:disabled):hover { background-color: #4a349a; }
`;
const BackButton = styled(FormButton)` /* Styles... */ background-color: #6c757d; margin-top: 8px;
  &:not(:disabled):hover { background-color: #5a6268; }
`;
// --- End Styled Components ---

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [message, setMessage] = useState(''); // Shows generic success/info message
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // --- Fetch Companies Logic ---
  const loadCompanies = useCallback(async () => {
     setLoadingCompanies(true);
     setError('');
     try {
         const data = await fetchCompanies();
         setCompanies(data || []);
         if (data && data.length > 0) {
              const params = new URLSearchParams(window.location.search);
              const initialCompanyId = params.get('companyId');
              const validInitialId = initialCompanyId && data.some(c => c.id.toString() === initialCompanyId);
              const defaultId = validInitialId ? initialCompanyId : data[0].id.toString();
              const currentCompany = data.find(c => c.id.toString() === defaultId);
              setCompanyId(defaultId);
              setSelectedCompanyName(currentCompany ? currentCompany.name : 'Unknown');
         } else {
            setError(prev => (prev ? prev + '; ' : '') + 'No companies found.');
            setCompanyId('');
            setSelectedCompanyName('');
         }
     } catch (err) {
         setError(`Failed to load companies: ${err.message}`);
         setCompanies([]);
     } finally {
         setLoadingCompanies(false);
     }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Only needs to run once

  useEffect(() => {
     loadCompanies();
   }, [loadCompanies]);

  // --- Handle Company Change ---
  const handleCompanyChange = (e) => {
    const newCompanyId = e.target.value;
    setCompanyId(newCompanyId);
    const selectedCompany = companies.find(c => c.id.toString() === newCompanyId);
    setSelectedCompanyName(selectedCompany ? selectedCompany.name : '');
    setMessage('');
    setError('');
  };

  // --- Handle Submit (Uses Email Service) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!username.trim() || !companyId) {
      setError(!companyId ? 'Please select a company.' : 'Username is required.');
      return;
    }
    setIsSubmitting(true);
    try {
       // Expects { message: "..." } from backend, email is sent separately
       const result = await forgotPasswordRequest(username.trim(), companyId);
       setMessage(result.message); // Display generic message like "If account exists..."
       setError('');
       setUsername(''); // Clear username field
    } catch (err) {
      // Handles network errors or specific errors returned from backend
      setError(err.message || 'An unknown error occurred during the request.');
      setMessage('');
      console.error("Forgot Password frontend error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordForm onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p style={{ textAlign: 'center', marginBottom: '15px', fontSize: '0.95em', color: '#555' }}>
          Enter your username and select your company. Reset instructions will be processed.
        </p>

        {/* Display Message or Error */}
        <div className="message-container" style={{ minHeight: '20px', marginBottom: '15px' }}>
             {error && <p className="message-text error">{error}</p>}
             {message && <p className="message-text success">{message}</p>}
        </div>

        <FormGroup>
          <FormLabel htmlFor="company">Company:</FormLabel>
          <FormSelect id="company" value={companyId} onChange={handleCompanyChange}
            disabled={loadingCompanies || isSubmitting} required >
             <option value="" disabled={!!companyId}>-- Select Company --</option>
             {loadingCompanies && <option value="" disabled>Loading...</option>}
             {!loadingCompanies && companies.length === 0 && <option value="" disabled>No companies</option>}
             {!loadingCompanies && companies.map(c => (<option key={c.id} value={c.id}>{c.name}</option> ))}
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="username">Username:</FormLabel>
          <FormInput type="text" id="username" placeholder="Enter username" value={username}
            onChange={(e) => setUsername(e.target.value)} required disabled={isSubmitting} autoComplete="username" />
        </FormGroup>

        <FormButton type="submit" disabled={isSubmitting || loadingCompanies || !companyId || !username}>
          {isSubmitting ? 'Processing...' : 'Request Password Reset'}
        </FormButton>

        <BackButton type="button" onClick={handleBack} disabled={isSubmitting}>
           Back to Login
        </BackButton>

      </ForgotPasswordForm>
    </ForgotPasswordContainer>
  );
};

export default ForgotPasswordPage;