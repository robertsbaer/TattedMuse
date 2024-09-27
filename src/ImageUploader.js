// src/ImageUploader.js
import React, { useState } from "react";
import nhost from "./nhost";
import { useMutation } from "@apollo/client";
import { ADD_WORK_IMAGE } from "./queries";

function ImageUploader({ artistId }) {
  const [files, setFiles] = useState([]);
  const [addWorkImage] = useMutation(ADD_WORK_IMAGE);

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(e.target.files); // Allows multiple file selections
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
      alert("All images uploaded successfully!");
      setFiles([]); // Clear files after upload
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        accept="image/*"
      />
      <button onClick={handleUpload} disabled={files.length === 0}>
        Upload Images
      </button>
    </div>
  );
}

export default ImageUploader;
