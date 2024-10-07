// src/LoginPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignInEmailPassword, useUserData } from "@nhost/react";
import { useLazyQuery } from "@apollo/client";
import { GET_TATTOO_ARTIST_BY_USER_ID } from "./queries";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #121212;
  color: #ffffff;

  @media (max-width: 768px) {
    justify-content: flex-start;
    padding-top: 70px;
    width: 100%;
  }
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 90vw;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: none;
  background-color: #333333;
  color: #ffffff;
  font-size: 1em;

  &:focus {
    outline: none;
    background-color: #444444;
  }

  @media (max-width: 768px) {
    padding: 15px;
    font-size: 1.2em;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: none;
  background-color: #e91e63;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1em;

  &:hover {
    background-color: #ff4081;
  }

  @media (max-width: 768px) {
    padding: 15px;
    font-size: 1.1em;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4081;
  margin-top: 10px;
  font-size: 1em;

  @media (max-width: 768px) {
    font-size: 1.1em;
  }
`;

const BackButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  background-color: #e91e63;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signInEmailPassword, isLoading } = useSignInEmailPassword();
  const user = useUserData();
  const navigate = useNavigate();

  // Lazy query to fetch artist data after login
  const [getArtistData, { data: artistData, called, loading: artistLoading }] =
    useLazyQuery(GET_TATTOO_ARTIST_BY_USER_ID);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await signInEmailPassword(email, password);

    if (error) {
      setError("Invalid email or password");
      return;
    }

    // Trigger the artist query once the user has logged in successfully
    if (user?.id) {
      getArtistData({ variables: { user_id: user.id } });
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Query artist data if user is logged in
      getArtistData({ variables: { user_id: user.id } });
    }
  }, [user, getArtistData]);

  useEffect(() => {
    // Redirect based on the artist data
    if (artistData && artistData.tattoo_artists.length > 0) {
      // Artist is found, redirect to dashboard
      navigate("/dashboard");
    } else if (called && !artistLoading && user) {
      // No artist found, redirect to user dashboard
      navigate("/user-dashboard");
    }
  }, [artistData, called, artistLoading, user, navigate]);

  return (
    <LoginContainer>
      <h1>Login</h1>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <LoginForm onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading || artistLoading}>
          {isLoading || artistLoading ? "Logging in..." : "Login"}
        </Button>
        <div style={{ marginTop: "20px" }}>
          <p style={{ color: "#fff" }}>Don't have an account?</p>
          <Link to="/signup">
            <Button>Register</Button>
          </Link>
        </div>
      </LoginForm>
      <Link to="/ad-info">
        <Button>Advertise With Us</Button>
      </Link>
    </LoginContainer>
  );
};

export default LoginPage;
