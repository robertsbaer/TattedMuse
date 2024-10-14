import React, { useState, useEffect } from "react";
import nhost from "./nhost";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_WORK_IMAGE, GET_ARTIST_BY_ID } from "./queries";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import "./ImageUploader.css";

function ImageUploader({ artistId }) {
  const [files, setFiles] = useState([]);
  const [addWorkImage] = useMutation(ADD_WORK_IMAGE);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch current images count
  const { data } = useQuery(GET_ARTIST_BY_ID, {
    variables: { id: artistId },
  });

  const currentImageCount =
    data?.tattoo_artists_by_pk?.work_images?.length || 0;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (currentImageCount + selectedFiles.length > 15) {
      alert("You can only upload a total of 15 images.");
      return;
    }
    setFiles(selectedFiles);
    setUploadSuccess(false);
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1024; // Set max width
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, "image/jpeg");
        };

        img.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      const resizedBlob = await resizeImage(file);

      const resizedFile = new File([resizedBlob], file.name, {
        type: "image/jpeg",
      });
      const { fileMetadata, error } = await nhost.storage.upload({
        file: resizedFile,
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

    setUploading(false);

    if (results.includes(null)) {
      alert("One or more images failed to upload.");
    } else {
      setUploadSuccess(true);
      setFiles([]);
    }
  };

  return (
    <div className="custom-file-upload">
      <label htmlFor="workImagesUpload" className="file-upload-label">
        Choose Work Images (Max 15)
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
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>

          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </>
      )}

      {uploading && (
        <div className="upload-loading">
          <FaSpinner className="spinner-icon" />
          <p>Uploading images...</p>
        </div>
      )}

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
