// ArtistProfile.jsx

import React from "react";
import styled from "styled-components";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useMutation, useQuery } from "@apollo/client";
import {
  INCREMENT_PORTFOLIO_VIEW,
  GET_ARTIST_INTERACTIONS,
  INITIALIZE_INTERACTION_COUNTS,
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

const ViewCount = styled.div`
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #e91e63;
  padding: 8px 16px;
  border-radius: 5px;
  font-size: 1em;
  font-weight: bold;
  text-align: center;
  width: fit-content;
`;

const ArtistProfile = ({
  id,
  name,
  location,
  shop_name,
  instagram,
  twitter,
  facebook,
  imageurl,
  work_images = [],
  styles = [],
}) => {
  const [incrementPortfolioView] = useMutation(INCREMENT_PORTFOLIO_VIEW);
  const [initializeInteractionCounts] = useMutation(
    INITIALIZE_INTERACTION_COUNTS
  );

  const { data, loading, error } = useQuery(GET_ARTIST_INTERACTIONS, {
    variables: { artist_id: id },
    onCompleted: (data) => {
      if (!data?.artist_interaction_counts_by_pk) {
        initializeInteractionCounts({
          variables: { artist_id: id },
        });
      }
    },
  });

  if (loading) return <p>Loading interactions...</p>;
  if (error) return <p>Error loading interactions...</p>;

  const portfolioViews =
    data?.artist_interaction_counts_by_pk?.portfolio_views || 0;

  const handlePortfolioClick = () => {
    incrementPortfolioView({
      variables: { artist_id: id },
    });
  };

  return (
    <ProfileContainer>
      <ArtistImage src={imageurl} alt={`${name}'s profile`} />
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
      {/* <ViewCount>{`Portfolio Views: ${portfolioViews}`}</ViewCount> */}
      <PortfolioLink to={`/portfolio/${id}`} onClick={handlePortfolioClick}>
        View Portfolio
      </PortfolioLink>
    </ProfileContainer>
  );
};

export default ArtistProfile;
