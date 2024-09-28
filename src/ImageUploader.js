import React, { useState, useEffect } from "react";
import nhost from "./nhost";
import { useMutation } from "@apollo/client";
import { ADD_WORK_IMAGE } from "./queries";
import { FaCheckCircle } from "react-icons/fa";
import "./ImageUploader.css"; // Ensure to add custom styles here

function ImageUploader({ artistId }) {
  const [files, setFiles] = useState([]);
  const [addWorkImage] = useMutation(ADD_WORK_IMAGE);
  const [uploadSuccess, setUploadSuccess] = useState(false); // State to track success

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(e.target.files); // Allows multiple file selections
    setUploadSuccess(false); // Reset the success state on new selection
  };

  // Handle uploading multiple files
  const handleUpload = async () => {
    if (files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      // Upload each file to the default bucket
      const { fileMetadata, error } = await nhost.storage.upload({
        file,
      });

      if (error) {
        console.error("Upload error:", error);
        alert(`Upload error: ${error.message}`);
        return null;
      }

      // Get the public URL for the uploaded file
      const imageUrl = nhost.storage.getPublicUrl({ fileId: fileMetadata.id });

      // Save the image URL to the database
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

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    // Check for any upload failures
    if (results.includes(null)) {
      alert("One or more images failed to upload.");
    } else {
      setUploadSuccess(true); // Set the success state
      setFiles([]); // Clear files after upload
    }
  };

  // Automatically hide success message after 4 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false); // Reset success state after 4 seconds
      }, 4000);

      return () => clearTimeout(timer); // Clear the timeout if component unmounts
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

      {/* Display the selected file names or count */}
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
          <button onClick={handleUpload}>Upload Images</button>
        </>
      )}

      {/* Display the success message if upload is successful */}
      {uploadSuccess && (
        <div className="upload-success">
          <FaCheckCircle className="success-icon" /> {/* Check icon */}
          <p>Images uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
