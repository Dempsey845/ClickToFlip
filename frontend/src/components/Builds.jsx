import Build from "./Build";
import Stats from "./Stats";

function Builds({ builds, onUpdate, darkMode }) {
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
                className={`card h-100 shadow-sm border-0 ${
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
