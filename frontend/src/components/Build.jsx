import { useState } from "react";
import EditBuildForm from "./EditBuildForm";
import DisplayComponents from "./DisplayComponents";
import ImageUploader from "./ImageUploader";
import AddGPUForm from "./AddGPUForm";
import {
  deleteBuildById,
  deleteImageByURL,
  addGPUToBuild,
} from "../handlers/apiHandler";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function Build({ build, onUpdate, darkMode }) {
  const [show, setShow] = useState(true);
  const [localBuild, setLocalBuild] = useState(build);
  const [editing, setEditing] = useState(false);
  const [showAddGPUForm, setShowAddGPUForm] = useState(false);
  const [showComponents, setShowComponents] = useState(false); // Toggle for components section
  const [showDescription, setShowDescription] = useState(false); // Toggle for description visibility

  const handleEditClick = () => {
    setEditing(!editing);
  };

  const handleImageReplace = () => {
    // Delete previous image if there is one
    localBuild?.image_url && deleteImageByURL(localBuild.image_url);
  };

  const handleImageUpload = (newImageUrl) => {
    if (!localBuild) return;
    setLocalBuild((prev) => {
      return { ...prev, image_url: newImageUrl };
    });
  };

  const updateLocalBuild = (payload) => {
    if (!localBuild) return;
    setLocalBuild((prev) => {
      const updatedBuild = { ...prev };
      for (const [key, value] of Object.entries(payload)) {
        updatedBuild[key] = value;
      }
      return updatedBuild;
    });
  };

  const handleAddGPU = async (gpu) => {
    const referenceId = await addGPUToBuild(build.id, gpu.id);
    if (referenceId) {
      setLocalBuild((prev) => {
        const updatedBuild = { ...prev };
        updatedBuild.components.push({
          ...gpu,
          component_reference_id: referenceId,
          count: gpu.count,
        });
        return updatedBuild;
      });
    }
  };

  if (!show) return <div> </div>;

  return (
    <div
      className={`card mb-4 shadow-sm border-0 ${darkMode ? "dark-card" : ""}`}
    >
      <div className={`card-body p-4 ${darkMode ? "dark-card-body" : ""}`}>
        {/* Build Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className={`card-title mb-0 ${darkMode ? "text-light" : ""}`}>
            {localBuild?.name}
          </h2>
          <button
            onClick={handleEditClick}
            className={`btn btn-outline-primary d-flex align-items-center gap-2 ${
              darkMode ? "dark-btn" : ""
            }`}
          >
            <i className="bi bi-pencil-square fs-5"></i>
            {editing ? "Close Edit" : "Edit Build"}
          </button>
        </div>

        {/* Add GPU Form */}
        <AddGPUForm
          show={showAddGPUForm}
          onSubmit={(gpu) => handleAddGPU(gpu)}
          onClose={() => setShowAddGPUForm(false)}
          darkMode={darkMode}
        />

        {/* Edit Build Form */}
        {editing && (
          <EditBuildForm
            buildId={localBuild?.id}
            onClose={handleEditClick}
            onSuccess={(payload) => {
              updateLocalBuild(payload);
              onUpdate();
            }}
            darkMode={darkMode}
          />
        )}

        {/* Main Content */}
        <div className="row g-4">
          {/* Components Section */}
          <div className="col-12">
            {/* Button to toggle components visibility */}
            <button
              className={`btn btn-sm btn-outline-secondary d-block mb-2 ${
                darkMode ? "dark-btn" : ""
              }`}
              onClick={() => setShowComponents((prev) => !prev)} // Toggle component visibility
            >
              <i class="bi bi-motherboard-fill"></i>{" "}
              {showComponents ? "Hide Components" : "View Components"}
            </button>

            {/* Show components in a 2x2 grid when showComponents is true */}
            {showComponents && localBuild && (
              <div className="row g-3">
                <DisplayComponents
                  build={localBuild}
                  onUpdate={onUpdate}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>

          {/* Build Info and Image Sections */}
          {!showComponents && (
            <div className="col-12">
              {/* Build Info Section */}
              <h5 className={darkMode ? "text-light" : ""}>Build Info</h5>
              <ul className="list-unstyled">
                <li>
                  <strong
                    onClick={() => {
                      setShowDescription(!showDescription);
                    }}
                  >
                    Description:
                  </strong>{" "}
                  {(showDescription && localBuild?.description) || "Hidden"}
                </li>
                <li>
                  <strong>Status:</strong> {localBuild?.status}
                </li>
                <li>
                  <strong>Total Cost:</strong> £{localBuild?.total_cost}
                </li>
                <li>
                  <strong>Sale Price:</strong>{" "}
                  {localBuild?.sale_price
                    ? `£${localBuild?.sale_price}`
                    : "Not sold yet"}
                </li>
                <li>
                  <li>
                    <strong>Sold Date: </strong>
                    {localBuild?.sold_date
                      ? new Date(localBuild.sold_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </li>
                </li>
                <li>
                  <strong>Profit:</strong>{" "}
                  {localBuild?.profit ? `£${localBuild?.profit}` : "N/A"}
                </li>
              </ul>

              {/* Centered Build Image */}
              <div className="d-flex justify-content-center align-items-center my-3">
                {localBuild?.image_url ? (
                  <img
                    src={`${BACKEND_URL}${localBuild.image_url}`}
                    alt="Build image"
                    className="img-fluid rounded border"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className={`d-flex align-items-center justify-content-center ${
                      darkMode ? "bg-dark" : "bg-secondary"
                    } text-white rounded border`}
                    style={{ height: "400px" }}
                  >
                    No image available
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="d-flex justify-content-center align-items-center">
                {localBuild && (
                  <ImageUploader
                    beforeUploaded={handleImageReplace}
                    onUploaded={handleImageUpload}
                    uploadText={
                      localBuild.image_url ? "Replace Image" : "Add Image"
                    }
                    buildId={localBuild.id}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Build Button */}
        <div className="d-flex justify-content-end mt-4">
          <button
            onClick={() => {
              deleteBuildById(localBuild);
              setLocalBuild(null);
              onUpdate();
              setShow(false);
            }}
            className="btn btn-danger"
          >
            Delete Build
          </button>
        </div>
      </div>
    </div>
  );
}

export default Build;
