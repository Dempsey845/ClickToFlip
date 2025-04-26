import Build from "./Build";
import Stats from "./Stats";

function Builds({ builds, onUpdate }) {
  const displayBuild = (build) => {
    return <Build key={build.id} build={build} onUpdate={onUpdate} />;
  };

  if (builds.length === 0) {
    return (
      <div className="alert alert-info text-center mt-3" role="alert">
        <h5 className="mb-0">Add a build to get started!</h5>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Stats builds={builds} />

      {builds.length > 0 ? (
        <div className="row g-4">
          {builds.map((build, index) => (
            <div key={build.id || index} className="col-12 col-md-6 col-lg-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  {displayBuild(build)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center mt-4" role="alert">
          No builds yet. Start by creating your first one!
        </div>
      )}
    </div>
  );
}

export default Builds;
