import { useEffect, useState } from "react";
import EditBuildForm from "./EditBuildForm";
import { deleteBuildById } from "../handlers/apiHandler";
import DisplayComponents from "./DisplayComponents";
import ImageUploader from "./ImageUploader";
import { deleteImageByURL } from "../handlers/apiHandler";

const styles = {
  card: {
    border: "1px solid #ccc",
    borderRadius: "1rem",
    padding: "1rem",
    margin: "1rem 0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function Builds({ builds, onUpdate }) {
  const [editingBuildId, setEditingBuildId] = useState(null); // Track which build is being edited

  const handleImageReplace = (build) => {
    if (build.image_url) {
      const imageURL = build.image_url;
      deleteImageByURL(imageURL);
    }
  };

  const displayBuild = (build) => {
    const handleEditClick = () => {
      // Toggle visibility of the form for this specific build
      setEditingBuildId(editingBuildId === build.id ? null : build.id);
    };

    console.log(build);

    return (
      <div key={build.id} className="card mb-4 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">{build.name}</h2>

          {/* Edit Button to toggle form visibility */}
          <button onClick={handleEditClick} className="btn btn-primary mb-3">
            {editingBuildId === build.id ? "Close Edit Form" : "Edit Build"}
          </button>

          {/* Conditionally render the EditBuildForm */}
          {editingBuildId === build.id && (
            <EditBuildForm
              buildId={build.id}
              onClose={handleEditClick}
              onSuccess={onUpdate}
            />
          )}

          <div className="row">
            <div className="col-md-6">
              <h5>Components</h5>
              <DisplayComponents
                build={build}
                cpuName={build.cpu_name}
                cpuSpecs={build.cpu_specs}
                gpus={build.gpus}
                motherboardName={build.motherboard_name}
                motherboardSpecs={build.motherboard_specs}
                onUpdate={onUpdate}
              />
            </div>

            <div className="col-md-6">
              <h5>Build Info</h5>
              <p>
                <strong>Description:</strong> {build.description || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {build.status}
              </p>
              <p>
                <strong>Total Cost:</strong> £{build.total_cost}
              </p>
              <p>
                <strong>Sale Price:</strong>{" "}
                {build.sale_price ? `£${build.sale_price}` : "Not sold yet"}
              </p>
              <p>
                <strong>Sold Date:</strong> {build.sold_date || "N/A"}
              </p>
              <p>
                <strong>Profit:</strong>{" "}
                {build.profit ? `£${build.profit}` : "N/A"}
              </p>
              <img
                style={{ width: "500px", height: "500px", objectFit: "cover" }}
                src={`${BACKEND_URL}${build.image_url}`}
                alt="Build image"
                className="img-fluid"
              />
              <ImageUploader
                beforeUploaded={() => {
                  handleImageReplace(build);
                }}
                uploadText="Replace Image"
                buildId={build.id}
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6 d-flex align-items-end">
              <button
                onClick={() => {
                  deleteBuildById(build);
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
  };

  return <div>{builds.length > 0 && builds.map(displayBuild)}</div>;
}

export default Builds;
