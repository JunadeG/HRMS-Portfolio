// GlobalStyles.jsx
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    // background-image: url('%PUBLIC_URL%/backgroundHRMS.jpg'); /* Correct path to your image */
    background-size: cover; /* Ensures the image covers the entire body */
    background-repeat: no-repeat; /* Prevents the image from tiling */
    background-attachment: fixed; /* Optional: keeps the background fixed during scrolling */
  }

  button {
    cursor: pointer;
  }

  /* You can add more global styles here, like colors, spacing,... */
`;

export default GlobalStyles;