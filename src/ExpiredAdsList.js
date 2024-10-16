import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_EXPIRED_ADS, DELETE_AD } from "./queries";
import "./ExpiredAdsList.css"; // Optional CSS for styling

const ExpiredAdsList = () => {
  const { loading, error, data, refetch } = useQuery(GET_EXPIRED_ADS);
  const [deleteAd] = useMutation(DELETE_AD);

  // Utility function to convert date to a more readable format
  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options); // Using default locale
  };

  const handleDelete = async (id) => {
    try {
      await deleteAd({ variables: { id } });
      alert("Ad deleted successfully!");
      refetch(); // Refresh the list after deletion
    } catch (err) {
      console.error("Error deleting ad:", err);
    }
  };

  if (loading) return <p>Loading expired ads...</p>;
  if (error) return <p>Error loading expired ads.</p>;

  return (
    <div className="expired-ads-container">
      <h2>Expired Ads</h2>
      {data.ads.length > 0 ? (
        <ul className="expired-ads-list">
          {data.ads.map((ad) => (
            <li key={ad.id} className="expired-ad-item">
              <span>{ad.title}</span>
              <span>Expired on: {formatDateTime(ad.expiration_date)}</span>{" "}
              {/* Formatting the expiration date */}
              <button
                onClick={() => handleDelete(ad.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No expired ads found.</p>
      )}
    </div>
  );
};

export default ExpiredAdsList;
