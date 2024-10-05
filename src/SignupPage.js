import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUpEmailPassword, useAuthenticationStatus } from "@nhost/react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { VALIDATE_INVITE_CODE, MARK_INVITE_CODE_USED } from "./queries"; // Import necessary GraphQL queries
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #121212;
  color: #ffffff;
`;

const FormContainer = styled.div`
  max-width: 600px;
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
  const [validateInviteCode, { data }] = useLazyQuery(VALIDATE_INVITE_CODE);

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
        <BackButton onClick={() => navigate("/")}>
          <FaArrowLeft />
        </BackButton>
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

        <div style={{ marginTop: "20px" }}>
          <p style={{ color: "#fff" }}>Already have an account?</p>
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
    </SignupContainer>
  );
};

export default SignupPage;
