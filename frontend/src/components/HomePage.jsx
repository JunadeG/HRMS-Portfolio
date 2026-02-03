import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Keep existing imports
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import HRImage from '../backgroundHRMS3.jpg'; // Using your preferred background
import { fetchCompanies, loginUser } from '../services/apiService';
// Add FaEye and FaEyeSlash to the import
import { FaBuilding, FaUserAlt, FaLock, FaSignInAlt, FaUserTie, FaEye, FaEyeSlash } from 'react-icons/fa';

// --- Keyframes (Unchanged) ---
const fadeIn = keyframes` from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const slideInLeft = keyframes` from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); }`;
const slideInRight = keyframes` from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); }`;
const Spinner = keyframes` to { transform: rotate(360deg); }`;
const subtleGlow = keyframes`
  0%, 100% { text-shadow: 0 0 6px rgba(200, 220, 255, 0.5), 0 0 9px rgba(150, 180, 255, 0.3); }
  50% { text-shadow: 0 0 9px rgba(200, 220, 255, 0.7), 0 0 13px rgba(150, 180, 255, 0.5); }
`;


// --- Styled Components (Existing styles unchanged, one new addition) ---
const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  width: 100%;
  padding: 40px 40px 40px 40px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  font-family: 'Exo 2', sans-serif;

  &::before { /* Background */
    content: '';
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: url(${HRImage}); background-size: cover; background-position: center;
    filter: brightness(0.65) saturate(1.1); /* Keep or adjust filter */
    z-index: -1;
  }
`;

const CompanyNameDisplay = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 2.6em;
  font-weight: 600;
  color: #e0e8ff;
  /* Apply smoother glow with longer duration */
  animation: ${fadeIn} 1s ease-out 0.2s forwards, ${subtleGlow} 6s ease-in-out infinite 1.2s; /* Increased duration */
  margin-bottom: 5vh;
  text-align: center;
  z-index: 2;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  letter-spacing: 1px;

  @media (max-width: 768px) { font-size: 2em; margin-bottom: 4vh; }
  @media (max-width: 480px) { font-size: 1.7em; margin-bottom: 4vh; }
`;


const ContentWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1150px;
    gap: 60px;
    z-index: 1;
    margin-top: auto;
    margin-bottom: auto;

    @media (max-width: 992px) {
        flex-direction: column;
        justify-content: center;
        max-width: 500px;
        gap: 30px;
        margin-top: 20px; margin-bottom: 20px;
    }
`;

const TextContainer = styled.div`
  flex: 1 1 auto;
  max-width: 480px;
  color: #ccd6f6;
  animation: ${slideInLeft} 1s ease-out 0.5s forwards;
  opacity: 0;
  text-align: left;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);

  @media (max-width: 992px) {
    max-width: 90%; order: 2; animation: ${fadeIn} 1s ease-out forwards;
    margin-top: 15px; text-align: center;
  }
`;

const HomePageHeading = styled.h2`
  font-family: 'Exo 2', sans-serif;
  margin-bottom: 15px;
  font-size: 2.2em;
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  @media (max-width: 768px) { font-size: 1.9em; }
`;

const HomePageParagraph = styled.p`
  margin-bottom: 20px;
  line-height: 1.7;
  font-size: 1.05em;
  color: #bdc8e8;
  @media (max-width: 768px) { font-size: 0.95em; }
`;

const LoginFormContainer = styled.div`
  flex: 0 0 auto;
  width: 100%;
  max-width: 400px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(235, 240, 255, 0.9));
  padding: 35px 40px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2), 0 0 15px rgba(91, 64, 180, 0.1);
  display: flex;
   backdrop-filter: blur(5px);
  flex-direction: column;
  animation: fadeInUp 0.8s ease-out 0.5s forwards;
  opacity: 0;
 border: 1px solid rgba(255, 255, 255, 0.3);

  @media (max-width: 992px) {
    width: 100%; max-width: 450px; order: 1;
    animation: ${fadeIn} 1s ease-out forwards;
  }
`;

const FormTitle = styled.h3`
    text-align: center;
    margin-bottom: 25px;
    color: #334;
    font-weight: 600;
    font-size: 1.4em;
    font-family: 'Exo 2', sans-serif;
    letter-spacing: 0.5px;
`;

const LoginForm = styled.form` display: flex; flex-direction: column; width: 100%; `;
const FormGroup = styled.div` display: flex; flex-direction: column; margin-bottom: 16px; position: relative; `; // Already relative positioned

