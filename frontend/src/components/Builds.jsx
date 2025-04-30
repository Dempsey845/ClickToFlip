import Build from "./Build";
import Stats from "./Stats";

function sortByNewest(builds) {
  return builds.sort((a, b) => {
    const aSold = a.status === "sold";
    const bSold = b.status === "sold";

    if (!aSold && bSold) return -1; // a is unsold, b is sold => a comes first
    if (aSold && !bSold) return 1; // a is sold, b is unsold => b comes first

    // Both are either sold or unsold; sort by date if sold
    if (aSold && bSold) {
      return new Date(b.sold_date) - new Date(a.sold_date); // recent first
    }

    return 0; // both are unsold
  });
}

function sortByOldest(builds) {
  // Show unsold builds first, then oldest builds (by sold_date)
  return builds.sort((a, b) => {
    const aSold = a.status === "sold";
    const bSold = b.status === "sold";

    if (!aSold && bSold) return -1; // a is unsold, b is sold → a first
    if (aSold && !bSold) return 1; // a is sold, b is unsold → b first

    // Both sold → sort by sold_date ASCENDING
    if (aSold && bSold) {
      return new Date(a.sold_date) - new Date(b.sold_date);
    }

    return 0; // both unsold
  });
}

function Builds({ builds, onUpdate, darkMode }) {
  builds = sortByNewest();

  const displayBuild = (build) => {
    return (
      <Build
        key={build.id}
        build={build}
        onUpdate={onUpdate}
        darkMode={darkMode}
      />
    );
  };

  if (builds.length === 0) {
    return (
      <div
        className={`alert alert-info text-center mt-3 ${
          darkMode ? "text-light bg-dark" : ""
        }`}
        role="alert"
      >
        <h5 className="mb-0">Add a build to get started!</h5>
      </div>
    );
  }

  return (
    <div className={`container py-4 ${darkMode ? "bg-dark text-light" : ""}`}>
      <Stats builds={builds} darkMode={darkMode} />

      {builds.length > 0 ? (
        <div className="row g-4">
          {builds.map((build, index) => (
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
          No builds yet. Start by creating your first one!
        </div>
      )}
    </div>
  );
}

export default Builds;
