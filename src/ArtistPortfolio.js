import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery, useMutation } from "@apollo/client";
import {
  FaArrowLeft,
  FaInstagram,
  FaTwitter,
  FaFacebook,
} from "react-icons/fa";
import { useUserData } from "@nhost/react"; // Import the missing hook
import {
  GET_ARTIST_BY_ID,
  INCREMENT_ADDRESS_CLICKS,
  INITIALIZE_INTERACTION_COUNTS,
  GET_ARTIST_INTERACTIONS,
  ADD_FAVORITE_ARTIST,
  UNLIKE_ARTIST,
  GET_USER_FAVORITE_ARTISTS,
} from "./queries";

const PortfolioContainer = styled.div`
  background-color: #121212;
  color: #ffffff;
  margin-top: 60px;
  padding: 20px;
  min-height: 100vh;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #e91e63;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }
`;

const ArtistDetails = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ArtistName = styled.h1`
  font-size: 2.5em;
  margin-bottom: 10px;
  color: #e91e63;
  font-weight: bold;
`;

const ArtistProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 15px 0;
  object-fit: cover;
  border: 3px solid #e91e63;
`;

const ArtistShopName = styled.p`
  font-size: 1.3em;
  color: #ffffff;
  margin-bottom: 5px;
`;

const ArtistLocation = styled.a`
  font-size: 1.5em;
  color: #e91e63;
  margin-bottom: 5px;
  display: block;
  text-decoration: none;
`;

const ArtistAddress = styled.a`
  font-size: 1.2em;
  color: #b0bec5;
  margin-bottom: 10px;
  display: block;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StylesContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const StyleTag = styled.span`
  background-color: #e91e63;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1em;
  margin: 5px;
  display: inline-block;
  cursor: default;
  transition: background-color 0.3s;
`;

const Gallery = styled.div`
  column-count: 2;
  column-gap: 5px;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const WorkImageWrapper = styled.div`
  cursor: pointer;
  break-inside: avoid;
  margin-bottom: 5px;
`;

const WorkImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 5px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const FullScreenImageWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const FullScreenImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 5px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  color: #ffffff;
  font-size: 2em;
  border: none;
  cursor: pointer;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 10px;
`;

const SocialIcon = styled.a`
  color: #e91e63;
  font-size: 2.5em;
`;

const LikeButton = styled.button`
  background-color: ${(props) => (props.liked ? "#45a049" : "#e91e63")};
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) =>
      props.liked || props.disabled ? "#388e3c" : "#ff4081"};
  }
`;

