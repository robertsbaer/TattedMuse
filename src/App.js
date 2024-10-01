// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { NhostClient, NhostProvider } from "@nhost/react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import ArtistList from "./ArtistList";
import ArtistPortfolio from "./ArtistPortfolio";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import Header from "./Header";
import styled from "styled-components";

// Initialize Nhost client with your subdomain and region
const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
  region: process.env.REACT_APP_NHOST_REGION,
});

// Create an HTTP link to your GraphQL endpoint
const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(),
});

// Initialize Apollo Client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
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

const App = () => {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <AppContainer>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<ArtistList />} />
              <Route path="*" element={<h2>Page Not Found</h2>} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/portfolio/:artistId"
                element={<ArtistPortfolio />}
              />
            </Routes>
          </Router>
        </AppContainer>
      </ApolloProvider>
    </NhostProvider>
  );
};

export default App;
