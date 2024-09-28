// src/ArtistList.js
import React, { useState } from "react";
import styled from "styled-components";
import ArtistProfile from "./ArtistProfile";
import SearchBar from "./SearchBar";
import { useQuery } from "@apollo/client";
import { GET_ARTISTS } from "./queries";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ListContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 90px;
`;

const ArtistList = () => {
  const { loading, error, data } = useQuery(GET_ARTISTS);
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading artists.</p>;

  const filteredArtists = data.tattoo_artists.filter((artist) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Trim spaces only for styles
    const trimmedSearchTerm = lowerCaseSearchTerm.trim();

    return (
      artist.name.toLowerCase().includes(lowerCaseSearchTerm) || // Do not trim for name
      artist.location.toLowerCase().includes(lowerCaseSearchTerm) || // Do not trim for city
      artist.styles.some(
        (style) => style.style.toLowerCase().includes(trimmedSearchTerm) // Trim for styles
      )
    );
  });

  return (
    <PageContainer>
      <ListContainer>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {filteredArtists.length > 0 ? (
          filteredArtists.map((artist) => (
            <ArtistProfile key={artist.id} {...artist} />
          ))
        ) : (
          <p>No artists found matching your search.</p>
        )}
      </ListContainer>
    </PageContainer>
  );
};

export default ArtistList;
