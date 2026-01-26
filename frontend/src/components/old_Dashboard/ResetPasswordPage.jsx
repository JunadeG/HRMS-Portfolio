// src/components/old_Dashboard/ResetPasswordPage.jsx
// NOTE: Ensure path is correct for your project structure.
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import forgetAndResetImage from '../../forgetAndReset.jpg'; // Adjust path as needed
import { resetPasswordSubmit } from '../../services/apiService'; // Adjust path as needed

// --- Styled Components ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const ResetPasswordContainer = styled.div` /* styles... */
  height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center;
  background-image: url(${forgetAndResetImage}); background-size: cover; background-position: center;
  background-repeat: no-repeat; font-family: sans-serif;
`;
const ResetPasswordForm = styled.form` /* styles... */
  display: flex; flex-direction: column; width: 350px; padding: 30px; border: 1px solid #ddd;
  border-radius: 8px; background-color: rgba(255, 255, 255, 0.92); box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  opacity: 0; animation: ${fadeIn} 0.8s ease-out forwards;
  h2 { text-align: center; margin-bottom: 15px; }
`;
const FormLabel = styled.label` /* styles... */ margin-bottom: 8px; font-weight: bold; color: #333; font-size: 0.9em;`;
const FormInput = styled.input` /* styles... */ padding: 10px 12px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; font-size: 1em;`;
const FormButton = styled.button` /* styles... */
  background-color: #5B40B4; color: white; padding: 12px 15px; border: none; border-radius: 4px;
  cursor: pointer; font-size: 1em; margin-top: 10px; transition: background-color 0.2s ease;
   &:disabled { background-color: #cccccc; cursor: not-allowed; }
   &:not(:disabled):hover { background-color: #4a349a; }
`;
const PasswordHint = styled.p` /* styles... */ font-size: 0.85em; color: #666; margin-top: -10px; margin-bottom: 15px;`;
const MessageContainer = styled.div` /* styles... */
    min-height: 40px; margin-bottom: 10px; text-align: center;
    font-weight: bold; font-size: 0.95em;
    &.error { color: red; }
    &.success { color: green; }
`;
// --- End Styled Components ---

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const navigate = useNavigate();
  const { token } = useParams(); // <<< Gets token from URL path part
  const location = useLocation();
  const username = new URLSearchParams(location.search).get('username'); // <<< Gets username from ?username= part

  // Redirect countdown effect
  useEffect(() => {
    let timer;
    if (redirecting && message.includes("successfully")) {
       timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          setMessage(`Password reset successfully. Redirecting to login in ${prev - 1} seconds...`);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [redirecting, message, navigate]);

  // Validate token/username on load
   useEffect(() => {
     if (!token || !username) {
         setError("Invalid reset link. Required information missing.");
         // Disable form or redirect? Disabling is safer.
         setRedirecting(true); // Use redirecting flag to disable form inputs
         setMessage(''); // Clear any potential success message
     }
   }, [token, username]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || !username) {
        setError("Cannot proceed: Invalid reset link.");
        return;
    }
    if (password.length < 5 || password.includes(" ")) {
        setError('Password must be min 5 characters, no spaces.');
        return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await resetPasswordSubmit(username, password, token);
      setMessage(result.message || 'Password reset successfully.');
      setError('');
      setRedirecting(true); // Start redirect countdown
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
      setMessage('');
      console.error("Reset password error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || redirecting || !token || !username;

  return (
    <ResetPasswordContainer>
      <ResetPasswordForm onSubmit={handleSubmit}>
        <h2>Reset Your Password</h2>
        {username && (
            <p style={{ textAlign: 'center', marginBottom: '15px', fontSize: '0.95em', color: '#555' }}>
                Setting new password for: <strong>{username}</strong>
            </p>
         )}
         <MessageContainer className={error ? 'error' : (message ? 'success' : '')}>
            {error || message}
         </MessageContainer>

        <FormLabel htmlFor="password">New Password:</FormLabel>
        <FormInput
          type="password" id="password" placeholder="Enter new password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          required disabled={isFormDisabled} minLength="5"
        />
         <PasswordHint>Min 5 characters, no spaces.</PasswordHint>

        <FormLabel htmlFor="confirmPassword">Confirm New Password:</FormLabel>
        <FormInput
          type="password" id="confirmPassword" placeholder="Re-enter new password"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          required disabled={isFormDisabled}
        />

        <FormButton type="submit" disabled={isFormDisabled}>
           {isSubmitting ? 'Resetting...' : (redirecting ? 'Redirecting...' : 'Reset Password')}
        </FormButton>

         {!redirecting && (
              <button type="button" onClick={() => navigate('/')}
                  style={{ background: 'none', border: 'none', color: '#007bff', marginTop: '10px', cursor: 'pointer', fontSize: '0.9em', textDecoration: 'underline'}}
                  disabled={isSubmitting}
              > Cancel </button>
          )}
      </ResetPasswordForm>
    </ResetPasswordContainer>
  );
};

export default ResetPasswordPage;