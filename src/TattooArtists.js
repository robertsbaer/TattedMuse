// src/TattooArtists.js
import React from "react";
import { useQuery } from "@apollo/client";
import { GET_TATTOO_ARTISTS } from "./queries";

function TattooArtists() {
  const { loading, error, data } = useQuery(GET_TATTOO_ARTISTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <div>
      {data.tattoo_artists.map((artist) => (
        <div key={artist.id}>
          <h2>{artist.name}</h2>
          <img src={artist.imageurl} alt={artist.name} width="200" />
          <p>
            <strong>Address:</strong> {artist.address}
          </p>
          <p>
            <strong>Location:</strong> {artist.location}
          </p>
          {/* Other artist details */}
          <hr />
        </div>
      ))}
    </div>
  );
}

export default TattooArtists;
