// src/Signup.js
import React, { useState, useEffect } from "react";
import { useSignUpEmailPassword } from "@nhost/react";
import { useNavigate } from "react-router-dom";
import { useAuthenticationStatus } from "@nhost/react";

function Signup() {
  const { isAuthenticated } = useAuthenticationStatus();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUpEmailPassword, isLoading, error } = useSignUpEmailPassword();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signUpEmailPassword(email, password);
  };

  return (
    <div>
      <h2>Signup</h2>
      {error && <p>Error: {error.message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
