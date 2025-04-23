import React, { useState, useEffect } from "react";
import axios from "axios";
import { uploadImageWithFormData } from "../handlers/apiHandler";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function ImageUploader({
  buildId,
  onUploaded,
  beforeUploaded,
  uploadText = "Upload Image",
}) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("buildId", buildId);

    if (beforeUploaded) beforeUploaded();

    const resultUrl = await uploadImageWithFormData(formData);
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
      <button className="btn btn-primary" onClick={handleUpload}>
        {uploadText}
      </button>
    </div>
  );
}

export default ImageUploader;