const ArtistPortfolio = () => {
  const [liked, setLiked] = useState(false);
  const [addFavoriteArtist] = useMutation(ADD_FAVORITE_ARTIST);
  const [unlikeArtist] = useMutation(UNLIKE_ARTIST); // Add the unlike mutation

  const user = useUserData();
  const userId = user ? user.id : null;

  const [incrementAddressClicks] = useMutation(INCREMENT_ADDRESS_CLICKS);
  const [initializeInteractionCounts] = useMutation(
    INITIALIZE_INTERACTION_COUNTS
  );

  const handleAddressClick = () => {
    incrementAddressClicks({
      variables: { artist_id: artistId },
    });
  };

  const { artistId } = useParams(); // Use artistId instead of id
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_ARTIST_BY_ID, {
    variables: { id: artistId }, // Use artistId here
  });

  const { data: interactionsData } = useQuery(GET_ARTIST_INTERACTIONS, {
    variables: { artist_id: artistId }, // Use artistId here
    onCompleted: (data) => {
      if (!data?.artist_interaction_counts_by_pk) {
        initializeInteractionCounts({
          variables: { artist_id: artistId }, // Use artistId here
        });
      }
    },
  });

  const handleLikeToggle = () => {
    if (!userId) {
      console.error("User is not logged in.");
      return;
    }

    if (liked) {
      unlikeArtist({
        variables: {
          user_id: userId,
          artist_id: artistId, // Use artistId here
        },
        update(cache, { data: { delete_user_favorite_artists } }) {
          const existingFavorites = cache.readQuery({
            query: GET_USER_FAVORITE_ARTISTS,
            variables: { user_id: userId },
          });

          const newFavorites = existingFavorites.user_favorite_artists.filter(
            (favorite) => favorite.tattoo_artist.id !== artistId // Use artistId here
          );

          cache.writeQuery({
            query: GET_USER_FAVORITE_ARTISTS,
            variables: { user_id: userId },
            data: { user_favorite_artists: newFavorites },
          });
        },
      }).then(() => {
        setLiked(false);
      });
    } else {
      addFavoriteArtist({
        variables: {
          user_id: userId,
          artist_id: artistId, // Use artistId here
        },
        update(cache, { data: { insert_user_favorite_artists_one } }) {
          const existingFavorites = cache.readQuery({
            query: GET_USER_FAVORITE_ARTISTS,
            variables: { user_id: userId },
          });

          const newFavorite = {
            tattoo_artist: {
              ...insert_user_favorite_artists_one.tattoo_artist,
            },
          };

          cache.writeQuery({
            query: GET_USER_FAVORITE_ARTISTS,
            variables: { user_id: userId },
            data: {
              user_favorite_artists: [
                ...existingFavorites.user_favorite_artists,
                newFavorite,
              ],
            },
          });
        },
      }).then(() => {
        setLiked(true);
      });
    }
  };

  const { data: favoriteData } = useQuery(GET_USER_FAVORITE_ARTISTS, {
    variables: { user_id: userId },
    skip: !userId,
    onCompleted: (favoriteData) => {
      const isArtistLiked = favoriteData?.user_favorite_artists?.some(
        (artist) => artist.tattoo_artist.id === artistId // Use artistId here
      );
      setLiked(isArtistLiked);
    },
  });

  const [fullScreenImage, setFullScreenImage] = useState(null);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading artist portfolio.</p>;

  const artist = data.tattoo_artists_by_pk;

  const handleImageClick = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  const handleCloseFullScreen = () => {
    setFullScreenImage(null);
  };

  return (
    <PortfolioContainer>
      <ArtistDetails>
        <LikeButton liked={liked} onClick={handleLikeToggle}>
          {liked ? "Remove Artist from Favorites" : "Save Artist"}
        </LikeButton>
        <ArtistName>{artist.name}</ArtistName>
        <ArtistProfileImage
          src={artist.imageurl}
          alt={`${artist.name}'s profile`}
        />
        <ArtistLocation>{artist.location}</ArtistLocation>
        <ArtistShopName>{artist.shop_name}</ArtistShopName>
        <ArtistAddress
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            artist.address
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAddressClick}
        >
          {artist.address}
        </ArtistAddress>
      </ArtistDetails>

      <SocialLinks>
        {artist.instagram && (
          <SocialIcon href={artist.instagram} target="_blank">
            <FaInstagram />
          </SocialIcon>
        )}
        {artist.twitter && (
          <SocialIcon href={artist.twitter} target="_blank">
            <FaTwitter />
          </SocialIcon>
        )}
        {artist.facebook && (
          <SocialIcon href={artist.facebook} target="_blank">
            <FaFacebook />
          </SocialIcon>
        )}
      </SocialLinks>

      <h3 style={{ textAlign: "center" }}>Tattoo Styles</h3>
      <StylesContainer>
        {artist.styles.map((style, index) => (
          <StyleTag key={index}>{style.style}</StyleTag>
        ))}
      </StylesContainer>

      <h3 style={{ textAlign: "center" }}>Portfolio</h3>
      <Gallery>
        {artist.work_images.map((image, index) => (
          <WorkImageWrapper
            key={index}
            onClick={() => handleImageClick(image.imageurl)}
          >
            <WorkImage src={image.imageurl} alt={`Work ${index + 1}`} />
          </WorkImageWrapper>
        ))}
      </Gallery>

      {fullScreenImage && (
        <FullScreenImageWrapper onClick={handleCloseFullScreen}>
          <FullScreenImage src={fullScreenImage} alt="Full screen view" />
          <CloseButton onClick={handleCloseFullScreen}>&times;</CloseButton>
        </FullScreenImageWrapper>
      )}
    </PortfolioContainer>
  );
};

export default ArtistPortfolio;
