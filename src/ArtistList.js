import { useQuery } from "@apollo/client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ArtistProfile from "./ArtistProfile";
import { GET_FILTERED_ARTISTS, GET_ADS } from "./queries";
import SearchBar from "./SearchBar";
import AdCard from "./AdCard";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const ListContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center; /* Centering the content horizontally */
  padding-top: 90px;
`;

const ArtistWrapper = styled.div`
  width: 100%;
  max-width: 800px; /* Set a maximum width to prevent them from being too wide */
  margin-bottom: 20px; /* Add spacing between artist cards */
  display: flex;
  justify-content: center; /* Center the artist cards */
`;

const ArtistList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [artists, setArtists] = useState([]);
  const [ads, setAds] = useState([]);
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
    fetchPolicy: "cache-first",
  });

  const { data: adData } = useQuery(GET_ADS); // Fetching ads

  useEffect(() => {
    if (data && data.tattoo_artists) {
      setArtists((prevArtists) =>
        page === 0
          ? data.tattoo_artists
          : [...prevArtists, ...data.tattoo_artists]
      );
    }

    if (adData && adData.ads) {
      const now = new Date(); // Get the current local time

      const validAds = adData.ads.filter((ad) => {
        const expirationDate = new Date(ad.expiration_date);
        return expirationDate > now; // Compare expiration date with current local time
      });

      setAds(validAds);
    }
  }, [data, adData, page]);

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
    }, 500),
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
          artists.map((artist, index) => (
            <React.Fragment key={artist.id}>
              <ArtistWrapper>
                <ArtistProfile {...artist} />
              </ArtistWrapper>
              {/* Show an ad after every 9 artists or if there's only 1 artist */}
              {((artists.length === 1 && index === 0) || index % 9 === 8) &&
              ads.length > 0 ? (
                <AdCard ad={ads[index % ads.length]} />
              ) : null}
            </React.Fragment>
          ))
        ) : (
          <p>No artists found matching your search.</p>
        )}
      </ListContainer>
    </PageContainer>
  );
};

export default ArtistList;
