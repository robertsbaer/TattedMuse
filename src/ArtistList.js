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
  const [artists, setArtists] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 10;

  // Normalize the search term
  const normalizedSearchTerm = searchTerm
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const { loading, error, data, fetchMore } = useQuery(GET_FILTERED_ARTISTS, {
    variables: {
      searchTerm: `%${normalizedSearchTerm}%`,
      limit,
      offset: 0, // Start with the first set of results
    },
  });

  useEffect(() => {
    if (data && data.tattoo_artists) {
      setArtists(data.tattoo_artists);
    }
  }, [data]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const resetPage = () => {
    setPage(0);
    setArtists([]); // Clear the current artist list
  };

  const loadMoreArtists = () => {
    setLoadingMore(true);
    fetchMore({
      variables: {
        offset: artists.length, // Load next batch based on current number of artists
        limit,
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prevResult;
        setLoadingMore(false);
        setArtists([...artists, ...fetchMoreResult.tattoo_artists]);
      },
    });
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      loadMoreArtists();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [artists]);

  if (loading && artists.length === 0) return <p>Loading...</p>;
  if (error) {
    console.error("Error fetching artists:", error);
    return <p>Error loading artists.</p>;
  }

  return (
    <PageContainer>
      <ListContainer>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          resetPage={resetPage}
        />
        {artists.length > 0 ? (
          artists.map((artist) => <ArtistProfile key={artist.id} {...artist} />)
        ) : (
          <p>No artists found matching your search.</p>
        )}
        {loadingMore && <p>Loading more artists...</p>}
      </ListContainer>
    </PageContainer>
  );
};

export default ArtistList;
