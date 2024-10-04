import React from "react";
import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthenticated, useUserData } from "@nhost/react"; // Assuming Nhost for authentication
import { FaArrowLeft, FaUserCircle, FaSignInAlt } from "react-icons/fa"; // FontAwesome icons for back, user, and login

const HeaderContainer = styled.header`
  color: #ffffff;
  padding: 10px;
  text-align: left; /* Move header to the left */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* Ensure it's on top */
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center; /* Center the icon */
  margin: 10px 0;
  padding: 10px;
  background-color: #e91e63; /* Default background color */
  color: #ffffff;
  text-decoration: none;
  border: none;
  border-radius: 5px;
  font-size: 1.2em;
  transition: background-color 0.3s;
  width: 50px; /* Adjust size to fit the icon */
  height: 50px;
  cursor: pointer;

  &:hover {
    background-color: #ff4081; /* Hover color */
  }

  svg {
    font-size: 24px; /* Adjust icon size */
  }
`;

const DashboardButton = styled(Link)`
  background-color: #e91e63;
  color: #ffffff;
  text-decoration: none;
  padding: 10px;
  border-radius: 5px;
  font-size: 1.2em;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;

  &:hover {
    background-color: #45a049;
  }
`;

const Header = () => {
  const isAuthenticated = useAuthenticated(); // Check if the user is signed in
  const user = useUserData(); // Get the logged-in user's data
  const location = useLocation(); // Get current route
  const navigate = useNavigate(); // For back button navigation

  const isOnPortfolio = location.pathname.startsWith("/portfolio"); // Check if user is viewing an artist's portfolio
  const isOnUserDashboard = location.pathname === "/user-dashboard";

  const handleBackButton = () => {
    if (isAuthenticated) {
      navigate("/"); // Redirect to home if user is logged in
    } else {
      navigate(-1); // Go back in history if user is not logged in
    }
  };

  return (
    <HeaderContainer>
      {isOnPortfolio || isOnUserDashboard ? (
        // Render back button when on the artist portfolio or user dashboard
        <IconButton onClick={handleBackButton}>
          <FaArrowLeft />
        </IconButton>
      ) : isAuthenticated ? (
        // Render dashboard button when authenticated and not on the portfolio or dashboard
        <DashboardButton
          to={user?.role === "artist" ? "/dashboard" : "/user-dashboard"}
        >
          <FaUserCircle />
        </DashboardButton>
      ) : (
        // Render login/signup button when not authenticated
        <DashboardButton to="/signup">
          <FaSignInAlt />
        </DashboardButton>
      )}
    </HeaderContainer>
  );
};

export default Header;
