import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useUserData } from "@nhost/react";
import { useNavigate } from "react-router-dom";
import {
  GET_ALL_DATA,
  GET_ALL_USERS,
  DELETE_TATTOO_ARTIST,
  DELETE_INVITE,
  DELETE_WORK_IMAGE,
  DELETE_TATTOO_ARTIST_INTERACTIONS,
} from "./queries";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [artists, setArtists] = useState([]);
  const [invites, setInvites] = useState([]);
  const [users, setUsers] = useState([]);
  const [nonArtistUsersCount, setNonArtistUsersCount] = useState(0); // New state for non-artist users
  const user = useUserData();
  const navigate = useNavigate();
  const client = useApolloClient();

  const { data: artistData, refetch } = useQuery(GET_ALL_DATA);
  const { data: userData } = useQuery(GET_ALL_USERS);

  const [deleteTattooArtist] = useMutation(DELETE_TATTOO_ARTIST);
  const [deleteInvite] = useMutation(DELETE_INVITE);
  const [deleteWorkImage] = useMutation(DELETE_WORK_IMAGE);
  const [deleteArtistInteractions] = useMutation(
    DELETE_TATTOO_ARTIST_INTERACTIONS
  );

  useEffect(() => {
    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
    if (user && user.email !== adminEmail) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (artistData) {
      setArtists(artistData.tattoo_artists);
      setInvites(artistData.invite_codes);
    }
  }, [artistData]);

  useEffect(() => {
    if (userData && artistData) {
      setUsers(userData.users);
      setArtists(artistData.tattoo_artists);

      // Get all artist user_ids
      const artistUserIds = new Set(
        artistData.tattoo_artists.map((artist) => artist.user_id)
      );

      // Calculate non-artist users
      const nonArtistUsersCount = userData.users.filter(
        (user) => !artistUserIds.has(user.id)
      ).length;

      setNonArtistUsersCount(nonArtistUsersCount);
    }
  }, [userData, artistData]);

  const handleDeleteArtist = async (artistId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?"
    );
    if (confirmDelete) {
      try {
        const artistDeletionResult = await deleteTattooArtist({
          variables: { id: artistId },
        });

        if (!artistDeletionResult.data.delete_tattoo_artists_by_pk) {
          console.warn(
            "The artist could not be deleted. It may not exist, or there might be a backend constraint preventing deletion."
          );
          alert(
            "The artist could not be deleted. Please check for related records or backend constraints."
          );
          return;
        }

        client.cache.modify({
          fields: {
            tattoo_artists(existingArtists = [], { readField }) {
              return existingArtists.filter(
                (artistRef) => readField("id", artistRef) !== artistId
              );
            },
          },
        });

        setArtists((prevArtists) =>
          prevArtists.filter((artist) => artist.id !== artistId)
        );

        await refetch();
        console.log("Artist deleted successfully and cache updated.");
      } catch (error) {
        console.error("Error deleting the artist:", error);
        alert(
          "There was an error deleting the artist. Please check the console for details."
        );
      }
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    await deleteInvite({ variables: { id: inviteId } });
    refetch();
  };

  const handleDeleteWorkImage = async (imageUrl) => {
    try {
      await deleteWorkImage({ variables: { imageurl: imageUrl } });
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

      <div className="stats">
        <h2>Statistics</h2>
        <p>Total Artists: {artists.length}</p>
        <p>Total Non-Artist Users: {nonArtistUsersCount}</p>
      </div>

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

      <section id="invites-section" className="section">
        <h2>Invites</h2>
        <ul className="list">
          {invites
            .slice()
            .sort((a, b) => b.used - a.used)
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
