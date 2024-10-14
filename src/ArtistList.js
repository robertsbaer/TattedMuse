import { useQuery } from "@apollo/client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ArtistProfile from "./ArtistProfile";
import { GET_FILTERED_ARTISTS } from "./queries";
import SearchBar from "./SearchBar";

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
  const loadingMoreRef = useRef(false);
  const limit = 10;

  const normalizedSearchTerm = searchTerm
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const { loading, error, data, fetchMore } = useQuery(GET_FILTERED_ARTISTS, {
    variables: {
      searchTerm: `%${normalizedSearchTerm}%`,
      limit,
      offset: page * limit,
    },
    fetchPolicy: "cache-first", // Use cache-first to reduce network requests
  });

  useEffect(() => {
    if (data && data.tattoo_artists) {
      setArtists((prevArtists) =>
        page === 0
          ? data.tattoo_artists
          : [...prevArtists, ...data.tattoo_artists]
      );
    }
  }, [data, page]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const loadMoreArtists = async () => {
    if (loadingMoreRef.current) return;
    
    loadingMoreRef.current = true;
    await fetchMore({
      variables: {
        offset: (page + 1) * limit, // Adjust offset based on the next page
      },
    });
    setPage((prevPage) => prevPage + 1);
    loadingMoreRef.current = false;
  };
  
  const handleScroll = useCallback(
    debounce(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMoreArtists();
      }
    }, 200),
    [loadMoreArtists]
  );
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  

  const resetPage = () => {
    setPage(0);
    setArtists([]);
  };

  if (loading && artists.length === 0) return <p>Loading...</p>;
  if (error) return <p>Error loading artists.</p>;

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
      </ListContainer>
    </PageContainer>
  );
};

export default ArtistList;
