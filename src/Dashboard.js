// src/Dashboard.js
import React, { useEffect, useState } from "react";
import { useUserData } from "@nhost/react";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_TATTOO_ARTIST_BY_USER_ID,
  UPDATE_TATTOO_ARTIST,
  CREATE_TATTOO_ARTIST,
} from "./queries";
import ImageUploader from "./ImageUploader";

function Dashboard() {
  const user = useUserData();
  const [artistData, setArtistData] = useState({
    name: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
    location: "",
    imageurl: "",
  });

  const { data, loading, error, refetch } = useQuery(
    GET_TATTOO_ARTIST_BY_USER_ID,
    {
      variables: { user_id: user.id },
    }
  );

  const [updateArtist] = useMutation(UPDATE_TATTOO_ARTIST);
  const [createArtist] = useMutation(CREATE_TATTOO_ARTIST);

  useEffect(() => {
    if (data && data.tattoo_artists.length > 0) {
      setArtistData(data.tattoo_artists[0]);
    }
  }, [data]);

  const handleChange = (e) => {
    setArtistData({
      ...artistData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (data && data.tattoo_artists.length > 0) {
      // Update existing profile
      await updateArtist({
        variables: {
          id: artistData.id,
          name: artistData.name,
          address: artistData.address,
          facebook: artistData.facebook,
          instagram: artistData.instagram,
          twitter: artistData.twitter,
          location: artistData.location,
          imageurl: artistData.imageurl,
        },
      });
    } else {
      // Create new profile
      await createArtist({
        variables: {
          user_id: user.id,
          name: artistData.name,
          address: artistData.address,
          facebook: artistData.facebook,
          instagram: artistData.instagram,
          twitter: artistData.twitter,
          location: artistData.location,
          imageurl: artistData.imageurl,
        },
      });
      await refetch();
    }
    alert("Profile saved successfully!");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading dashboard: {error.message}</p>;

  const isProfileExist = data && data.tattoo_artists.length > 0;

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <h3>{isProfileExist ? "Update Profile" : "Create Profile"}</h3>
        <input
          type="text"
          name="name"
          value={artistData.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="address"
          value={artistData.address}
          onChange={handleChange}
          placeholder="Address"
        />
        <input
          type="text"
          name="location"
          value={artistData.location}
          onChange={handleChange}
          placeholder="Location"
        />
        <input
          type="text"
          name="facebook"
          value={artistData.facebook}
          onChange={handleChange}
          placeholder="Facebook URL"
        />
        <input
          type="text"
          name="instagram"
          value={artistData.instagram}
          onChange={handleChange}
          placeholder="Instagram URL"
        />
        <input
          type="text"
          name="twitter"
          value={artistData.twitter}
          onChange={handleChange}
          placeholder="Twitter URL"
        />
        <input
          type="text"
          name="imageurl"
          value={artistData.imageurl}
          onChange={handleChange}
          placeholder="Profile Image URL"
        />
        <button onClick={handleSave}>Save</button>
        {isProfileExist && (
          <>
            <h3>Upload Work Images</h3>
            <ImageUploader artistId={artistData.id} />
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
