import { useState } from "react";
import Build from "./Build";
import Stats from "./Stats";
import { duplicateBuild } from "../handlers/apiHandler";

// --- Sort Functions ---
const sortFunctions = {
  newest: (a, b) => new Date(b.sold_date) - new Date(a.sold_date),
  oldest: (a, b) => new Date(a.sold_date) - new Date(b.sold_date),
  saleHigh: (a, b) => b.sale_price - a.sale_price,
  saleLow: (a, b) => a.sale_price - b.sale_price,
  costHigh: (a, b) => b.total_cost - a.total_cost,
  costLow: (a, b) => a.total_cost - b.total_cost,
};

// --- Filter Function (excluding sold items) ---
function filterBuilds(builds, statusFilter) {
  if (!Array.isArray(builds)) return [];
  return builds.filter((build) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "notSold") return build.status !== "sold";
    return build.status === statusFilter;
  });
}

function Builds({ builds = [], onUpdate, darkMode }) {
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "sold", "notSold"

  let filtered = filterBuilds(builds, statusFilter);

  if (sortOption && sortFunctions[sortOption]) {
    filtered = [...filtered].sort(sortFunctions[sortOption]);
  }

  const handleDuplicate = async (build) => {
    const newBuild = await duplicateBuild(build);
    onUpdate();
  };

  const displayBuild = (build) => (
    <Build
      key={build.id}
      build={build}
      onUpdate={onUpdate}
      darkMode={darkMode}
      onDuplicate={handleDuplicate}
    />
  );

  return (
    <div className={`container py-4 ${darkMode ? "bg-dark text-light" : ""}`}>
      <Stats builds={builds} darkMode={darkMode} />

      {/* Filter + Sort UI */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Sort By</label>
          <select
            className="form-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Newest Sold</option>
            <option value="oldest">Oldest Sold</option>
            <option value="saleHigh">Sold Price: High to Low</option>
            <option value="saleLow">Sold Price: Low to High</option>
            <option value="costHigh">Cost: High to Low</option>
            <option value="costLow">Cost Price: Low to High</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="sold">Sold</option>
            <option value="notSold">Not Sold</option>
          </select>
        </div>
      </div>

      {/* Builds Display */}
      {filtered.length > 0 ? (
        <div className="row g-4">
          {filtered.map((build, index) => (
            <div key={build.id || index} className="col-12 col-md-6 col-lg-6">
              <div
                className={`card shadow-sm border-0 ${
                  darkMode ? "dark-card" : ""
                }`}
              >
                <div
                  className={`card-body d-flex flex-column ${
                    darkMode ? "dark-card-body" : ""
                  }`}
                >
                  {displayBuild(build)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`alert alert-info text-center mt-4 ${
            darkMode ? "text-light bg-dark" : ""
          }`}
          role="alert"
        >
          No builds match your filters.
        </div>
      )}
    </div>
  );
}

export default Builds;
