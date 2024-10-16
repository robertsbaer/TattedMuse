import React, { useEffect } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import {
  GET_USER_FAVORITE_ARTISTS,
  SUBSCRIBE_USER_FAVORITE_ARTISTS,
  UNLIKE_ARTIST,
} from "./queries";
import { useUserData } from "@nhost/react";
import styled from "styled-components";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom";

const FavoriteArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
  width: 100vw;
  margin: 10px auto;
  max-width: 1200px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Full width for mobile */
    padding: 10px; /* Adjust padding for mobile */
  }
`;

const ArtistCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    width: 90vw; /* Full width of the screen */
    margin: 0 10px; /* Add a small margin around the card */
    padding: 5vw; /* Slightly reduce padding for mobile */
  }
`;

const ArtistImage = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 3px solid #e91e63;

  @media (max-width: 768px) {
    width: 160px; /* Smaller image for mobile */
    height: 160px;
  }
`;

const ArtistName = styled.h2`
  color: #e91e63;
  margin-bottom: 10px;
`;

const ArtistLocation = styled.p`
  color: #b0bec5;
  margin-bottom: 10px;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
`;

const SocialIcon = styled.a`
  color: #e91e63;
  font-size: 1.5em;
  transition: color 0.3s;

  &:hover {
    color: #ff4081;
  }
`;

const UnlikeButton = styled.button`
  background-color: #ff4081;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;

  &:hover {
    background-color: #e91e63;
  }
`;

const StyledHeading = styled.h2`
  text-align: center; /* Center horizontally */
  font-size: 2em; /* Increase font size */
  font-weight: bold;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #ff4081, #e91e63);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; /* Gradient text effect */
  padding: 10px;
  letter-spacing: 1px;
  text-transform: uppercase; /* Make text uppercase for more impact */
  animation: fadeIn 2s ease-in-out; /* Optional animation for appearance */

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LikedArtists = () => {
  const user = useUserData();
  const userId = user ? user.id : null;

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_USER_FAVORITE_ARTISTS, {
    variables: { user_id: userId },
    skip: !userId,
  });

  const { data: subscriptionData } = useSubscription(
    SUBSCRIBE_USER_FAVORITE_ARTISTS,
    { variables: { user_id: userId }, skip: !userId }
  );

  const [unlikeArtist] = useMutation(UNLIKE_ARTIST, {
    update(cache, { data }) {
      if (!data || !data.delete_user_favorite_artists) {
        console.error("No data returned from unlike mutation.");
        return;
      }

      cache.modify({
        fields: {
          user_favorite_artists(existingFavoritesRefs = [], { readField }) {
            return existingFavoritesRefs.filter(
              (favoriteRef) =>
                readField("id", favoriteRef.tattoo_artist) !==
                data.delete_user_favorite_artists.returning[0].artist_id
            );
          },
        },
      });
    },
  });

  const handleUnlike = async (artistId) => {
    try {
      await unlikeArtist({
        variables: { user_id: userId, artist_id: artistId },
        // Option 1: Modify the cache directly
        update(cache, { data }) {
          const artistId =
            data.delete_user_favorite_artists.returning[0].artist_id;

          cache.modify({
            fields: {
              user_favorite_artists(existingFavoritesRefs = [], { readField }) {
                return existingFavoritesRefs.filter(
                  (favoriteRef) =>
                    readField("id", favoriteRef.tattoo_artist) !== artistId
                );
              },
            },
          });
        },
        // Option 2: Refetch queries after mutation
        refetchQueries: [
          {
            query: GET_USER_FAVORITE_ARTISTS,
            variables: { user_id: userId },
          },
        ],
      });
    } catch (error) {
      console.error("Error unliking artist:", error);
    }
  };

  // Use subscription data if available, otherwise fallback to query data
  let favoriteArtists =
    subscriptionData?.user_favorite_artists ||
    queryData?.user_favorite_artists ||
    [];

  // Filter out duplicate entries by their unique artist ID
  favoriteArtists = favoriteArtists.filter(
    (artist, index, self) =>
      index ===
      self.findIndex((a) => a.tattoo_artist.id === artist.tattoo_artist.id)
  );

  if (queryLoading) return <p>Loading liked artists...</p>;
  if (queryError) return <p>Error loading liked artists.</p>;

  return (
    <div>
      <StyledHeading>Your Favorite Artists</StyledHeading>

      {favoriteArtists.length > 0 ? (
        <FavoriteArtistsGrid>
          {favoriteArtists.map(({ tattoo_artist }) => (
            <ArtistCard key={tattoo_artist.id}>
              {/* Link to artist portfolio */}
              <Link to={`/portfolio/${tattoo_artist.id}`}>
                <ArtistImage
                  src={tattoo_artist.imageurl}
                  alt={tattoo_artist.name}
                />
                <ArtistName>{tattoo_artist.name}</ArtistName>
                <ArtistLocation>{tattoo_artist.shop_name}</ArtistLocation>
                <ArtistLocation>{tattoo_artist.address}</ArtistLocation>
              </Link>

              {/* Social media links outside of the Link component */}
              <SocialLinks>
                {tattoo_artist.instagram && (
                  <SocialIcon href={tattoo_artist.instagram} target="_blank">
                    <FaInstagram />
                  </SocialIcon>
                )}
                {tattoo_artist.twitter && (
                  <SocialIcon href={tattoo_artist.twitter} target="_blank">
                    <FaTwitter />
                  </SocialIcon>
                )}
                {tattoo_artist.facebook && (
                  <SocialIcon href={tattoo_artist.facebook} target="_blank">
                    <FaFacebook />
                  </SocialIcon>
                )}
              </SocialLinks>

              <UnlikeButton onClick={() => handleUnlike(tattoo_artist.id)}>
                Unlike
              </UnlikeButton>
            </ArtistCard>
          ))}
        </FavoriteArtistsGrid>
      ) : (
        <p>You haven't liked any artists yet.</p>
      )}
    </div>
  );
};

export default LikedArtists;
