import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import nhost from "./nhost";

const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(),
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          user_favorite_artists: {
            keyArgs: ["where"], // Handle different queries
            merge(existing = [], incoming, { readField }) {
              const merged = existing ? existing.slice(0) : [];

              // Add incoming data if not already present
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
            // Custom function to handle cache deletion properly
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
