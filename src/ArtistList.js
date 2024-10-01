import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ArtistProfile from "./ArtistProfile";
import SearchBar from "./SearchBar";
import { useQuery } from "@apollo/client";
import { GET_FILTERED_ARTISTS } from "./queries"; // Ensure your query uses _ilike

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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;

  // Normalize the search term
  const normalizedSearchTerm = searchTerm
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const { loading, error, data } = useQuery(GET_FILTERED_ARTISTS, {
    variables: {
      searchTerm: `%${normalizedSearchTerm}%`,
      limit,
      offset: page * limit,
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const resetPage = () => {
    setPage(0); // Reset page when search is cleared
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading artists.</p>;

  const filteredArtists = data.tattoo_artists;

  return (
    <PageContainer>
      <ListContainer>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          resetPage={resetPage}
        />
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
