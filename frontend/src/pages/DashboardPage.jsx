import { useState, useEffect } from "react";
import AddBuildForm from "../components/AddBuildForm";
import Builds from "../components/Builds";
import { getUserBuilds } from "../handlers/apiHandler";

function DashboardPage({ onLogout }) {
  const [builds, setBuilds] = useState([]);
  const [updateCount, setUpdateCount] = useState(0);

  const getBuilds = async () => {
    const result = await getUserBuilds();
    setBuilds(result);
  };

  useEffect(() => {
    getBuilds();
  }, [updateCount]);

  const handleUpdate = async () => {
    setUpdateCount((prev) => prev + 1);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Dashboard</h1>

      {/* Add Build Form */}
      <div className="card mb-4 p-3">
        <AddBuildForm onUpdate={handleUpdate} />
      </div>

      {/* Builds Section */}
      <div className="card mb-4 p-3">
        <Builds builds={builds} onUpdate={handleUpdate} />
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
