import { useEffect, useState } from "react";
import { getUserBuilds } from "../handlers/apiHandler";

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

function Builds() {
  const [builds, setBuilds] = useState([]);

  useEffect(() => {
    const getBuilds = async () => {
      const result = await getUserBuilds();
      setBuilds(result);
    };
    getBuilds();
  }, []);

  const displayBuild = (build) => {
    console.log("Build: ", build);
    return (
      <div key={build.id} className="build-card" style={styles.card}>
        <h2>{build.name}</h2>
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
        ></img>
      </div>
    );
  };

  return <div>{builds.length > 0 && builds.map(displayBuild)}</div>;
}

export default Builds;
