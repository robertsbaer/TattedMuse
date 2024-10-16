import React from "react";
import styled from "styled-components";

const AdWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
`;

const AdContainer = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  position: relative; /* For positioning the h1 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const AdLabel = styled.h1`
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #e91e63;
  background-color: rgba(
    0,
    0,
    0,
    0.7
  ); /* Semi-transparent background for contrast */
  padding: 5px 10px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const AdTitle = styled.h2`
  color: #e91e63;
  text-align: center;
`;

const AdImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 15px;
`;

const AdLink = styled.a`
  color: #ffffff;
  background-color: #e91e63;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  margin-top: 15px;
  display: block;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }
`;

const AdCard = ({ ad }) => {
  return (
    <AdWrapper>
      <AdContainer>
        <AdLabel>Ad</AdLabel> {/* Styled and positioned at the top-right */}
        <AdTitle>{ad.title}</AdTitle>
        <p>{ad.text}</p>
        <AdImage src={ad.image_url} alt="Ad" />
        <AdLink
          href={ad.external_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Site
        </AdLink>
      </AdContainer>
    </AdWrapper>
  );
};

export default AdCard;
