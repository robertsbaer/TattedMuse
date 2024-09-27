// src/ArtistPortfolio.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import { FaArrowLeft } from "react-icons/fa";
import { GET_ARTIST_BY_ID } from "./queries";

const PortfolioContainer = styled.div`
  background-color: #121212;
  color: #ffffff;
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

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const WorkImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
`;

const ArtistPortfolio = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_ARTIST_BY_ID, {
    variables: { id: artistId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading artist portfolio.</p>;

  const artist = data.tattoo_artists_by_pk;

  return (
    <PortfolioContainer>
      <BackButton onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </BackButton>
      <h1>{artist.name}</h1>
      <p>{artist.location}</p>
      <p>{artist.address}</p>
      <h3>Tattoo Styles</h3>
      {artist.styles.map((style, index) => (
        <span key={index}>{style.style}</span>
      ))}
      <h3>Portfolio</h3>
      <Gallery>
        {artist.work_images.map((image, index) => (
          <WorkImage
            key={index}
            src={image.imageurl}
            alt={`Work ${index + 1}`}
          />
        ))}
      </Gallery>
    </PortfolioContainer>
  );
};

export default ArtistPortfolio;
