import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUpEmailPassword, useAuthenticationStatus } from "@nhost/react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { VALIDATE_INVITE_CODE, MARK_INVITE_CODE_USED } from "./queries"; // Import necessary GraphQL queries
import styled from "styled-components";
import { Link } from "react-router-dom";

const SignupContainer = styled.div`
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

const FormContainer = styled.div`
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

const FormField = styled.div`
  width: 100%;
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: #fff;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 1.2em;
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
  color: white;
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

const StyledLinkButton = styled(Link)`
  width: 50%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  background-color: #e91e63;
  color: white;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
  font-size: 1em;
  margin-bottom: 20px;

  &:hover {
    background-color: #ff4081;
  }

  @media (max-width: 768px) {
    padding: 15px;
    font-size: 1.1em;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;

  @media (max-width: 768px) {
    font-size: 1.1em;
  }
`;

const SignupPage = () => {
  const { isAuthenticated } = useAuthenticationStatus();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isArtist, setIsArtist] = useState(false); // New state to check if the user is an artist
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const { signUpEmailPassword, isLoading } = useSignUpEmailPassword();
  const navigate = useNavigate();

  // Use useLazyQuery to manually validate invite code
  const [validateInviteCode] = useLazyQuery(VALIDATE_INVITE_CODE);

  // Mutation for marking the invite code as used
  const [markInviteCodeUsed] = useMutation(MARK_INVITE_CODE_USED);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check if the URL contains an invite code
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCodeFromURL = urlParams.get("inviteCode");

    if (inviteCodeFromURL) {
      setInviteCode(inviteCodeFromURL);
      setIsArtist(true); // Automatically check "Sign up as an artist"
    }
  }, []);

  const handleSignup = async (email, password, inviteCode) => {
    try {
      // If the user is an artist, validate the invite code
      if (isArtist) {
        const { data } = await validateInviteCode({
          variables: { code: inviteCode },
        });
        if (!data.invite_codes.length || data.invite_codes[0].used) {
          setError("Invalid or used invite code");
          return;
        }
      }

      // Proceed with signing up the user
      const { error } = await signUpEmailPassword(email, password);
      if (error) {
        setError(error.message);
      } else {
        // If the user is an artist, mark the invite code as used
        if (isArtist) {
          await markInviteCodeUsed({ variables: { code: inviteCode } });
        }

        // Redirect the user to the appropriate dashboard
        navigate(isArtist ? "/dashboard" : "/user-dashboard");
      }
    } catch (signupError) {
      setError("Error during sign-up: " + signupError.message);
    }
  };

  return (
    <SignupContainer>
      <FormContainer>
        <h2 style={{ color: "#fff" }}>Sign Up</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            handleSignup(email, password, inviteCode);
          }}
        >
          <FormField>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </FormField>
          <FormField>
            <Label>
              <input
                type="checkbox"
                checked={isArtist}
                onChange={() => setIsArtist(!isArtist)}
              />
              Sign up as an artist
            </Label>
          </FormField>

          {isArtist && (
            <FormField>
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                type="text"
                id="inviteCode"
                name="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required={isArtist} // Require invite code only for artists
                placeholder="Enter your invite code"
              />
            </FormField>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <p style={{ color: "#fff" }}>Already have an account?</p>
        <StyledLinkButton to="/login">Login here</StyledLinkButton>

        {isAuthenticated && (
          <div style={{ marginTop: "20px" }}>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </FormContainer>
    </SignupContainer>
  );
};

export default SignupPage;
