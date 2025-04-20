import { useState, useEffect } from "react";
import AddBuildForm from "../components/AddBuildForm";
import Builds from "../components/Builds";
import { getUserBuilds } from "../handlers/apiHandler";

function DashboardPage({ onLogout }) {
  const [builds, setBuilds] = useState([]);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const getBuilds = async () => {
      const result = await getUserBuilds();
      setBuilds(result);
    };
    getBuilds();
  }, [updates]);

  const handleUpdate = () => {
    setUpdates((prev) => {
      return [...prev, "New update"];
    });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <AddBuildForm onUpdate={handleUpdate} />
      <Builds builds={builds} onUpdate={handleUpdate} />
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default DashboardPage;
