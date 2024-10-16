import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useUserData } from "@nhost/react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import {
  GET_ALL_USERS,
  GET_FILTERED_ARTISTS,
  DELETE_TATTOO_ARTIST,
  DELETE_INVITE,
  DELETE_WORK_IMAGE,
} from "./queries";
import "./AdminDashboard.css";
import ExpiredAdsList from "./ExpiredAdsList";
import { useSignOut } from "@nhost/react"; // Import the sign-out hook

const SignOutButton = styled.button`
  background-color: #e91e63;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff0000;
  }
`;

const AdminDashboard = () => {
  const [artists, setArtists] = useState([]);
  const [invites, setInvites] = useState([]);
  const [users, setUsers] = useState([]);
  const [nonArtistUsersCount, setNonArtistUsersCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [totalArtists, setTotalArtists] = useState(0);
  const [limit, setLimit] = useState(10); // Limit the number of artists per page
  const [offset, setOffset] = useState(0); // Keep track of the current offset
  const user = useUserData();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { signOut } = useSignOut();

  const { data: userData } = useQuery(GET_ALL_USERS);

  const [deleteTattooArtist] = useMutation(DELETE_TATTOO_ARTIST);
  const [deleteInvite] = useMutation(DELETE_INVITE);
  const [deleteWorkImage] = useMutation(DELETE_WORK_IMAGE);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login"); // Redirect to login page after sign-out
  };

  const {
    data: artistData,
    loading,
    fetchMore,
  } = useQuery(GET_FILTERED_ARTISTS, {
    variables: { searchTerm: `%${searchQuery}%`, limit, offset },
  });

  // useEffect(() => {
  //   const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
  //   if (user && user.email !== adminEmail) {
  //     navigate("/");
  //   }
  // }, [user, navigate]);

  useEffect(() => {
    if (artistData) {
      setArtists(artistData.tattoo_artists);
      setTotalArtists(artistData.tattoo_artists_aggregate.aggregate.count); // Set total count
    }
  }, [artistData]);

  useEffect(() => {
    if (userData && artistData) {
      setUsers(userData.users);
      setArtists(artistData.tattoo_artists);

      const artistUserIds = new Set(
        artistData.tattoo_artists.map((artist) => artist.user_id)
      );

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
    console.log("Invite deleted successfully.");
  };

  const handleDeleteWorkImage = async (imageUrl) => {
    try {
      await deleteWorkImage({ variables: { imageurl: imageUrl } });
      console.log("Work image deleted successfully.");
    } catch (error) {
      console.error("Error deleting the image:", error);
    }
  };

  const handleCreateAd = () => {
    navigate("/create-ad");
  };

  // Filter artists based on search query
  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadNextArtists = () => {
    if (offset + limit < totalArtists) {
      setOffset((prevOffset) => prevOffset + limit);
      fetchMore({
        variables: { offset: offset + limit },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          return {
            tattoo_artists: [
              ...prevResult.tattoo_artists,
              ...fetchMoreResult.tattoo_artists,
            ],
            tattoo_artists_aggregate: prevResult.tattoo_artists_aggregate, // Keep total count
          };
        },
      });
    }
  };

  const loadPreviousArtists = () => {
    if (offset >= limit) {
      setOffset((prevOffset) => prevOffset - limit);
      fetchMore({
        variables: { offset: offset - limit },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          return {
            tattoo_artists: [...fetchMoreResult.tattoo_artists],
            tattoo_artists_aggregate: prevResult.tattoo_artists_aggregate, // Keep total count
          };
        },
      });
    }
  };

  const noMoreArtists = offset + limit >= totalArtists;

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Navigation Menu */}
      <nav className="admin-nav">
        <button
          className="nav-button"
          onClick={() =>
            document
              .getElementById("stats-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          Statistics
        </button>
        <button
          className="nav-button"
          onClick={() =>
            document
              .getElementById("ads-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          Ads
        </button>
        <button
          className="nav-button"
          onClick={() =>
            document
              .getElementById("artists-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          Tattoo Artists
        </button>
        <button
          className="nav-button"
          onClick={() =>
            document
              .getElementById("invites-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          Invites
        </button>
        <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
      </nav>

      <section id="stats-section" className="section">
        <div className="stats">
          <h2>Statistics</h2>
          <p>Total Artists: {artists.length}</p>
          <p>Total Non-Artist Users: {nonArtistUsersCount}</p>
        </div>
      </section>

      <section id="ads-section" className="section">
        <button className="create-ad-button" onClick={handleCreateAd}>
          Create New Ad
        </button>
        <ExpiredAdsList />
      </section>

      <section id="artists-section" className="section">
        <h2>Tattoo Artists</h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search artists by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        <ul className="list">
          {filteredArtists.map((artist) => (
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
                  className="social-link"
                >
                  Instagram
                </a>
                ,{" "}
                <a
                  href={artist.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  Twitter
                </a>
                ,{" "}
                <a
                  href={artist.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
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

              <div className="pagination-controls"></div>

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
        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button
            className="delete-user-button"
            onClick={loadPreviousArtists}
            disabled={offset === 0}
          >
            Previous
          </button>
          <button
            className="delete-user-button"
            onClick={loadNextArtists}
            disabled={noMoreArtists || loading}
          >
            {loading ? "Loading..." : "Next"}
          </button>
        </div>
        {/* Display message if no more artists */}
        {noMoreArtists && !loading && <p>No more artists to load.</p>}
      </section>

      <section id="invites-section" className="section">
        <h2>Invites</h2>
        <ul className="list">
          {invites &&
            invites
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
      <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
    </div>
  );
};

export default AdminDashboard;
