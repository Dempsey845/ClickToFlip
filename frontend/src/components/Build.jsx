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

function Build({ build, onUpdate }) {
  const [show, setShow] = useState(true);
  const [localBuild, setLocalBuild] = useState(build);
  const [editing, setEditing] = useState(false);
  const [showAddGPUForm, setShowAddGPUForm] = useState(false);

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
    <div className="card mb-4 shadow-sm border-0">
      <div className="card-body p-4">
        {/* Build Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="card-title mb-0">{localBuild?.name}</h2>
          <button
            onClick={handleEditClick}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
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
          />
        )}

        {/* Main Content */}
        <div className="row g-4">
          {/* Components Section */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Components</h5>
              <button
                className="btn btn-sm btn-outline-primary"
                title="Add GPU"
                onClick={() => setShowAddGPUForm(true)}
              >
                <i className="bi bi-plus-lg me-1"></i>
                <i className="bi bi-gpu-card"></i>
              </button>
            </div>

            {localBuild && (
              <DisplayComponents build={localBuild} onUpdate={onUpdate} />
            )}
          </div>

          {/* Build Info Section */}
          <div className="col-md-6">
            <h5>Build Info</h5>
            <ul className="list-unstyled">
              <li>
                <strong>Description:</strong>{" "}
                {localBuild?.description.substr(0, 200) || "N/A"}
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
                <strong>Sold Date:</strong> {localBuild?.sold_date || "N/A"}
              </li>
              <li>
                <strong>Profit:</strong>{" "}
                {localBuild?.profit ? `£${localBuild?.profit}` : "N/A"}
              </li>
            </ul>

            {/* Build Image */}
            <div className="my-3 text-center">
              {localBuild?.image_url ? (
                <img
                  src={`${BACKEND_URL}${localBuild.image_url}`}
                  alt="Build image"
                  className="img-fluid rounded border"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-secondary text-white rounded border"
                  style={{ height: "400px" }}
                >
                  No image available
                </div>
              )}
            </div>

            {/* Image Upload */}
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
