import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { useAuthenticated } from "@nhost/react"; // Assuming Nhost for authentication

const HeaderContainer = styled.header`
  color: #ffffff;
  padding: 2px;
  text-align: center;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
`;

const SignupButton = styled(Link)`
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #e91e63;
  color: #ffffff;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1em;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }
`;

const DashboardButton = styled(Link)`
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #e91e63; /* Green for dashboard */
  color: #ffffff;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1em;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e91e63;
  }
`;

const Header = () => {
  const isAuthenticated = useAuthenticated(); // Check if the user is signed in
  const location = useLocation(); // Get current route

  // If the current path is "/dashboard", do not render the header
  if (location.pathname === "/dashboard") {
    return null;
  }
  if (location.pathname.startsWith("/portfolio")) {
    return null;
  }

  return (
    <HeaderContainer>
      {isAuthenticated ? (
        <DashboardButton to="/dashboard">Go to Dashboard</DashboardButton>
      ) : (
        <SignupButton to="/signup">Showcase your work / login</SignupButton>
      )}
    </HeaderContainer>
  );
};

export default Header;
