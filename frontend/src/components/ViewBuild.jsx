import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBuildById, getUsernameFromId } from "../handlers/apiHandler";
import DisplayComponents from "./DisplayComponents";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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

function BuildInfo({ darkMode, build }) {
  return (
    <div className="container d-flex justify-content-center">
      <div className="row align-items-start w-100 flex-column flex-md-row text-center text-md-start">
        <div className="col-12 col-md-auto mb-3 mb-md-0 d-flex justify-content-center">
          {build?.image_url ? (
            <img
              src={`${BACKEND_URL}${build.image_url}`}
              alt="Build image"
              className="img-fluid rounded border"
              style={{
                maxWidth: "100%", // Fully responsive
                height: "auto", // Maintain aspect ratio
                maxHeight: "300px", // Limit vertical size
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className={`d-flex align-items-center justify-content-center ${
                darkMode ? "bg-dark" : "bg-secondary"
              } text-white rounded border`}
              style={{
                height: "200px",
                width: "100%",
                maxWidth: "300px",
              }}
            >
              No image available
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="col ps-md-3">
          <ul className="list-unstyled mb-0">
            {/*
            <h5 className={`mb-3 ${darkMode ? "text-light" : ""}`}>
              Build Info
            </h5>
            */}

            <li className="mb-2">
              <strong>Status:</strong> {build?.status}
            </li>
            <li className="mb-2">
              <strong>Total Cost:</strong> £{build?.total_cost}
            </li>
            <li className="mb-2">
              <strong>Sale Price:</strong>{" "}
              {build?.sale_price ? `£${build.sale_price}` : "Not sold yet"}
            </li>
            <li className="mb-2">
              <strong>Sold Date:</strong>{" "}
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
              {build?.profit ? `£${build.profit}` : "N/A"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ViewBuild({ darkMode, onUpdate }) {
  const [showComponents, setShowComponents] = useState(true); // Toggle for components section

  const { buildId } = useParams(); // Access the URL param
  const [build, setBuild] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBuildData = async () => {
      try {
        const data = await getBuildById(buildId);
        const usernameResponse = await getUsernameFromId(data.user_id);
        data.username = usernameResponse.data.user_name;
        setBuild(data);
      } catch (err) {
        setError("Failed to load build.");
        console.error(err);
      }
    };
    getBuildData();

    // Set showComponents to true on larger screens
    if (window.innerWidth >= 768) {
      setShowComponents(true);
    }
  }, [buildId]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowComponents(true); // Always show on wide screens
      }
    };

    window.addEventListener("resize", handleResize);

    // Run once on mount in case the screen was resized before
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!build) return <p>Loading...</p>;

  return (
    <div
      className={`container mt-4 card mb-4 shadow-sm border-0 ${
        darkMode ? "dark-card" : ""
      }`}
    >
      <div className={`card-body p-4 ${darkMode ? "dark-card-body" : ""}`}>
        {/* Build Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className={`card-title mb-0 ${darkMode ? "text-light" : ""}`}>
            {build?.name} Created by{" "}
            <strong style={{ color: "#0074d9" }}>{build?.username}</strong>
          </h2>
        </div>

        {/* Main Content */}
        <div className="row g-4">
          {/* Components Section */}
          <div className="col-12">
            {/* Button to toggle components visibility (hidden on md+) */}
            <div className="d-md-none">
              <button
                className={`btn btn-sm btn-outline-secondary d-block mb-2 ${
                  darkMode ? "dark-btn" : ""
                }`}
                onClick={() => setShowComponents((prev) => !prev)}
              >
                <i className="bi bi-motherboard-fill"></i>{" "}
                {showComponents ? "Hide Components" : "View Components"}
              </button>
            </div>

            {showComponents ? (
              <div className="row g-4 align-items-start">
                {/* Components Section */}
                <div className="col-12 col-md-7">
                  <DisplayComponents
                    build={build}
                    onUpdate={onUpdate}
                    darkMode={darkMode}
                    viewOnly={true}
                  />
                </div>

                {/* Build Info on the right */}
                <div className="col-12 col-md-5">
                  <BuildInfo darkMode={darkMode} build={build} />
                </div>
              </div>
            ) : (
              <BuildInfo darkMode={darkMode} build={build} />
            )}
          </div>
        </div>
      </div>
      {build.description && (
        <div>
          <h2 style={{ textAlign: "center" }}>Description</h2>
          <p
            style={{
              textAlign: "center",
              whiteSpace: "pre-wrap",
              marginTop: "0.5rem",
            }}
          >
            {linkify(build?.description)}
          </p>
        </div>
      )}
    </div>
  );
}

export default ViewBuild;
