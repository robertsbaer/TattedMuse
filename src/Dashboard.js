// Dashboard.js

import React, { useEffect, useState, useCallback } from "react";
import { useUserData, useSignOut } from "@nhost/react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImageHelper";
import {
  GET_TATTOO_ARTIST_BY_USER_ID,
  UPDATE_TATTOO_ARTIST,
  CREATE_TATTOO_ARTIST,
  GET_ALL_TATTOO_STYLES,
  ADD_NEW_TATTOO_STYLE,
  GET_ARTIST_INTERACTIONS,
  CREATE_INVITE_CODE,
  INITIALIZE_INTERACTION_COUNTS,
  GET_ARTIST_SAVES_COUNT,
} from "./queries";
import ImageUploader from "./ImageUploader";
import nhost from "./nhost";
import styled from "styled-components";
import "./dashboard.css";
import { v4 as uuidv4 } from "uuid";

// Styled components for invite code section
const InviteContainer = styled.div`
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const InviteLink = styled.a`
  display: inline-block;
  color: #ffffff;
  background-color: #3b3b3b;
  padding: 10px 15px;
  border-radius: 5px;
  text-decoration: none;
  margin-right: 10px;
  transition: background-color 0.3s;
  word-wrap: break-word;

  &:hover {
    background-color: #4c4c4c;
  }
`;

const CopyButton = styled.button`
  background-color: #e91e63;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }
`;

const CopySuccessMessage = styled.p`
  color: #00ff00;
  margin-top: 10px;