const FormLabel = styled.label`
  font-weight: 500;
  color: #556;
  font-size: 0.8em;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputIcon = styled.span`
    position: absolute;
    left: 13px;
    top: 35px; // Keep this consistent
    color: #a0a0c0;
    font-size: 0.9em;
    pointer-events: none;
`;

// Common Input Styles (Unchanged)
const inputStyles = css`
  padding: 11px 15px 11px 40px;
  border: 1px solid #c0c8e0;
  border-radius: 4px;
  font-size: 1em;
  font-family: 'Exo 2', sans-serif;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #f8faff;
  color: #333;

  &:focus {
    outline: none;
    border-color: #6a7bd9;
    box-shadow: 0 0 0 3px rgba(106, 123, 217, 0.25);
    background-color: #fff;
  }
   &:disabled { background-color: #e9ecef; cursor: not-allowed; opacity: 0.7; }
`;

const FormInput = styled.input`${inputStyles}`;

const FormSelect = styled.select`
  ${inputStyles}
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%236a7bd9" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 15px top 50%;
  background-size: 14px;
  padding-right: 40px;
`;

const LoginTypeToggle = styled.div`
    display: flex;
    margin-bottom: 20px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #c0c8e0;
`;

const ToggleButton = styled.button`
    flex: 1;
    padding: 9px;
    font-size: 0.85em;
    font-weight: 600;
    font-family: 'Exo 2', sans-serif;
    background-color: ${props => props.active ? '#5a67b1' : '#f8faff'};
    color: ${props => props.active ? 'white' : '#4a5588'};
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    &:hover:not(:disabled):not(.active) { background-color: #e4e8f7; }
    &:first-child { border-right: 1px solid #c0c8e0; }
    &.active { background-color: #5a67b1; color: white; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const FormButton = styled.button`
  background: linear-gradient(45deg, #5564a7, #717cb4);
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.05em;
  font-weight: 600;
  font-family: 'Exo 2', sans-serif;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  text-align: center;
  margin-top: 15px;
  transition: all 0.2s ease;
  border-bottom: 3px solid #3a4478;

  &:hover:not(:disabled) {
    background: linear-gradient(45deg, #48558a, #5f6a9d);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border-bottom-color: #2d345a;
  }
  &:focus { outline: none; box-shadow: 0 0 0 3px rgba(91, 100, 179, 0.3); }
  &:disabled { background: #b0b8d1; cursor: not-allowed; transform: none; box-shadow: none; border-bottom-color: #9098b1; opacity: 0.7; }
`;

const MessageContainer = styled.div` min-height: 25px; margin: 10px 0; text-align: center; font-size: 0.85em; font-weight: 500; `;
const LoginError = styled(MessageContainer)` color: #a94442; background-color: #f2dede; border: 1px solid #ebccd1; padding: 10px; border-radius: 4px; `;
const LinkContainer = styled.div` text-align: center; margin-top: 20px; font-size: 0.85em; `;
const ForgotPasswordLink = styled.a` color: #6a7bd9; text-decoration: none; cursor: pointer; &:hover { text-decoration: underline; } `;
const LoadingSpinner = styled.div` display: inline-block; width: 1em; height: 1em; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: ${Spinner} 0.6s linear infinite; margin-right: 8px; `;

// --- ADDED: Styled Component for Password Visibility Toggle ---
const PasswordToggleIcon = styled.span`
  position: absolute;
  right: 12px; // Position icon on the right
  top: 35px;   // Align vertically with other InputIcons
  cursor: pointer;
  color: #8899a6; // Icon color
  z-index: 2; // Make sure it's clickable
  font-size: 1.1em;
  user-select: none; // Prevent selecting icon text

  &:hover {
    color: #5B40B4; // Accent color on hover
  }
`;
// --- End Styled Components ---


const HomePage = ({ onLoginSuccess }) => {
  // --- State ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState(''); // Keep initial state as empty string
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loginAs, setLoginAs] = useState('user');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <<< ADDED state

  const navigate = useNavigate();

  // --- Functions ---
  // Load Companies - Using the corrected logic from the previous step
  const loadCompanies = useCallback(async () => {
    console.log("HomePage: loadCompanies called.");
    setLoadingCompanies(true);
    setLoginError('');
    try {
      const data = await fetchCompanies();
      console.log("HomePage: Fetched companies data:", data);
      if (Array.isArray(data)) {
          setCompanies(data);
          // Use functional update to safely set default based on previous state
          setCompanyId(currentCompanyId => {
              if (data.length > 0 && !currentCompanyId) {
                  console.log(`HomePage: Setting default companyId to: ${data[0].id.toString()}`);
                  return data[0].id.toString();
              }
              console.log(`HomePage: Not setting default companyId (Data length: ${data.length}, Current ID: ${currentCompanyId})`);
              return currentCompanyId; // Keep existing if already set or no data
          });
          if (data.length === 0) {
              setLoginError('No companies available.');
          }
      } else {
          console.error("HomePage: fetchCompanies did not return an array:", data);
          throw new Error("Received unexpected data format for companies.");
      }
    } catch (error) {
        console.error("HomePage: Error in loadCompanies:", error);
        setLoginError(`Error loading companies: ${error.message || 'Please check connection.'}`);
        setCompanies([]);
        setCompanyId(''); // Clear companyId on error
    } finally {
        setLoadingCompanies(false);
        console.log("HomePage: loadCompanies finished.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct here

  // Effect to load companies on mount
  useEffect(() => {
    console.log("HomePage: Mount effect running loadCompanies.");
    loadCompanies();
  }, [loadCompanies]); // Depend on the stable loadCompanies reference

  // Handle Company Change
  const handleCompanyChange = (e) => {
      setCompanyId(e.target.value);
      setLoginError('');
      console.log("HomePage: Company changed to ID:", e.target.value);
    };

  // Handle Forgot Password Click
  const handleForgotPasswordClick = (e) => {
      e.preventDefault();
      if (!companyId) {
          setLoginError('Please select a company first.');
          return;
      }
      setLoginError('');
      navigate(`/forgot-password?companyId=${companyId}`);
  };

  // Handle Login Submission
  const handleLogin = async (e) => {
      e.preventDefault();
      setLoginError('');
      if (!companyId) { setLoginError('Please select a company.'); return; }
      if (!username || !password) { setLoginError('Please enter username and password.'); return; }
      setIsLoggingIn(true);
      try {
          const response = await loginUser(username, password, companyId, loginAs);
          if (response.ok) {
              const data = await response.json();
              localStorage.setItem('jwtToken', data.token);
              setLoginError('');
              if (typeof onLoginSuccess === 'function') {
                  onLoginSuccess(); // Call the callback passed from App.jsx
              }
          } else {
              let errorMessage = `Login failed (${response.status})`;
              try {
                  const err = await response.json();
                  errorMessage = err.error || err.message || errorMessage;
              } catch (jsonError) {
                  errorMessage = `${response.statusText || errorMessage} (Could not parse error response)`;
              }
              setLoginError(errorMessage);
          }
      } catch (err) {
          setLoginError(err.message || 'Network error. Please try again.');
      } finally {
          setIsLoggingIn(false);
      }
  };

  // --- Calculate Selected Company Name (Unchanged) ---
  const selectedCompanyName = useMemo(() => {
      if (!companyId || companies.length === 0 || loadingCompanies) return 'HRMS Portal';
      const selectedCompany = companies.find(c => c.id.toString() === companyId);
      return selectedCompany ? selectedCompany.name : 'HRMS Portal';
  }, [companyId, companies, loadingCompanies]);

  // --- Password Visibility Toggle Functions --- ADD THESE ---
  const revealPassword = () => setShowPassword(true);
  const hidePassword = () => setShowPassword(false);
  // --- End Password Visibility Toggle Functions ---

  return (
    <HomePageContainer>
        <CompanyNameDisplay>{selectedCompanyName}</CompanyNameDisplay>
        <ContentWrapper>
            <TextContainer>
              <HomePageHeading>Welcome to HRMS</HomePageHeading>
              <HomePageParagraph>
                Access employee data, manage attendance, streamline benefits,
                and boost overall productivity through our integrated platform.
              </HomePageParagraph>
            </TextContainer>

            <LoginFormContainer>
              <FormTitle>Secure Portal Access</FormTitle>
              <LoginForm onSubmit={handleLogin}>
                {/* Company Dropdown (Unchanged) */}
                <FormGroup>
                  <FormLabel htmlFor="company">Company</FormLabel>
                   <InputIcon><FaBuilding /></InputIcon>
                  <FormSelect id="company" value={companyId} onChange={handleCompanyChange} required disabled={loadingCompanies || isLoggingIn} >
                    {/* Options */}
                    {loadingCompanies && <option value="" disabled>Loading Companies...</option>}
                    {!loadingCompanies && companies.length === 0 && (<option value="" disabled>No companies found</option>)}
                    {!loadingCompanies && companies.map(c => ( <option key={c.id} value={c.id.toString()}> {c.name} </option> ))}
                  </FormSelect>
                </FormGroup>

                 {/* Login As Toggle (Unchanged) */}
                 <FormGroup>
                  <FormLabel>Access Level</FormLabel>
                  <LoginTypeToggle>
                      <ToggleButton type="button" onClick={() => setLoginAs('user')} active={loginAs === 'user'} className={loginAs === 'user' ? 'active' : ''} disabled={isLoggingIn} >
                         <FaUserAlt size="0.9em"/> User
                      </ToggleButton>
                      <ToggleButton type="button" onClick={() => setLoginAs('admin')} active={loginAs === 'admin'} className={loginAs === 'admin' ? 'active' : ''} disabled={isLoggingIn} >
                         <FaUserTie size="0.9em"/> Admin
                      </ToggleButton>
                  </LoginTypeToggle>
                 </FormGroup>

                {/* Username (Unchanged) */}
                <FormGroup>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <InputIcon><FaUserAlt /></InputIcon>
                  <FormInput id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Username" autoComplete="username" disabled={isLoggingIn}/>
                </FormGroup>

                {/* --- Password Input with Toggle --- */}
                <FormGroup> {/* This FormGroup already has position: relative */}
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputIcon><FaLock /></InputIcon> {/* Existing lock icon */}
                  <FormInput
                    id="password"
                    type={showPassword ? "text" : "password"} // <<< CHANGE: Make type dynamic
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    autoComplete="current-password"
                    disabled={isLoggingIn}
                    // <<< ADD: Inline style for right padding to prevent overlap
                    style={{ paddingRight: '45px' }} // Adjust as needed
                  />
                  {/* <<< ADD: The toggle icon element itself >>> */}
                  <PasswordToggleIcon
                    onMouseDown={revealPassword}  // Show on mouse down
                    onMouseUp={hidePassword}      // Hide on mouse up
                    onTouchStart={revealPassword} // Show on touch start
                    onTouchEnd={hidePassword}     // Hide on touch end
                    onMouseLeave={hidePassword}   // Hide if mouse leaves while pressed down
                    title={showPassword ? "Hide password" : "Show password"} // Tooltip
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggleIcon>
                </FormGroup>
                {/* --- End Password Input with Toggle --- */}

                 {/* Error Display (Unchanged) */}
                 {loginError && <LoginError>{loginError}</LoginError>}

                {/* Submit Button (Unchanged) */}
                <FormButton type="submit" disabled={isLoggingIn || loadingCompanies || !companyId}>
                  {isLoggingIn ? <LoadingSpinner /> : <FaSignInAlt />}
                  {isLoggingIn ? 'Authenticating...' : 'Access Portal'}
                </FormButton>

                {/* Links (Unchanged) */}
                <LinkContainer>
                    <ForgotPasswordLink href="#" onClick={handleForgotPasswordClick}>
                        Forgot Password?
                    </ForgotPasswordLink>
                </LinkContainer>

              </LoginForm>
            </LoginFormContainer>
        </ContentWrapper>
        {/* --- Add this Block for Demo Credentials --- */}
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontSize: '0.85em',
            color: '#333',
            maxWidth: '300px',
            zIndex: 100
        }}>
            <h4 style={{margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>
                🔑 Demo Credentials
            </h4>
            <p style={{margin: '5px 0'}}><strong>Super Admin:</strong> superadmin / superadmin123</p>
            <p style={{margin: '5px 0'}}><strong>Company:</strong> (Select Any)</p>
            <hr style={{border: '0', borderTop: '1px solid #eee', margin: '10px 0'}}/>
            <p style={{margin: '5px 0'}}><strong>Employee:</strong> janesmith / user123</p>
            <p style={{margin: '5px 0'}}><strong>Company:</strong> Innovate Inc.</p>
        </div>
        {/* --- End Demo Block --- */}
        <footer style={{ 
            position: 'absolute', 
            bottom: '10px', 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '0.8em' 
        }}>
            Developed by Junade
        </footer>
    </HomePageContainer>
  );
};

export default HomePage;