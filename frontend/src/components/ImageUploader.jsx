import React, { useState, useEffect } from "react";
import axios from "axios";
import { uploadImageWithFormData } from "../handlers/apiHandler";

function ImageUploader({ buildId, customButton, trigger }) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (trigger) {
      handleUpload();
    }
  }, [trigger]);

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

    const resultUrl = await uploadImageWithFormData(formData);
    setImageUrl(resultUrl);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {!customButton && <button onClick={handleUpload}>Upload Image</button>}

      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={imageUrl} alt="Uploaded" style={{ width: "200px" }} />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
