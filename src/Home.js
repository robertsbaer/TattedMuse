import React from "react";
import { useQuery } from "@apollo/client";
import { gql } from "graphql-tag";

const GET_TATTOO_ARTISTS = gql`
  query GetTattooArtists {
    tattoo_artists {
      id
      name
      location
      imageurl
    }
  }
`;

function Home() {
  const { loading, error, data } = useQuery(GET_TATTOO_ARTISTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Tattoo Artists</h1>
      <ul>
        {data.tattoo_artists.map((artist) => (
          <li key={artist.id}>
            <img src={artist.imageurl} alt={artist.name} />
            <h3>{artist.name}</h3>
            <p>{artist.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
