import React, { useState, useEffect } from "react";
import axios from "axios";
import { uploadImageWithFormData } from "../handlers/apiHandler";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function ImageUploader({
  buildId,
  onUploaded,
  beforeUploaded,
  uploadText = "Upload Image",
  oldImageUrl,
  loading,
  setLoading,
}) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("buildId", buildId);
    if (oldImageUrl) formData.append("oldImageUrl", oldImageUrl); // The URL of the old image

    if (beforeUploaded) beforeUploaded();

    // await delay(2000); delay for debugging
    const resultUrl = await uploadImageWithFormData(formData);
    setLoading(false);
    setImageUrl(resultUrl);
    if (onUploaded) onUploaded(resultUrl, buildId);
  };

  return (
    <div className="d-flex flex-column gap-2">
      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        className="form-control"
        onChange={handleFileChange}
      />
      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Loading..." : uploadText}
      </button>
    </div>
  );
}

export default ImageUploader;
