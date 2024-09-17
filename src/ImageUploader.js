// src/ImageUploader.js
import React, { useState } from "react";
import nhost from "./nhost";
import { useMutation } from "@apollo/client";
import { ADD_WORK_IMAGE } from "./queries";

function ImageUploader({ artistId }) {
  const [file, setFile] = useState(null);
  const [addWorkImage] = useMutation(ADD_WORK_IMAGE);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    // Upload the file to the default bucket
    const { fileMetadata, error } = await nhost.storage.upload({
      file,
    });

    if (error) {
      console.error("Upload error:", error);
      alert(`Upload error: ${error.message}`);
      return;
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
      alert("Error saving image to the database.");
      return;
    }

    alert("Image uploaded successfully!");
    setFile(null);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload} disabled={!file}>
        Upload Image
      </button>
    </div>
  );
}

export default ImageUploader;
