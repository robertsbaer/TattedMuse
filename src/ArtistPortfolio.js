import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import { FaArrowLeft } from "react-icons/fa";
import { GET_ARTIST_BY_ID } from "./queries";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";

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

const ArtistLocation = styled.p`
  font-size: 1.5em;
  color: #e91e63;
  margin-bottom: 5px;
`;

const ArtistAddress = styled.p`
  font-size: 1.2em;
  color: #b0bec5;
  margin-bottom: 10px;
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
  column-count: 2; /* Create two columns */
  column-gap: 5px; /* Gap between columns */
  padding: 20px;
  max-width: 800px; /* Adjust the max-width as needed */
  margin: 0 auto; /* Center the gallery */
`;

const WorkImageWrapper = styled.div`
  cursor: pointer;
  break-inside: avoid; /* Prevent images from breaking across columns */
  margin-bottom: 5px; /* Space between images */
`;

const WorkImage = styled.img`
  width: 100%; /* Image fills the column width */
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

const ArtistPortfolio = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_ARTIST_BY_ID, {
    variables: { id: artistId },
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
      <BackButton onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </BackButton>

      <ArtistDetails>
        <ArtistName>{artist.name}</ArtistName>
        <ArtistProfileImage
          src={artist.imageurl}
          alt={`${artist.name}'s profile`}
        />
        <ArtistLocation>{artist.location}</ArtistLocation>
        <ArtistAddress>{artist.address}</ArtistAddress>
      </ArtistDetails>

      {/* Add the social media section here */}
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
