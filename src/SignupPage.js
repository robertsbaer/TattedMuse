import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUpEmailPassword, useAuthenticationStatus } from "@nhost/react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  padding-right: 40px;
  padding-bottom: 40px;
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
`;

const FormField = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: #fff;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #3b3b3b;
  color: #fff;
`;

const Button = styled.button`
  background-color: #e91e63;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }
`;

const StyledLinkButton = styled(Link)`
  background-color: #e91e63;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none; /* Remove underline */
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`;

const SuccessMessage = styled.p`
  color: green;
  margin-top: 10px;
`;

const SignupPage = () => {
  const { isAuthenticated } = useAuthenticationStatus();
  const [error, setError] = useState("");
  const { signUpEmailPassword, isLoading } = useSignUpEmailPassword();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async (email, password) => {
    try {
      const { error } = await signUpEmailPassword(email, password);
      if (error) {
        setError(error.message);
      } else {
        setError("");
        alert("Sign-up successful!");
        navigate("/dashboard");
      }
    } catch (signupError) {
      setError("Error during sign-up: " + signupError.message);
    }
  };

  const BackButton = styled.button`
    position: absolute;
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

  return (
    <FormContainer>
      <BackButton onClick={() => navigate("/")}>
        <FaArrowLeft />
      </BackButton>
      <h2 style={{ color: "#fff" }}>Sign Up</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const password = e.target.password.value;
          handleSignup(email, password);
        }}
      >
        <FormField>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Email"
          />
        </FormField>
        <FormField>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            required
            placeholder="Password"
          />
        </FormField>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <div style={{ marginTop: "20px" }}>
        <p style={{ color: "#fff" }}>Already have an account? </p>
        <StyledLinkButton to="/login">Login here</StyledLinkButton>
      </div>

      {isAuthenticated && (
        <div style={{ marginTop: "20px" }}>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      )}
    </FormContainer>
  );
};

export default SignupPage;
