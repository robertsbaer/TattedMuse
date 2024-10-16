import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { NhostClient, NhostProvider, useUserData } from "@nhost/react";
import { ApolloProvider, useQuery } from "@apollo/client"; // Import useQuery here
import client from "./apolloClient";
import ArtistList from "./ArtistList";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import ArtistPortfolio from "./ArtistPortfolio";
import UserDashboard from "./UserDashboard";
import AddAds from "./AddAds";
import AdInfo from "./AdInfo";
import AdminDashboard from "./AdminDashboard";
import Header from "./Header";
import { GET_TATTOO_ARTIST_BY_USER_ID } from "./queries"; // Import the query here
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

// Admin Protected Route
const ProtectedRouteForAdmin = ({ element: Component, ...rest }) => {
  const user = useUserData();
  const adminEmail = "robertsbaer@gmail.com"; // Add the admin email here

  // Check if the user is logged in and has the admin email
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.email !== adminEmail) {
    return <Navigate to="/" />;
  }

  // If the user is an admin, render the component
  return <Component {...rest} />;
};

// Protect routes based on artist roles
const ProtectedRouteForArtist = ({ element: Component, ...rest }) => {
  const user = useUserData();
  const { data, loading } = useQuery(GET_TATTOO_ARTIST_BY_USER_ID, {
    variables: { user_id: user?.id },
    skip: !user?.id,
    fetchPolicy: "cache-first",
  });

  if (loading) return <p>Loading...</p>;
  if (data && data.tattoo_artists.length > 0) {
    return <Component {...rest} />;
  }
  return <Navigate to="/user-dashboard" />;
};

const ProtectedRouteForUser = ({ element: Component, ...rest }) => {
  const user = useUserData();
  const { data, loading } = useQuery(GET_TATTOO_ARTIST_BY_USER_ID, {
    variables: { user_id: user?.id },
    skip: !user?.id,
    fetchPolicy: "cache-first",
  });

  if (loading) return <p>Loading...</p>;
  if (!data || data.tattoo_artists.length === 0) {
    return <Component {...rest} />;
  }
  return <Navigate to="/dashboard" />;
};

const App = () => {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={client}>
        <AppContainer>
          <Router>
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
              <Route
                path="/dashboard"
                element={<ProtectedRouteForArtist element={Dashboard} />}
              />
              <Route
                path="/user-dashboard"
                element={<ProtectedRouteForUser element={UserDashboard} />}
              />

              {/* Admin Dashboard and Create Ad with Protected Route */}
              <Route
                path="/admin-dashboard"
                element={<ProtectedRouteForAdmin element={AdminDashboard} />}
              />
              <Route
                path="/create-ad"
                element={<ProtectedRouteForAdmin element={AddAds} />}
              />

              <Route path="/ad-info" element={<AdInfo />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </Router>
        </AppContainer>
      </ApolloProvider>
    </NhostProvider>
  );
};

export default App;
