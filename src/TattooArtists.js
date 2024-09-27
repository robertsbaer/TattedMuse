import React from "react";
import { useQuery } from "@apollo/client";
import { GET_TATTOO_ARTISTS } from "./queries";
import "./TattooArtists.css";

function TattooArtists() {
  const { loading, error, data } = useQuery(GET_TATTOO_ARTISTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <div className="container">
      {data.tattoo_artists.map((artist) => (
        <div className="artist-card" key={artist.id}>
          <img
            src={artist.imageurl}
            alt={artist.name}
            className="profile-img"
          />
          <div className="artist-info">
            <h3 className="artist-name">{artist.name}</h3>
            <p className="artist-location">{artist.location}</p>
          </div>
          <div className="style-tags">
            {artist.styles.map((style) => (
              <div className="style-tag" key={style.id}>
                {style.style}
              </div>
            ))}
          </div>
          <div className="image-gallery">
            {artist.work_images.map((image) => (
              <img key={image.id} src={image.imageurl} alt="Tattoo Work" />
            ))}
          </div>
          <button className="view-portfolio">View Portfolio</button>
        </div>
      ))}
    </div>
  );
}

export default TattooArtists;
