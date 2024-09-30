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
  CREATE_INVITE_CODE,
} from "./queries";
import ImageUploader from "./ImageUploader";
import nhost from "./nhost";
import styled from "styled-components";
import "./dashboard.css";
import { v4 as uuidv4 } from "uuid";

// Styled components for the invite code section
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

// Function to copy text to clipboard
const copyToClipboard = (text, setCopied) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // If the Clipboard API is supported, use it
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Error copying to clipboard: ", err);
      });
  } else {
    // Fallback for browsers that do not support the Clipboard API
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make the textarea invisible
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);

    // Select the text and copy it
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Fallback: Error copying to clipboard", err);
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  }
};

function Dashboard() {
  const user = useUserData();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [newStyle, setNewStyle] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [artistData, setArtistData] = useState({
    name: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
    location: "",
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

  const { data: stylesData } = useQuery(GET_ALL_TATTOO_STYLES);
  const [addNewStyle] = useMutation(ADD_NEW_TATTOO_STYLE);
  const [updateArtist] = useMutation(UPDATE_TATTOO_ARTIST);
  const [createArtist] = useMutation(CREATE_TATTOO_ARTIST);
  const [createInviteCode] = useMutation(CREATE_INVITE_CODE);
  const { signOut } = useSignOut();

  useEffect(() => {
    if (data && data.tattoo_artists.length > 0) {
      setArtistData(data.tattoo_artists[0]);
    }
  }, [data]);

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
        imageurl: imageUrl,
      },
    });

    await refetch();
    alert("Profile image uploaded successfully!");
  };

  const handleChange = (e) => {
    setArtistData({
      ...artistData,
      [e.target.name]: e.target.value,
    });
  };

  const [showCropModal, setShowCropModal] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // State for cropped area

  const handleSave = async () => {
    try {
      if (newStyle.trim()) {
        const stylesArray = newStyle.split(",").map((style) => style.trim());

        for (let style of stylesArray) {
          if (style) {
            const { data: styleData } = await addNewStyle({
              variables: {
                style: style,
                tattoo_artist_id: artistData.id,
              },
            });
            if (styleData) {
              setArtistData((prevData) => ({
                ...prevData,
                styles: [
                  ...(prevData.styles || []),
                  styleData.insert_styles_one,
                ],
              }));
            }
          }
        }
        setNewStyle("");
      }

      if (data && data.tattoo_artists.length > 0) {
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
      }

      await refetch();
      alert("Profile and styles saved successfully!");
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading dashboard: {error.message}</p>;
  if (!user) {
    return null;
  }

  const isProfileExist = data && data.tattoo_artists.length > 0;

  return (
    <div className="dashboard-container">
      <button className="back-button" onClick={() => navigate("/")}>
        <FaArrowLeft />
      </button>
      <h2>Dashboard</h2>
      <h3>{isProfileExist ? "Update Profile" : "Create Profile"}</h3>

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

      <h3>Tattoo style</h3>
      <input
        type="text"
        value={newStyle}
        onChange={(e) => setNewStyle(e.target.value)}
        placeholder="Your styles (separate by comma)"
      />
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
        placeholder="City or town"
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
          <CopyButton onClick={() => copyToClipboard(inviteUrl, setCopied)}>
            Copy URL
          </CopyButton>
          {copied && (
            <CopySuccessMessage>Copied to clipboard!</CopySuccessMessage>
          )}
        </InviteContainer>
      )}

      <button className="signout-btn" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}

export default Dashboard;
