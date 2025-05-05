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
import { Button } from "react-bootstrap";
import ShareButton from "./ShareButton";
import BuildImage from "./BuildImage";

const isProduction = process.env.NODE_ENV === "production";

function linkify(text) {
  if (!text) return;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }
    return part;
  });
}

function Build({ build, onUpdate, darkMode, onDuplicate }) {
  const [show, setShow] = useState(true);
  const [localBuild, setLocalBuild] = useState(build);
  const [editing, setEditing] = useState(false);
  const [showAddGPUForm, setShowAddGPUForm] = useState(false);
  const [showComponents, setShowComponents] = useState(false); // Toggle for components section
  const [showDescription, setShowDescription] = useState(false); // Toggle for description visibility
  const [isDescriptionHovered, setDescriptionHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEditClick = () => {
    setEditing(!editing);
  };

  const handleImageReplace = () => {
    if (!isProduction) {
      // Delete previous image if there is one
      localBuild?.image_url && deleteImageByURL(localBuild.image_url);
    }
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
        <div className="d-flex justify-content-center align-items-center mb-4 flex-column flex-md-row">
          <h2 className={`card-title mb-0 ${darkMode ? "text-light" : ""}`}>
            {localBuild?.name}
          </h2>
          <button
            onClick={handleEditClick}
            className={`btn btn-outline-primary d-flex align-items-center gap-2 ms-md-3 mt-2 mt-md-0 ${
              darkMode ? "dark-btn" : ""
            }`}
          >
            <i className="bi bi-pencil-square fs-5"></i>
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
            build={localBuild}
            onClose={handleEditClick}
            onSuccess={(payload) => {
              updateLocalBuild(payload);
              onUpdate();
            }}
            darkMode={darkMode}
          />
        )}

        {/* Main Content */}
        <div className="row g-4 justify-content-center">
          {/* Components Section */}
          <div className="col-12 text-center">
            <button
              className={`btn btn-sm btn-outline-secondary mb-2 ${
                darkMode ? "dark-btn" : ""
              }`}
              onClick={() => setShowComponents((prev) => !prev)} // Toggle component visibility
            >
              <i className="bi bi-motherboard-fill"></i>{" "}
              {showComponents ? "Hide Components" : "View Components"}
            </button>
          </div>

          {showComponents && localBuild && (
            <div className="col-12">
              {/* Button placed above the components */}
              <div className="text-center mb-3">
                <button
                  className={`btn btn-sm btn-outline-secondary ${
                    darkMode ? "dark-btn" : ""
                  }`}
                  onClick={() => setShowAddGPUForm(true)}
                  title="Add GPU"
                >
                  +<i className="bi bi-gpu-card"></i>
                </button>
              </div>

              {/* Components Grid */}
              <div className="row g-3 justify-content-center">
                <div className="text-center">
                  <DisplayComponents
                    build={localBuild}
                    onUpdate={onUpdate}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Build Info and Image Sections */}
          {!showComponents && (
            <div className="col-12 text-center">
              <h5 className={darkMode ? "text-light" : ""}>
                <strong>Build Info</strong>
              </h5>
              <ul className="list-unstyled">
                <li>
                  <strong
                    onClick={() => setShowDescription(!showDescription)}
                    onPointerOver={() => setDescriptionHovered(true)}
                    onPointerOut={() => setDescriptionHovered(false)}
                    style={{
                      color: isDescriptionHovered ? "#33a0ff" : "#0074d9",
                      cursor: "pointer",
                    }}
                  >
                    Description:
                  </strong>
                  {showDescription ? (
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        marginTop: "0.5rem",
                      }}
                    >
                      {linkify(build?.description)}
                    </p>
                  ) : (
                    " Hidden"
                  )}
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
                <li>
                  <strong>Profit:</strong>{" "}
                  {localBuild?.profit ? `£${localBuild?.profit}` : "N/A"}
                </li>
              </ul>

              {/* Build Image */}
              <BuildImage localBuild={localBuild} darkMode={darkMode} />

              {/* Image Upload */}
              <div className="d-flex justify-content-center">
                {localBuild && (
                  <ImageUploader
                    beforeUploaded={handleImageReplace}
                    onUploaded={handleImageUpload}
                    uploadText={
                      localBuild.image_url ? "Replace Image" : "Add Image"
                    }
                    buildId={localBuild.id}
                    oldImageUrl={localBuild.image_url}
                    loading={loading}
                    setLoading={setLoading}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-center mt-4 gap-3">
          <ShareButton build={localBuild} />
          <button
            className="btn btn-secondary"
            onClick={async () => {
              setLoading(true);
              await onDuplicate(localBuild);
              setLoading(false);
            }}
            disabled={loading}
          >
            <i className="bi bi-clipboard-plus-fill"></i>{" "}
            {loading ? "Loading..." : "Duplicate"}
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              await deleteBuildById(localBuild);
              setLoading(false);
              setLocalBuild(null);
              onUpdate();
              setShow(false);
            }}
            className="btn btn-danger"
            disabled={loading}
          >
            <i className="bi bi-trash3-fill"></i>{" "}
            {loading ? "Loading..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Build;
