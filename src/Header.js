import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthenticated, useUserData } from "@nhost/react";
import { useQuery } from "@apollo/client";
import { FaUserCircle, FaSignInAlt, FaArrowLeft } from "react-icons/fa"; // Import the arrow icon
import { GET_TATTOO_ARTIST_BY_USER_ID } from "./queries";

const HeaderContainer = styled.header`
  color: #ffffff;
  padding: 10px;
  text-align: left;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
`;

const DashboardButton = styled.button`
  background-color: #e91e63;
  color: #ffffff;
  text-decoration: none;
  padding: 10px;
  border-radius: 5px;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const Header = () => {
  const isAuthenticated = useAuthenticated();
  const user = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useQuery(GET_TATTOO_ARTIST_BY_USER_ID, {
    variables: { user_id: user?.id },
    skip: !user,
    fetchPolicy: "cache-first",
  });

  const adminEmail = "robertsbaer@gmail.com";

  const handleExit = () => {
    navigate("/"); // Redirect to the homepage
  };

  if (location.pathname === "/login" || location.pathname === "/signup") {
    return (
      <HeaderContainer>
        <DashboardButton onClick={handleExit}>
          <FaArrowLeft />
        </DashboardButton>
      </HeaderContainer>
    );
  }

  // Ensure proper navigation logic for admin and non-admin users
  return (
    <HeaderContainer>
      {isAuthenticated ? (
        <>
          {location.pathname.includes("dashboard") ? (
            <DashboardButton onClick={handleExit}>
              <FaArrowLeft />
            </DashboardButton>
          ) : (
            <DashboardButton
              onClick={() => {
                // Ensure admin check is done first
                if (user.email === adminEmail) {
                  navigate("/admin-dashboard");
                } else if (data?.tattoo_artists.length > 0) {
                  navigate("/dashboard");
                } else {
                  navigate("/user-dashboard");
                }
              }}
            >
              <FaUserCircle />
            </DashboardButton>
          )}
        </>
      ) : (
        <>
          <DashboardButton onClick={() => navigate("/signup")}>
            <FaSignInAlt />
          </DashboardButton>
        </>
      )}
    </HeaderContainer>
  );
};

export default Header;
