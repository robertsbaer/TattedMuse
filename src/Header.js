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

  // Function to handle redirecting to the homepage
  const handleExit = () => {
    navigate("/"); // Redirect to the homepage
  };

  // Ensure we only navigate when the user data is fully loaded
  if (user === null) {
    return <p>Loading...</p>; // Add a loading spinner here if necessary
  }

  return (
    <HeaderContainer>
      {isAuthenticated ? (
        <>
          {/* If the user is on a dashboard, show the back arrow */}
          {location.pathname.includes("dashboard") ? (
            <DashboardButton onClick={handleExit}>
              <FaArrowLeft />
            </DashboardButton>
          ) : (
            <DashboardButton
              onClick={() =>
                user.email === adminEmail
                  ? navigate("/admin-dashboard")
                  : navigate(
                      data?.tattoo_artists.length > 0
                        ? "/dashboard"
                        : "/user-dashboard"
                    )
              }
            >
              <FaUserCircle />
            </DashboardButton>
          )}
        </>
      ) : (
        <>
          {/* If the user is on login or signup page, show the back arrow to go to home */}
          {location.pathname === "/login" || location.pathname === "/signup" ? (
            <DashboardButton onClick={handleExit}>
              <FaArrowLeft />
            </DashboardButton>
          ) : (
            <DashboardButton onClick={() => navigate("/signup")}>
              <FaSignInAlt />
            </DashboardButton>
          )}
        </>
      )}
    </HeaderContainer>
  );
};

export default Header;
