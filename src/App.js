// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { NhostClient, NhostProvider, useUserData } from "@nhost/react";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import ArtistList from "./ArtistList";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import ArtistPortfolio from "./ArtistPortfolio";
import UserDashboard from "./UserDashboard";
import AdInfo from "./AdInfo";
import AdminDashboard from "./AdminDashboard";
import Header from "./Header";
import { useQuery } from "@apollo/client";
import { GET_TATTOO_ARTIST_BY_USER_ID } from "./queries";
import styled from "styled-components";

const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
  region: process.env.REACT_APP_NHOST_REGION,
});

const AppContainer = styled.div`
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: "Arial", sans-serif;
`;

// ProtectedRoute component to handle role-based routing for the artist
const ProtectedRouteForArtist = ({ element: Component, ...rest }) => {
  const user = useUserData();
  const { data, loading } = useQuery(GET_TATTOO_ARTIST_BY_USER_ID, {
    variables: { user_id: user?.id },
    skip: !user?.id,
  });

  if (loading) return <p>Loading...</p>; // Add a loading state
  if (data && data.tattoo_artists.length > 0) {
    return <Component {...rest} />;
  }
  return <Navigate to="/user-dashboard" />;
};

// ProtectedRoute component to handle role-based routing for the user
const ProtectedRouteForUser = ({ element: Component, ...rest }) => {
  const user = useUserData();
  const { data, loading } = useQuery(GET_TATTOO_ARTIST_BY_USER_ID, {
    variables: { user_id: user?.id },
    skip: !user?.id,
  });

  if (loading) return <p>Loading...</p>; // Add a loading state
  if (!data || data.tattoo_artists.length === 0) {
    return <Component {...rest} />;
  }
  return <Navigate to="/dashboard" />;
};

const App = () => {
  const user = useUserData();

  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={client}>
        <AppContainer>
          <Router basename="/TattedMuse">
            <Header />
            <Routes>
              <Route path="/" element={<ArtistList />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/portfolio/:artistId"
                element={<ArtistPortfolio />}
              />
              {/* Protect artist and user dashboards */}
              {user ? (
                <>
                  <Route
                    path="/dashboard"
                    element={<ProtectedRouteForArtist element={Dashboard} />}
                  />
                  <Route
                    path="/user-dashboard"
                    element={<ProtectedRouteForUser element={UserDashboard} />}
                  />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                </>
              ) : (
                // <Route path="*" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              )}
              <Route path="/ad-info" element={<AdInfo />} />
            </Routes>
          </Router>
        </AppContainer>
      </ApolloProvider>
    </NhostProvider>
  );
};

export default App;