`;

function Dashboard() {
  const user = useUserData();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [newStyle, setNewStyle] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [initializeInteractionCounts] = useMutation(
    INITIALIZE_INTERACTION_COUNTS
  );

  const [artistData, setArtistData] = useState({
    id: null,
    name: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
    location: "",
    shop_name: "",
    imageurl: "",
    styles: [],
  });

  const { data, loading, error, refetch } = useQuery(
    GET_TATTOO_ARTIST_BY_USER_ID,
    {
      variables: { user_id: user?.id },
      skip: !user,
    }
  );

  const { data: interactionsData, loading: interactionsLoading } = useQuery(
    GET_ARTIST_INTERACTIONS,
    {
      variables: { artist_id: artistData.id },
      skip: !artistData.id,
    }
  );

  useEffect(() => {
    if (data && data.tattoo_artists.length > 0) {
      setArtistData(data.tattoo_artists[0]);
    }
  }, [data]);

  const { data: savesData, loading: savesLoading } = useQuery(
    GET_ARTIST_SAVES_COUNT,
    {
      variables: { artist_id: artistData.id },
      skip: !artistData.id,
    }
  );

  const { data: stylesData } = useQuery(GET_ALL_TATTOO_STYLES);
  const [addNewStyle] = useMutation(ADD_NEW_TATTOO_STYLE);
  const [updateArtist] = useMutation(UPDATE_TATTOO_ARTIST);
  const [createArtist] = useMutation(CREATE_TATTOO_ARTIST);
  const [createInviteCode] = useMutation(CREATE_INVITE_CODE);
  const { signOut } = useSignOut();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const handleProfileImageChange = (e) => {
    setProfileImage(URL.createObjectURL(e.target.files[0]));
    setShowCropModal(true);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const croppedImg = await getCroppedImg(profileImage, croppedAreaPixels);
      setCroppedImage(croppedImg);
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!croppedImage) return;

    const file = new File([croppedImage], "profile-image.jpg", {
      type: "image/jpeg",
    });

    const { fileMetadata, error } = await nhost.storage.upload({
      file,
    });

    if (error) {
      console.error("Profile image upload error:", error);
      alert(`Upload error: ${error.message}`);
      return;
    }

    const imageUrl = nhost.storage.getPublicUrl({ fileId: fileMetadata.id });

    setArtistData({ ...artistData, imageurl: imageUrl });

    await updateArtist({
      variables: {
        id: artistData.id,
        name: artistData.name,
        address: artistData.address,
        facebook: artistData.facebook,
        instagram: artistData.instagram,
        twitter: artistData.twitter,
        location: artistData.location,
        shop_name: artistData.shop_name,
        imageurl: imageUrl,
      },
    });

    await refetch();
  };

  const handleChange = (e) => {
    setArtistData({
      ...artistData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      let artistId = artistData.id;

      const isProfileExist = data && data.tattoo_artists.length > 0;

      if (isProfileExist) {
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
            shop_name: artistData.shop_name,
            imageurl: artistData.imageurl,
          },
        });
      } else {
        // Create a new profile
        const result = await createArtist({
          variables: {
            user_id: user.id,
            name: artistData.name,
            address: artistData.address,
            facebook: artistData.facebook,
            instagram: artistData.instagram,
            twitter: artistData.twitter,
            location: artistData.location,
            shop_name: artistData.shop_name,
            imageurl: artistData.imageurl,
          },
        });
        artistId = result.data.insert_tattoo_artists_one.id;
        setArtistData({
          ...artistData,
          id: artistId,
        });

        await initializeInteractionCounts({
          variables: {
            artist_id: artistId,
          },
        });
      }

      // Save styles
      if (newStyle.trim()) {
        const stylesArray = newStyle.split(",").map((style) => style.trim());
        for (let style of stylesArray) {
          if (style) {
            const { data: styleData } = await addNewStyle({
              variables: { style: style, tattoo_artist_id: artistId },
            });
            setArtistData((prevData) => ({
              ...prevData,
              styles: [...(prevData.styles || []), styleData.insert_styles_one],
            }));
          }
        }
        setNewStyle("");
      }

      // Refetch data and show success message
      await refetch();
      setUpdateMessage("Profile updated successfully!");
      setTimeout(() => setUpdateMessage(""), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error("Error saving profile or styles:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleGenerateCode = async () => {
    const newCode = uuidv4();

    try {
      const { data } = await createInviteCode({
        variables: {
          creator_id: artistData.id,
          code: newCode,
        },
      });

      if (data) {
        const inviteCode = data.insert_invite_codes_one.code;
        setInviteCode(inviteCode);

        const signupUrl = `${window.location.origin}/signup?inviteCode=${inviteCode}`;
        setInviteUrl(signupUrl);
      }
    } catch (error) {
      console.error("Error generating invite code:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1000); // 3 seconds delay

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  if (showLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (error) return <p>Error loading dashboard: {error.message}</p>;
  if (!user) {
    return null;
  }

  const isProfileExist = data && data.tattoo_artists.length > 0;

  const portfolioViews =
    interactionsData?.artist_interaction_counts_by_pk?.portfolio_views || 0;
  const addressClicks =
    interactionsData?.artist_interaction_counts_by_pk?.address_clicks || 0;
  const savesCount =
    savesData?.user_favorite_artists_aggregate?.aggregate?.count || 0;

  return (
    <div className="dashboard-container">
      <h3>Popularity Stats</h3>
      {isProfileExist && (
        <div className="popularity-stats">
          {interactionsLoading || savesLoading ? (
            <p>Loading interactions...</p>
          ) : (
            <div className="interaction-container">
              <p className="interaction-stat">
                <span className="stat-label">Portfolio Views:</span>
                <span className="stat-value"> {portfolioViews}</span>
              </p>
              <p className="interaction-stat">
                <span className="stat-label">Address Clicks:</span>
                <span className="stat-value"> {addressClicks}</span>
              </p>
              <p className="interaction-stat">
                <span className="stat-label">Saved by Users:</span>
                <span className="stat-value"> {savesCount}</span>
              </p>
            </div>
          )}
        </div>
      )}
      <button className="back-button" onClick={() => navigate("/")}>
        <FaArrowLeft />
      </button>
      <h2>Dashboard</h2>
      <h3>{isProfileExist ? "Update Profile" : "Create Profile"}</h3>

      {/* Conditionally render the profile image upload section */}
      {isProfileExist && (
        <>
          {/* Profile Image Upload */}
          {artistData.imageurl && (
            <div className="profile-image-container">
              <img
                src={artistData.imageurl}
                alt="Current Profile"
                className="profile-image"
              />
            </div>
          )}
          <div className="custom-file-upload">
            <label htmlFor="profileImageUpload" className="file-upload-label">
              Change Profile Image
            </label>
            <input
              type="file"
              id="profileImageUpload"
              onChange={handleProfileImageChange}
              accept="image/*"
              className="file-input"
            />
          </div>
          {croppedImage && (
            <>
              <img src={URL.createObjectURL(croppedImage)} alt="Cropped" />
              <button onClick={handleProfileImageUpload}>
                Upload Profile Image
              </button>
            </>
          )}

          {/* Image Cropper Modal */}
          {showCropModal && (
            <div className="cropper-modal">
              <div className="cropper-wrapper">
                <Cropper
                  image={profileImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="cropper-controls">
                <button onClick={handleCropConfirm}>Confirm Crop</button>
                <button onClick={() => setShowCropModal(false)}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Styles Section */}
      {isProfileExist && (
        <>
          <h3>Styles you specialize in</h3>
          {artistData.styles && artistData.styles.length > 0 ? (
            <div className="style-list">
              {artistData.styles.map((style) => (
                <div key={style.id} className="style-item">
                  <p>{style.style}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No styles selected yet</p>
          )}
        </>
      )}

      {/* Tattoo Styles Input */}
      <h3>Tattoo Styles</h3>
      <input
        type="text"
        value={newStyle}
        onChange={(e) => setNewStyle(e.target.value)}
        placeholder="Your styles (separate by comma)"
      />

      {/* Profile Information Inputs */}
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
        placeholder="Work Address"
      />
      <input
        type="text"
        name="location"
        value={artistData.location}
        onChange={handleChange}
        placeholder="City or Town"
      />
      <input
        type="text"
        name="shop_name"
        value={artistData.shop_name}
        onChange={handleChange}
        placeholder="Shop Name"
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

      {/* Save Button */}
      <button onClick={handleSave}>
        {isProfileExist ? "Update Profile" : "Create Profile"}
      </button>

      {/* Conditionally render other sections that require the profile to exist */}
      {updateMessage && <p style={{ color: "green" }}>{updateMessage}</p>}

      {isProfileExist && (
        <>
          {/* Upload Work Images */}
          <h3>Upload Work Images</h3>
          <ImageUploader artistId={artistData.id} />

          {/* Invite Code Generation */}
          <h3>Generate Invite Code</h3>
          <p>
            Generate a unique code to invite other tattoo artists to join the
            platform. Share the code with them to help grow the community!
          </p>
          <button onClick={handleGenerateCode}>Generate Invite Code</button>

          {inviteCode && (
            <InviteContainer>
              <p>Your invite code URL:</p>
              <InviteLink
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inviteUrl}
              </InviteLink>
              <CopyButton onClick={() => copyToClipboard(inviteUrl)}>
                Copy URL
              </CopyButton>
              {copied && (
                <CopySuccessMessage>Copied to clipboard!</CopySuccessMessage>
              )}
            </InviteContainer>
          )}
        </>
      )}

      {/* Sign Out Button */}
      <button className="signout-btn" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}

export default Dashboard;
