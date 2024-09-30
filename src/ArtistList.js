// src/ArtistList.js
import React, { useState } from "react";
import styled from "styled-components";
import ArtistProfile from "./ArtistProfile";
import SearchBar from "./SearchBar";
import { useQuery } from "@apollo/client";
import { GET_FILTERED_ARTISTS } from "./queries"; // Updated query

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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const Button = styled.button`
  padding: 10px;
  margin: 0 10px;
  background-color: #e91e63;
  color: white;
  border: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ArtistList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0); // New state for pagination
  const limit = 10; // Number of artists per page

  const { loading, error, data } = useQuery(GET_FILTERED_ARTISTS, {
    variables: { searchTerm: `%${searchTerm}%`, limit, offset: page * limit }, // Pass pagination and search term
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading artists.</p>;

  const filteredArtists = data.tattoo_artists;

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
      <Pagination>
        <Button onClick={() => setPage(page - 1)} disabled={page === 0}>
          Previous
        </Button>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={filteredArtists.length < limit}
        >
          Next
        </Button>
      </Pagination>
    </PageContainer>
  );
};

export default ArtistList;
