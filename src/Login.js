import React, { useState, useEffect } from "react";
import { useSignInEmailPassword, useUserData } from "@nhost/react"; // Added useUserData
import { useNavigate } from "react-router-dom";
import { useAuthenticationStatus } from "@nhost/react";

function Login() {
  const { isAuthenticated } = useAuthenticationStatus();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInEmailPassword, isLoading, error } = useSignInEmailPassword();
  const user = useUserData(); // Get the logged-in user's data

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      if (user?.role === "artist") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/user-dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signInEmailPassword(email, password);
  };

  return (
    <div>
      <h2>Login</h2>
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
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
