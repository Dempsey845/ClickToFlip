import BuildComponent from "./BuildComponent";

function DisplayComponents({ build, onUpdate }) {
  // Filter the components array to get unique components based on component_reference_id
  const uniqueComponents = build.components?.filter(
    (component, index, self) =>
      index ===
      self.findIndex(
        (c) => c.component_reference_id === component.component_reference_id
      )
  );

  return (
    <div className="components">
      {uniqueComponents?.map((component, index) => {
        return (
          <div key={`${build.id}-${component.id}-${index}`}>
            <BuildComponent
              component={component}
              type={component.type}
              buildId={build.id}
              onUpdate={onUpdate}
              referenceId={component.component_reference_id}
            />
          </div>
        );
      })}
    </div>
  );
}

export default DisplayComponents;
