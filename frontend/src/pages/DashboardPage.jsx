import { useState, useEffect } from "react";
import AddBuildForm from "../components/AddBuildForm";
import Builds from "../components/Builds";
import { getUserBuilds } from "../handlers/apiHandler";
import { useNavigate } from "react-router-dom";

function DashboardPage({ onLogout, darkMode }) {
  const [builds, setBuilds] = useState([]);
  const [updateCount, setUpdateCount] = useState(0);
  const navigate = useNavigate();

  const getBuilds = async () => {
    const result = await getUserBuilds();
    result && setBuilds(result);
  };

  useEffect(() => {
    getBuilds();
  }, [updateCount]);

  const handleUpdate = async () => {
    setUpdateCount((prev) => prev + 1);
  };

  const cardClass = `card ${darkMode ? "bg-dark text-light" : ""}`;
  const specialCardClass = `card mb-4 p-4 shadow-sm ${
    darkMode ? "bg-dark text-light" : ""
  }`;

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Dashboard</h1>

      {/* Add Build Form */}
      <div className={cardClass}>
        <AddBuildForm onUpdate={handleUpdate} darkMode={darkMode} />
      </div>

      {/* Edit Components Card */}
      <div className={specialCardClass}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary">Edit Your Components</h5>
          <button
            onClick={() => {
              navigate("/my-components");
            }}
            className="btn btn-outline-primary d-flex align-items-center py-2 px-3"
          >
            <i className="bi bi-pencil-square fs-5 me-2"></i>
            Edit
          </button>
        </div>
      </div>

      {/* Builds Section */}
      <div className={cardClass}>
        <Builds builds={builds} onUpdate={handleUpdate} darkMode={darkMode} />
      </div>

      {/* Logout Button */}
      <div className="text-center mt-4">
        <button onClick={onLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
