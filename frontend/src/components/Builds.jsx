import Build from "./Build";

function Builds({ builds, onUpdate }) {
  const displayBuild = (build) => {
    return <Build key={build.id} build={build} onUpdate={onUpdate} />;
  };

  return <div>{builds.length > 0 && builds.map(displayBuild)}</div>;
}

export default Builds;
