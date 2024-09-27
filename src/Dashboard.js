import React, { useEffect, useState, useCallback } from "react";
import { useUserData, useSignOut } from "@nhost/react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImageHelper"; // Fix the import
import {
  GET_TATTOO_ARTIST_BY_USER_ID,
  UPDATE_TATTOO_ARTIST,
  CREATE_TATTOO_ARTIST,
} from "./queries";
import ImageUploader from "./ImageUploader";
import nhost from "./nhost"; // Import nhost for file upload
import "./dashboard.css"; // Import the dashboard styles

function Dashboard() {
  const user = useUserData();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null); // New state for profile image
  const [croppedImage, setCroppedImage] = useState(null);
  const [artistData, setArtistData] = useState({
    name: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
    location: "",
    imageurl: "", // Still used to display uploaded profile image URL
  });

  const { data, loading, error, refetch } = useQuery(
    GET_TATTOO_ARTIST_BY_USER_ID,
    {
      variables: { user_id: user.id },
    }
  );

  const [updateArtist] = useMutation(UPDATE_TATTOO_ARTIST);
  const [createArtist] = useMutation(CREATE_TATTOO_ARTIST);
  const { signOut } = useSignOut();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false); // Control crop modal visibility

  useEffect(() => {
    if (data && data.tattoo_artists.length > 0) {
      setArtistData(data.tattoo_artists[0]);
    }
  }, [data]);

  const handleProfileImageChange = (e) => {
    setProfileImage(URL.createObjectURL(e.target.files[0])); // Preview the image
    setShowCropModal(true); // Show the cropping modal
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const croppedImg = await getCroppedImg(profileImage, croppedAreaPixels); // Crop the image
      setCroppedImage(croppedImg); // Store the cropped image
      setShowCropModal(false); // Hide the cropping modal
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!croppedImage) return;

    // Convert the cropped image blob into a file
    const file = new File([croppedImage], "profile-image.jpg", {
      type: "image/jpeg",
    });

    // Upload the profile image
    const { fileMetadata, error } = await nhost.storage.upload({
      file,
    });

    if (error) {
      console.error("Profile image upload error:", error);
      alert(`Upload error: ${error.message}`);
      return;
    }

    // Get the public URL for the uploaded profile image
    const imageUrl = nhost.storage.getPublicUrl({ fileId: fileMetadata.id });

    // Update artistData with the new profile image URL
    setArtistData({ ...artistData, imageurl: imageUrl });

    // Update the artist's profile in the database
    await updateArtist({
      variables: {
        id: artistData.id,
        name: artistData.name,
        address: artistData.address,
        facebook: artistData.facebook,
        instagram: artistData.instagram,
        twitter: artistData.twitter,
        location: artistData.location,
        imageurl: imageUrl, // Save the new image URL
      },
    });

    // Refetch artist data to update the UI
    await refetch();

    alert("Profile image uploaded successfully!");
  };

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login"); // Redirect to login page after sign-out
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading dashboard: {error.message}</p>;

  const isProfileExist = data && data.tattoo_artists.length > 0;

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <h3>{isProfileExist ? "Update Profile" : "Create Profile"}</h3>

      {/* Profile Image Upload */}
      <h3>Profile Photo</h3>
      <input type="file" onChange={handleProfileImageChange} accept="image/*" />
      {croppedImage && (
        <img src={URL.createObjectURL(croppedImage)} alt="Cropped" />
      )}
      <button onClick={handleProfileImageUpload} disabled={!croppedImage}>
        Upload Profile Image
      </button>

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
      <button onClick={handleSave}>Save</button>

      {isProfileExist && (
        <>
          <h3>Upload Work Images</h3>
          <ImageUploader artistId={artistData.id} />
        </>
      )}

      {/* Sign Out Button */}
      <button className="signout-btn" onClick={handleSignOut}>
        Sign Out
      </button>

      {/* Image Cropper Modal */}
      {showCropModal && (
        <div className="cropper-modal">
          <Cropper
            image={profileImage}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="cropper-controls">
            <button onClick={handleCropConfirm}>Confirm Crop</button>
            <button onClick={() => setShowCropModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
