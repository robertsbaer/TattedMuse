import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useUserData } from "@nhost/react";
import { useNavigate } from "react-router-dom";
import {
  GET_ALL_DATA,
  DELETE_TATTOO_ARTIST,
  DELETE_INVITE,
  DELETE_WORK_IMAGE,
  DELETE_TATTOO_ARTIST_INTERACTIONS, // Correct mutation
} from "./queries";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [artists, setArtists] = useState([]);
  const [invites, setInvites] = useState([]);
  const user = useUserData();
  const navigate = useNavigate();

  const { data, refetch } = useQuery(GET_ALL_DATA);
  const [deleteTattooArtist] = useMutation(DELETE_TATTOO_ARTIST);
  const [deleteInvite] = useMutation(DELETE_INVITE);
  const [deleteWorkImage] = useMutation(DELETE_WORK_IMAGE);
  const [deleteArtistInteractions] = useMutation(
    DELETE_TATTOO_ARTIST_INTERACTIONS
  ); // Correct mutation

  useEffect(() => {
    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL; // Fetch admin email from .env
    if (user && user.email !== adminEmail) {
      navigate("/"); // Redirect non-admins
    }
  }, [user, navigate]);

  useEffect(() => {
    if (data) {
      setArtists(data.tattoo_artists);
      setInvites(data.invite_codes);
    }
  }, [data]);

  const handleDeleteArtist = async (artistId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?"
    );
    if (confirmDelete) {
      try {
        // Delete interactions first
        await deleteArtistInteractions({ variables: { artist_id: artistId } });

        // Then delete the artist
        await deleteTattooArtist({ variables: { id: artistId } });

        refetch();
      } catch (error) {
        console.error("Error deleting the artist:", error);
      }
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    await deleteInvite({ variables: { id: inviteId } });
    refetch();
  };

  const handleDeleteWorkImage = async (imageUrl) => {
    try {
      await deleteWorkImage({
        variables: { imageurl: imageUrl },
      });
      refetch();
    } catch (error) {
      console.error("Error deleting the image:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

      <button
        className="jump-button"
        onClick={() =>
          document.getElementById("invites-section").scrollIntoView()
        }
      >
        Jump to Invites
      </button>

      {/* Tattoo Artists Section */}
      <section className="section">
        <h2>Tattoo Artists</h2>
        <ul className="list">
          {artists.map((artist) => (
            <li key={artist.id} className="artist-item">
              <p>
                <strong>Name:</strong> {artist.name}
              </p>
              <p>
                <strong>Location:</strong> {artist.location}
              </p>
              <p>
                <strong>Address:</strong> {artist.address}
              </p>
              <p>
                <strong>Shop:</strong> {artist.shop_name}
              </p>
              <p>
                <strong>Social: </strong>
                <a
                  href={artist.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                ,{" "}
                <a
                  href={artist.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
                ,{" "}
                <a
                  href={artist.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </p>
              <h3>Work Images</h3>
              <ul className="work-images">
                {artist.work_images.map((image) => (
                  <li key={image.imageurl} className="work-image-item">
                    <img
                      src={image.imageurl}
                      alt="Work"
                      className="work-image"
                    />
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteWorkImage(image.imageurl)}
                    >
                      Delete Image
                    </button>
                  </li>
                ))}
              </ul>
              <div className="button-container">
                <button
                  className="delete-user-button"
                  onClick={() => handleDeleteArtist(artist.id)}
                >
                  Delete Artist
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Invites Section */}
      <section id="invites-section" className="section">
        <h2>Invites</h2>
        <ul className="list">
          {invites
            .slice()
            .sort((a, b) => b.used - a.used) // Sort by used status (true/false)
            .map((invite) => (
              <li key={invite.id} className="invite-item">
                <p>
                  <strong>Status:</strong> {invite.used ? "Used" : "Not Used"}
                </p>
                <p>
                  <strong>Code:</strong> {invite.code}
                </p>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteInvite(invite.id)}
                >
                  Delete Invite
                </button>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;
