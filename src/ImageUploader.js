import React, { useState, useEffect } from "react";
import nhost from "./nhost";
import { useMutation } from "@apollo/client";
import { ADD_WORK_IMAGE } from "./queries";
import { FaCheckCircle, FaSpinner } from "react-icons/fa"; // Import spinner icon
import "./ImageUploader.css"; // Ensure to add custom styles here

function ImageUploader({ artistId }) {
  const [files, setFiles] = useState([]);
  const [addWorkImage] = useMutation(ADD_WORK_IMAGE);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false); // Track upload progress

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(e.target.files);
    setUploadSuccess(false);
  };

  // Handle uploading multiple files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true); // Set uploading state to true

    const uploadPromises = Array.from(files).map(async (file) => {
      const { fileMetadata, error } = await nhost.storage.upload({
        file,
      });

      if (error) {
        console.error("Upload error:", error);
        alert(`Upload error: ${error.message}`);
        return null;
      }

      const imageUrl = nhost.storage.getPublicUrl({ fileId: fileMetadata.id });

      const { data, errors } = await addWorkImage({
        variables: {
          imageurl: imageUrl,
          tattoo_artist_id: artistId,
        },
      });

      if (errors) {
        console.error("Error saving image URL to the database:", errors);
        return null;
      }

      return imageUrl;
    });

    const results = await Promise.all(uploadPromises);

    setUploading(false); // Set uploading state to false

    if (results.includes(null)) {
      alert("One or more images failed to upload.");
    } else {
      setUploadSuccess(true);
      setFiles([]); // Clear files after upload
    }
  };

  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  return (
    <div className="custom-file-upload">
      <label htmlFor="workImagesUpload" className="file-upload-label">
        Choose Work Images
      </label>
      <input
        type="file"
        id="workImagesUpload"
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="file-input"
      />

      {files.length > 0 && (
        <>
          <div className="file-preview">
            <p>{files.length} image(s) ready for upload:</p>
            <ul>
              {Array.from(files).map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>

          {/* Conditionally render the Upload Images button */}
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </>
      )}

      {/* Show the loading spinner while uploading */}
      {uploading && (
        <div className="upload-loading">
          <FaSpinner className="spinner-icon" />
          <p>Uploading images...</p>
        </div>
      )}

      {/* Display the success message if upload is successful */}
      {uploadSuccess && (
        <div className="upload-success">
          <FaCheckCircle className="success-icon" />
          <p>Images uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
