// import React, { useState } from 'react';
// import styled from 'styled-components';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate

// const PopupOverlay = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-color: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   z-index: 1000;
//   display: ${(props) => (props.isOpen ? 'flex' : 'none')};
// `;

// const PopupContainer = styled.div`
//   position: relative;
//   background-color: white;
//   padding: 20px;
//   border-radius: 5px;
//   width: 400px;
// `;

// const LoginForm = styled.form`
//   display: flex;
//   flex-direction: column;

//   input {
//     margin-bottom: 10px;
//     padding: 8px;
//   }

//   button {
//     padding: 10px;
//     background-color:rgb(0, 0, 0);
//     color: white;
//     border: none;
//     border-radius: 5px;
//     cursor: pointer;
//   }
// `;

// const CloseButton = styled.button`
//   position: absolute;
//   top: 10px;
//   right: 10px;
//   background: none;
//   border: none;
//   font-size: 20px;
//   cursor: pointer;
//   color: #555;
// `;

// const SuccessMessage = styled.div`
//   text-align: center;
//   padding: 20px;
// `;

// const LoginPopup = ({ isOpen, onClose, onRegisterClick, onLoginSuccess }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loginError, setLoginError] = useState('');
//   const [loginSuccess, setLoginSuccess] = useState(false);
//   const [company, setCompany] = useState('');
//   const [loginAs, setLoginAs] = useState('user');
//   const navigate = useNavigate(); // Initialize navigate

//   const companies = [
//     { id: 1, name: 'Company A' },
//     { id: 2, name: 'Company B' },
//     { id: 3, name: 'Company C' },
//   ];

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch('http://localhost:8080/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: username,
//           password: password,
//           company: companies.find(c => c.id === parseInt(company)).name,
//           loginAs: loginAs,
//         }),
//       });

//       const contentType = response.headers.get('content-type');
//       if (contentType && contentType.includes('application/json')) {
//         const data = await response.json();
//         if (response.ok) {
//           const jwtToken = data.token;
//           localStorage.setItem('jwtToken', jwtToken);
//           console.log('Login successful');
//           setLoginSuccess(true);
//           setLoginError('');

//           //  **1. Call onLoginSuccess**
//           onLoginSuccess(); //  Notify App.jsx of login success

//           //  **2. Navigate to Dashboard**
//           navigate('/user-dashboard'); //  Programmatically navigate

//         } else {
//           let errorMessage = data.error || 'Login failed';
//           if (errorMessage.includes('User not found')) {
//             errorMessage =
//               'Invalid User ID or password. If you just registered, please wait for admin approval.';
//           }
//           setLoginError(errorMessage);
//           setLoginSuccess(false);
//           console.error('Login failed:', data.error);
//         }
//       } else {
//         const errorText = await response.text();
//         setLoginError(errorText || 'Login failed');
//         setLoginSuccess(false);
//         console.error('Login failed:', errorText);
//       }
//     } catch (error) {
//       setLoginError('Network error or server unavailable');
//       setLoginSuccess(false);
//       console.error('Network error:', error);
//     }
//   };

//   return (
//     <PopupOverlay isOpen={isOpen}>
//       <PopupContainer>
//         <CloseButton onClick={onClose}>&times;</CloseButton>
//         {loginSuccess ? (
//           <SuccessMessage>
//             <h2>Signing Out</h2>
//           </SuccessMessage>
//         ) : (
//           <>
//             <h2>Login</h2>
//             {loginError && (
//               <div style={{ color: 'red', marginBottom: '10px' }}>
//                 {loginError}
//               </div>
//             )}
//             <LoginForm onSubmit={handleLogin}>
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 autoComplete="username"
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 autoComplete="current-password"
//               />
//               <select
//                 value={company}
//                 onChange={(e) => setCompany(e.target.value)}
//                 style={{ marginBottom: '10px', padding: '8px' }}
//               >
//                 <option value="">Select Company</option>
//                 {companies.map((company) => (
//                   <option key={company.id} value={company.id}>
//                     {company.name}
//                   </option>
//                 ))}
//               </select>
//               <select
//                 value={loginAs}
//                 onChange={(e) => setLoginAs(e.target.value)}
//                 style={{ marginBottom: '10px', padding: '8px' }}
//               >
//                 <option value="user">User</option>
//                 <option value="admin">Admin</option>
//               </select>
//               <button type="submit">Login</button>
//             </LoginForm>
//           </>
//         )}
//       </PopupContainer>
//     </PopupOverlay>
//   );
// };

// export default LoginPopup;