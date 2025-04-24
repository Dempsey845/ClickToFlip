import Build from "./Build";
import Stats from "./Stats";

function Builds({ builds, onUpdate }) {
  const displayBuild = (build) => {
    return <Build key={build.id} build={build} onUpdate={onUpdate} />;
  };

  console.log(builds);

  return (
    <div>
      <Stats builds={builds} /> {builds.length > 0 && builds.map(displayBuild)}
    </div>
  );
}

export default Builds;
