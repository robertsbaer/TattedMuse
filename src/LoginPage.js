// src/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignInEmailPassword } from "@nhost/react";
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
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: none;
  background-color: #333333;
  color: #ffffff;

  &:focus {
    outline: none;
    background-color: #444444;
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

  &:hover {
    background-color: #ff4081;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4081;
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
`;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signInEmailPassword, isLoading } = useSignInEmailPassword();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await signInEmailPassword(email, password);

    if (error) {
      setError("Invalid email or password");
      return;
    }

    // On successful login, redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <LoginContainer>
      <BackButton onClick={() => navigate("/")}>
        <FaArrowLeft />
      </BackButton>
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </LoginForm>
      <Link to="/ad-info">
        <Button>Advertise With Us</Button>
      </Link>
    </LoginContainer>
  );
};

export default LoginPage;
