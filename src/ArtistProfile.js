// ArtistProfile.jsx

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useMutation, useQuery } from "@apollo/client";
import { useUserData } from "@nhost/react"; // Import Nhost hook for user data
import {
  INCREMENT_PORTFOLIO_VIEW,
  GET_ARTIST_INTERACTIONS,
  INITIALIZE_INTERACTION_COUNTS,
  ADD_FAVORITE_ARTIST,
  GET_USER_FAVORITE_ARTISTS,
} from "./queries";

const ProfileContainer = styled.div`
  width: 33%;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  max-width: 90vw;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ArtistImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 15px;
  object-fit: cover;
  border: 3px solid #e91e63;
`;

const ArtistName = styled.h2`
  color: #e91e63;
  margin-bottom: 10px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const SocialIcon = styled.a`
  color: #ffffff;
  font-size: 24px;
`;

const PortfolioLink = styled(Link)`
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #e91e63;
  color: #ffffff;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
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
`;

const WorkImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  flex-shrink: 0;
  scroll-snap-align: start;
`;

const StyledSimpleBar = styled(SimpleBar)`
  .simplebar-track.simplebar-horizontal {
    height: 8px;
    background: #1e1e1e;
  }

  .simplebar-scrollbar::before {
    background-color: #e91e63;
    border-radius: 4px;
  }

  .simplebar-scrollbar.simplebar-visible::before {
    opacity: 1;
  }
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

const ArtistProfile = ({
  id,
  name,
  location,
  instagram,
  twitter,
  facebook,
  imageurl,
  work_images = [],
  styles = [],
}) => {
  const [liked, setLiked] = useState(false);
  const [incrementPortfolioView] = useMutation(INCREMENT_PORTFOLIO_VIEW);
  const [addFavoriteArtist] = useMutation(ADD_FAVORITE_ARTIST);
  const [initializeInteractionCounts] = useMutation(
    INITIALIZE_INTERACTION_COUNTS
  );

  const user = useUserData();
  const userId = user ? user.id : null;

  const {
    data: interactionsData,
    loading,
    error,
  } = useQuery(GET_ARTIST_INTERACTIONS, {
    variables: { artist_id: id },
    onCompleted: (data) => {
      if (!data?.artist_interaction_counts_by_pk) {
        // Initialize the interaction count if it doesn't exist
        initializeInteractionCounts({
          variables: { artist_id: id },
        });
      }
    },
  });

  const { data: favoriteData } = useQuery(GET_USER_FAVORITE_ARTISTS, {
    variables: { user_id: userId },
    skip: !userId, // Don't run the query if the user is not logged in
    onCompleted: (favoriteData) => {
      const isArtistLiked = favoriteData?.user_favorite_artists?.some(
        (artist) => artist.tattoo_artist.id === id
      );
      setLiked(isArtistLiked);
    },
  });

  if (loading) return <p>Loading interactions...</p>;
  if (error) return <p>Error loading interactions...</p>;

  const handleLike = () => {
    if (!userId) {
      console.error("User is not logged in.");
      return;
    }

    if (liked) {
      console.log("Artist already liked.");
      return;
    }

    // Add artist to user's favorites
    addFavoriteArtist({
      variables: {
        user_id: userId,
        artist_id: id,
      },
      update(cache, { data: { insert_user_favorite_artists_one } }) {
        const existingFavorites = cache.readQuery({
          query: GET_USER_FAVORITE_ARTISTS,
          variables: { user_id: userId },
        });

        const newFavorite = {
          tattoo_artist: {
            ...insert_user_favorite_artists_one.tattoo_artist, // Ensure this matches your returned data structure
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
      setLiked(true); // Immediately reflect the like in the UI
    });
  };

  const portfolioViews =
    interactionsData?.artist_interaction_counts_by_pk?.portfolio_views || 0;

  return (
    <ProfileContainer>
      <ArtistImage src={imageurl} alt={`${name}'s profile`} />
      <LikeButton liked={liked} disabled={liked} onClick={handleLike}>
        {liked ? "Liked" : "Like Artist"}
      </LikeButton>
      <ArtistName>{name}</ArtistName>
      <p>{location}</p>
      <h3>Styles</h3>
      <StylesContainer>
        {styles.length > 0 ? (
          styles.map((style, index) => (
            <StyleTag key={index}>{style.style}</StyleTag>
          ))
        ) : (
          <p>No styles listed</p>
        )}
      </StylesContainer>
      <SocialLinks>
        {instagram && (
          <SocialIcon
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </SocialIcon>
        )}
        {twitter && (
          <SocialIcon href={twitter} target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </SocialIcon>
        )}
        {facebook && (
          <SocialIcon href={facebook} target="_blank" rel="noopener noreferrer">
            <FaFacebook />
          </SocialIcon>
        )}
      </SocialLinks>
      <StyledSimpleBar
        style={{ width: "100%", maxWidth: "500px", height: "180px" }}
        forceVisible="x"
        autoHide={false}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "10px 0",
            scrollSnapType: "x mandatory",
          }}
        >
          {work_images.slice(0, 10).map((image, index) => (
            <WorkImage
              key={index}
              src={image.imageurl}
              alt={`Work ${index + 1}`}
            />
          ))}
        </div>
      </StyledSimpleBar>
      <PortfolioLink
        to={`/portfolio/${id}`}
        onClick={() => incrementPortfolioView({ variables: { artist_id: id } })}
      >
        View Portfolio
      </PortfolioLink>
    </ProfileContainer>
  );
};

export default ArtistProfile;
