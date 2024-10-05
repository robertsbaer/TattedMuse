import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import nhost from "./nhost";

// Create an HTTP link to your GraphQL endpoint
const httpLink = createHttpLink({
  uri: "https://idfwcavlnilnvkccmzvp.graphql.us-east-1.nhost.run/v1",
});

// Set up authentication link to include JWT in headers, only if the token exists
const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}), // Only include the header if the token exists
    },
  };
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          user_favorite_artists: {
            keyArgs: ["where"],
            merge(existing = [], incoming, { readField }) {
              const merged = existing ? existing.slice(0) : [];
              incoming.forEach((incomingItem) => {
                const exists = merged.some(
                  (existingItem) =>
                    readField("id", existingItem) ===
                    readField("id", incomingItem)
                );
                if (!exists) {
                  merged.push(incomingItem);
                }
              });
              return merged;
            },
            remove(existing = [], { readField }, artistId) {
              return existing.filter(
                (favorite) => readField("id", favorite) !== artistId
              );
            },
          },
        },
      },
    },
  }),
});

export default client;
