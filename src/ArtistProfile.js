import React from "react";
import styled from "styled-components";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProfileContainer = styled.div`
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  max-width: 80vw;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
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

const Gallery = styled.div`
  display: flex;
  overflow-x: auto; /* Enables horizontal scrolling */
  gap: 10px;
  padding: 10px 0;
  width: 100%; /* Ensures the gallery fills the card width */
  max-width: 500px; /* Ensures a limited display area for 3 images */
  scroll-snap-type: x mandatory; /* Snap for smooth scrolling */
  scrollbar-width: thin;
  scrollbar-color: #e91e63 #1e1e1e; /* Customize scrollbar colors */

  ::-webkit-scrollbar {
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #e91e63;
    border-radius: 10px;
    border: 2px solid #1e1e1e;
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
  flex-shrink: 0; /* Ensures the images stay the same size */
  scroll-snap-align: start; /* Snap to image */
`;

const ArtistProfile = ({
  id,
  name,
  location,
  instagram,
  twitter,
  facebook,
  imageurl, // This must receive the updated imageurl
  work_images = [],
  styles = [], // Make sure to reference the "styles" prop
}) => {
  return (
    <ProfileContainer>
      <ArtistImage src={imageurl} alt={`${name}'s profile`} />{" "}
      {/* Display the updated profile image */}
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
          <SocialIcon href={instagram} target="_blank">
            <FaInstagram />
          </SocialIcon>
        )}
        {twitter && (
          <SocialIcon href={twitter} target="_blank">
            <FaTwitter />
          </SocialIcon>
        )}
        {facebook && (
          <SocialIcon href={facebook} target="_blank">
            <FaFacebook />
          </SocialIcon>
        )}
      </SocialLinks>
      <Gallery>
        {work_images.slice(0, 10).map((image, index) => (
          <WorkImage
            key={index}
            src={image.imageurl}
            alt={`Work ${index + 1}`}
          />
        ))}
      </Gallery>
      <PortfolioLink to={`/portfolio/${id}`}>View Portfolio</PortfolioLink>
    </ProfileContainer>
  );
};

export default ArtistProfile;
