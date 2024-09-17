// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { useAuthenticationStatus, useSignOut } from "@nhost/react";
import client from "./apolloClient";
import TattooArtists from "./TattooArtists";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuthenticationStatus();

  return (
    <ApolloProvider client={client}>
      <Router>
        <Header isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/" element={<TattooArtists />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

function Header({ isAuthenticated }) {
  const { signOut } = useSignOut();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>
        Home
      </Link>
      {isAuthenticated ? (
        <>
          <Link to="/dashboard" style={styles.link}>
            Dashboard
          </Link>
          <button onClick={signOut} style={styles.button}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/signup" style={styles.link}>
            Signup
          </Link>
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </>
      )}
    </nav>
  );
}

function PrivateRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default App;

const styles = {
  nav: {
    padding: "10px",
    backgroundColor: "#333",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  link: {
    color: "#fff",
    marginRight: "15px",
    textDecoration: "none",
  },
  button: {
    backgroundColor: "#fff",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },
};
