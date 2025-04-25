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
  const [localBuild, setLocalBuild] = useState(build);
  const [editing, setEditing] = useState(false);
  const [showAddGPUForm, setShowAddGPUForm] = useState(false);

  const handleEditClick = () => {
    setEditing(!editing);
  };

  const handleImageReplace = () => {
    // Delete previous image if there is one
    localBuild.image_url && deleteImageByURL(localBuild.image_url);
  };

  const handleImageUpload = (newImageUrl) => {
    setLocalBuild((prev) => {
      return { ...prev, image_url: newImageUrl };
    });
  };

  const updateLocalBuild = (payload) => {
    setLocalBuild((prev) => {
      const updatedBuild = { ...prev };
      for (const [key, value] of Object.entries(payload)) {
        updatedBuild[key] = value;
      }
      return updatedBuild;
    });
  };

  const handleAddGPU = async (gpu) => {
    console.log("adding gpu");
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

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <div className="mb-4 p-2 d-flex justify-content-between align-items-center">
          <h2 className="card-title mb-0">{localBuild.name}</h2>
          <button
            onClick={handleEditClick}
            className="btn btn-outline-primary d-flex align-items-center py-2 px-3"
          >
            <i className="bi bi-pencil-square fs-5 me-2"></i>
            {editing ? "Close Edit Form" : "Edit Build"}
          </button>
        </div>

        <AddGPUForm
          show={showAddGPUForm}
          onSubmit={(gpu) => {
            console.log("Selected GPU:", gpu);
            handleAddGPU(gpu);
          }}
          onClose={() => setShowAddGPUForm(false)}
        />

        {/* Conditionally render the EditBuildForm */}
        {editing && (
          <EditBuildForm
            buildId={localBuild.id}
            onClose={handleEditClick}
            onSuccess={(payload) => {
              updateLocalBuild(payload);
              onUpdate();
            }}
          />
        )}

        <div className="row">
          <div className="col-md-6">
            <h5>Components</h5>
            <button
              className="btn btn-sm btn-outline-primary mt-2"
              title="Add GPU"
              onClick={() => {
                setShowAddGPUForm(true);
              }}
            >
              <i className="bi bi-plus-lg"></i>
              <i className="bi bi-gpu-card"></i>
            </button>

            <DisplayComponents build={localBuild} onUpdate={onUpdate} />
          </div>

          <div className="col-md-6">
            <h5>Build Info</h5>
            <p>
              <strong>Description:</strong> {localBuild.description || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {localBuild.status}
            </p>
            <p>
              <strong>Total Cost:</strong> £{localBuild.total_cost}
            </p>
            <p>
              <strong>Sale Price:</strong>{" "}
              {localBuild.sale_price
                ? `£${localBuild.sale_price}`
                : "Not sold yet"}
            </p>
            <p>
              <strong>Sold Date:</strong> {localBuild.sold_date || "N/A"}
            </p>
            <p>
              <strong>Profit:</strong>{" "}
              {localBuild.profit ? `£${localBuild.profit}` : "N/A"}
            </p>
            {localBuild.image_url ? (
              <img
                style={{ width: "500px", height: "500px", objectFit: "cover" }}
                src={`${BACKEND_URL}${localBuild.image_url}`}
                alt="Build image"
                className="img-fluid border rounded"
              />
            ) : (
              <div
                style={{ width: "500px", height: "500px" }}
                className="d-flex align-items-center justify-content-center bg-secondary text-white border rounded"
              >
                <span>No image available</span>
              </div>
            )}

            <ImageUploader
              beforeUploaded={() => {
                handleImageReplace();
              }}
              onUploaded={handleImageUpload}
              uploadText={localBuild.image_url ? "Replace Image" : "Add Image"}
              buildId={localBuild.id}
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-6 d-flex align-items-end">
            <button
              onClick={() => {
                deleteBuildById(localBuild);
                setLocalBuild(null);
                onUpdate();
              }}
              className="btn btn-danger"
            >
              Delete Build
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Build;
