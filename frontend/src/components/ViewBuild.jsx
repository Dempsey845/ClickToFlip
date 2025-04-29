import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBuildById } from "../handlers/apiHandler";
import DisplayComponents from "./DisplayComponents";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function ViewBuild({ darkMode, onUpdate }) {
  const [showComponents, setShowComponents] = useState(false); // Toggle for components section
  const [showDescription, setShowDescription] = useState(false); // Toggle for description visibility

  const { buildId } = useParams(); // Access the URL param
  const [build, setBuild] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBuildData = async () => {
      try {
        const data = await getBuildById(buildId);
        setBuild(data);
      } catch (err) {
        setError("Failed to load build.");
        console.error(err);
      }
    };
    getBuildData();
  }, [buildId]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!build) return <p>Loading...</p>;

  return (
    <div
      className={`card mb-4 shadow-sm border-0 ${darkMode ? "dark-card" : ""}`}
    >
      <div className={`card-body p-4 ${darkMode ? "dark-card-body" : ""}`}>
        {/* Build Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className={`card-title mb-0 ${darkMode ? "text-light" : ""}`}>
            {build?.name}
          </h2>
        </div>

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
              <i className="bi bi-motherboard-fill"></i>{" "}
              {showComponents ? "Hide Components" : "View Components"}
            </button>

            {/* Show components in a 2x2 grid when showComponents is true */}
            {showComponents && (
              <div className="row g-3">
                <DisplayComponents
                  build={build}
                  onUpdate={onUpdate}
                  darkMode={darkMode}
                  viewOnly={true}
                />
              </div>
            )}
          </div>

          {/* Build Info */}
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
                  {(showDescription && build?.description) || "Hidden"}
                </li>
                <li>
                  <strong>Status:</strong> {build?.status}
                </li>
                <li>
                  <strong>Total Cost:</strong> £{build?.total_cost}
                </li>
                <li>
                  <strong>Sale Price:</strong>{" "}
                  {build?.sale_price ? `£${build?.sale_price}` : "Not sold yet"}
                </li>
                <li>
                  <strong>Sold Date: </strong>
                  {build?.sold_date
                    ? new Date(build.sold_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </li>
                <li>
                  <strong>Profit:</strong>{" "}
                  {build?.profit ? `£${build?.profit}` : "N/A"}
                </li>
              </ul>

              {/* Centered Build Image */}
              <div className="d-flex justify-content-center align-items-center my-3">
                {build?.image_url ? (
                  <img
                    src={`${BACKEND_URL}${build.image_url}`}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewBuild;
