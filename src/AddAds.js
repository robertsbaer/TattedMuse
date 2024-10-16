import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_AD } from "./queries";
import "./AddAds.css"; // Keep the existing CSS file

const AddAds = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [displayFrequency, setDisplayFrequency] = useState(9);
  const [duration, setDuration] = useState("1_week"); // Default to 1 week

  const [addAd] = useMutation(ADD_AD);

  // Utility function to format date to YYYY-MM-DD HH:mm:ss in local time
  const formatLocalDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    let expirationDate;

    // Calculate expiration date based on the selected duration
    if (duration === "1_week") {
      expirationDate = new Date(now.setDate(now.getDate() + 7)); // 1 week
    } else if (duration === "2_weeks") {
      expirationDate = new Date(now.setDate(now.getDate() + 14)); // 2 weeks
    } else if (duration === "1_month") {
      expirationDate = new Date(now.setMonth(now.getMonth() + 1)); // 1 month
    }

    // Format dates in local time without UTC conversion
    const createdAtLocal = formatLocalDateTime(new Date()); // Local time for created_at
    const updatedAtLocal = formatLocalDateTime(new Date()); // Local time for updated_at
    const expirationDateLocal = formatLocalDateTime(expirationDate); // Local time for expiration_date

    try {
      await addAd({
        variables: {
          title,
          text,
          imageUrl,
          externalUrl,
          displayFrequency,
          expirationDate: expirationDateLocal, // Pass expiration date in local time
          created_at: createdAtLocal, // Pass local time for created_at
          updated_at: updatedAtLocal, // Pass local time for updated_at
        },
      });
      alert("Ad created successfully!");
      setTitle("");
      setText("");
      setImageUrl("");
      setExternalUrl("");
    } catch (error) {
      console.error("Error creating ad:", error);
    }
  };

  return (
    <div className="form-container">
      <h1 className="ad-heading">Create Your Advertisement</h1>
      <h2>Create New Ad</h2>
      <form onSubmit={handleSubmit} className="ad-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter ad title"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="text">Text:</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="Enter ad text"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            placeholder="https://example.com/image.jpg"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="externalUrl">External URL:</label>
          <input
            id="externalUrl"
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            required
            placeholder="https://example.com"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="displayFrequency">Display Frequency:</label>
          <input
            id="displayFrequency"
            type="number"
            value={displayFrequency}
            onChange={(e) => setDisplayFrequency(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration:</label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="form-control"
          >
            <option value="1_week">1 Week</option>
            <option value="2_weeks">2 Weeks</option>
            <option value="1_month">1 Month</option>
          </select>
        </div>

        <button type="submit" className="btn-submit">
          Create Ad
        </button>
      </form>
    </div>
  );
};

export default AddAds;
