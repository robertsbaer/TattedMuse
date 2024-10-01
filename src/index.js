// index.js

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NhostProvider } from "@nhost/react";
import nhost from "./nhost";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* Global scrollbar styling */

  /* For WebKit browsers (Chrome, Safari, Edge) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px; /* For horizontal scrollbar */
  }

  ::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  ::-webkit-scrollbar-thumb {
    background: #e91e63;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #d81b60;
  }

  /* For Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #e91e63 #1e1e1e;
  }

  /* Optional: Hide scrollbar in IE and older browsers */
  /* Adjust as needed based on your browser support requirements */
`;

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GlobalStyle />
    <NhostProvider nhost={nhost}>
      <App />
    </NhostProvider>
  </React.StrictMode>
);

reportWebVitals();
