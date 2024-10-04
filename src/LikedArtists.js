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
  width: 100%;
  max-width: 1200px;
`;

const ArtistCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ArtistImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 3px solid #e91e63;
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

const LikedArtists = () => {
  const user = useUserData();
  const userId = user ? user.id : null;

  // Fetch initial data with query
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_USER_FAVORITE_ARTISTS, {
    variables: { user_id: userId },
    skip: !userId,
  });

  // Subscribe to real-time updates
  const { data: subscriptionData } = useSubscription(
    SUBSCRIBE_USER_FAVORITE_ARTISTS,
    {
      variables: { user_id: userId },
      skip: !userId,
    }
  );

  const [unlikeArtist] = useMutation(UNLIKE_ARTIST, {
    update(cache, { data }) {
      if (
        !data ||
        !data.delete_user_favorite_artists ||
        !data.delete_user_favorite_artists.returning.length
      ) {
        console.error("Error: No artists returned from the unlike mutation.");
        return;
      }

      const existingData = cache.readQuery({
        query: GET_USER_FAVORITE_ARTISTS,
        variables: { user_id: userId },
      });

      if (existingData && existingData.user_favorite_artists) {
        const newFavorites = existingData.user_favorite_artists.filter(
          (favorite) =>
            favorite.tattoo_artist.id !==
            data.delete_user_favorite_artists.returning[0].artist_id
        );

        // Write the new list back to the cache
        cache.writeQuery({
          query: GET_USER_FAVORITE_ARTISTS,
          variables: { user_id: userId },
          data: { user_favorite_artists: newFavorites },
        });
      }
    },
  });

  useEffect(() => {
    if (queryError) {
      console.error("Error fetching liked artists:", queryError);
    }
  }, [queryError]);

  useEffect(() => {
    if (subscriptionData) {
      console.log("Subscription Data Updated:", subscriptionData);
    }
  }, [subscriptionData]);

  const handleUnlike = async (artistId) => {
    try {
      await unlikeArtist({
        variables: { user_id: userId, artist_id: artistId },
      });
    } catch (error) {
      console.error("Error unliking artist:", error);
    }
  };

  // Use subscription data if available, otherwise fallback to query data
  const favoriteArtists =
    subscriptionData?.user_favorite_artists ||
    queryData?.user_favorite_artists ||
    [];

  if (queryLoading) return <p>Loading liked artists...</p>;
  if (queryError) return <p>Error loading liked artists.</p>;

  return (
    <div>
      <h2>Your Favorite Artists</h2>
      {favoriteArtists.length > 0 ? (
        <FavoriteArtistsGrid>
          {favoriteArtists.map(({ tattoo_artist }) => (
            <ArtistCard key={tattoo_artist.id}>
              <Link to={`/portfolio/${tattoo_artist.id}`}>
                <ArtistImage
                  src={tattoo_artist.imageurl}
                  alt={tattoo_artist.name}
                />
                <ArtistName>{tattoo_artist.name}</ArtistName>
                <ArtistLocation>{tattoo_artist.location}</ArtistLocation>
                <ArtistLocation>Shop: {tattoo_artist.shop_name}</ArtistLocation>

                {/* Social media links */}
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
              </Link>

              {/* Unlike button */}
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
