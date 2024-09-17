// src/apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import nhost from "./nhost";

const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(),
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
