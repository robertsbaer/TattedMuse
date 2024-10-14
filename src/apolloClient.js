import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { setContext } from "@apollo/client/link/context";
import nhost from "./nhost";

// Create a batched HTTP link to your GraphQL endpoint
const batchLink = new BatchHttpLink({
  uri: "https://idfwcavlnilnvkccmzvp.graphql.us-east-1.nhost.run/v1",
  batchMax: 10, // Maximum of 10 queries per batch
  batchInterval: 20, // 20ms batching interval
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

// Initialize Apollo Client with batch link
const client = new ApolloClient({
  link: ApolloLink.from([authLink, batchLink]), // Use batchLink instead of httpLink
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
