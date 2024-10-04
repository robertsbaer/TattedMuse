import React from "react";
import styled from "styled-components";
import LikedArtists from "./LikedArtists"; // Component to display liked artists
import Header from "./Header";
import { useSignOut } from "@nhost/react"; // Import the sign-out hook
import { useNavigate } from "react-router-dom"; // For navigation

const DashboardContainer = styled.div`
  background-color: #121212;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px; /* Adjust for header height */
`;

const SignOutButton = styled.button`
  background-color: #e91e63;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;

  &:hover {
    background-color: #ff4081;
  }
`;

const UserDashboard = () => {
  const { signOut } = useSignOut(); // Hook to handle sign-out
  const navigate = useNavigate(); // Hook to navigate the user

  // Function to handle sign-out and redirect to login page
  const handleSignOut = async () => {
    await signOut();
    navigate("/login"); // Redirect to login page after sign-out
  };

  return (
    <DashboardContainer>
      <Header />
      <h1>My Likes</h1>
      <LikedArtists />
      {/* Add the sign-out button */}
      <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
    </DashboardContainer>
  );
};

export default UserDashboard;
