import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { useAuthenticated } from "@nhost/react"; // Assuming Nhost for authentication
import { FaUserCircle, FaSignInAlt } from "react-icons/fa"; // FontAwesome icons for user and login

const HeaderContainer = styled.header`
  color: #ffffff;
  padding: 10px;
  text-align: left; /* Move header to the left */
  position: absolute;
  top: 0;
  left: 0;
  width: 100px; /* Adjust width as necessary */
`;

const IconButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center; /* Center the icon */
  margin: 10px 0;
  padding: 10px;
  background-color: #e91e63; /* Default background color */
  color: #ffffff;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1.2em;
  transition: background-color 0.3s;
  width: 50px; /* Adjust size to fit the icon */
  height: 50px;

  &:hover {
    background-color: #ff4081; /* Hover color */
  }

  svg {
    font-size: 24px; /* Adjust icon size */
  }
`;

// For signed-up users (Dashboard)
const DashboardButton = styled(IconButton)`
  background-color: #e91e63; /* Keep the original dashboard button color */
  &:hover {
    background-color: #45a049;
  }
`;

const Header = () => {
  const isAuthenticated = useAuthenticated(); // Check if the user is signed in
  const location = useLocation(); // Get current route

  // Only render the button on the homepage
  if (location.pathname !== "/") {
    return null;
  }

  return (
    <HeaderContainer>
      {isAuthenticated ? (
        <DashboardButton to="/dashboard">
          <FaUserCircle />
        </DashboardButton>
      ) : (
        <IconButton to="/signup">
          <FaSignInAlt />
        </IconButton>
      )}
    </HeaderContainer>
  );
};

export default Header;
