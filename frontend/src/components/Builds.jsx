import { useEffect, useState } from "react";
import EditBuildForm from "./EditBuildForm";
import { deleteBuildById } from "../handlers/apiHandler";

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

  const displayBuild = (build) => {
    const handleEditClick = () => {
      // Toggle visibility of the form for this specific build
      setEditingBuildId(editingBuildId === build.id ? null : build.id);
    };

    return (
      <div key={build.id} className="build-card" style={styles.card}>
        <h2>{build.name}</h2>

        {/* Edit Button to toggle form visibility */}
        <button onClick={handleEditClick} className="btn btn-primary">
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

        <button
          onClick={() => {
            deleteBuildById(build.id);
            onUpdate();
          }}
          className="btn btn-danger"
        >
          Delete Build
        </button>

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
          <strong>Profit:</strong> {build.profit ? `£${build.profit}` : "N/A"}
        </p>
        <img
          style={{ width: "200px", height: "200px" }}
          src={`${BACKEND_URL}${build.image_url}`}
          alt="Build image"
        />
      </div>
    );
  };

  return <div>{builds.length > 0 && builds.map(displayBuild)}</div>;
}

export default Builds;
