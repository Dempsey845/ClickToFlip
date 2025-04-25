import { useEffect, useState } from "react";
import BuildComponent from "./BuildComponent";

function DisplayComponents({ build, onUpdate }) {
  const [gpusGrouped, setGpusGrouped] = useState([]);

  const uniqueComponents = build.components?.filter(
    (component, index, self) =>
      index ===
      self.findIndex(
        (c) => c.component_reference_id === component.component_reference_id
      )
  );

  const otherComponents = uniqueComponents?.filter(
    (component) => component.type !== "GPU"
  );

  useEffect(() => {
    if (!uniqueComponents) return;

    const gpusRaw = uniqueComponents.filter(
      (component) => component.type === "GPU"
    );

    const gpuMap = new Map();

    gpusRaw.forEach((gpu) => {
      const name = gpu.name;
      const id = gpu.component_reference_id;

      if (gpuMap.has(name)) {
        const existing = gpuMap.get(name);
        existing.count += 1;
        existing.component_reference_ids.push(id);
      } else {
        gpuMap.set(name, {
          ...gpu,
          count: 1,
          component_reference_ids: [id],
        });
      }
    });

    const newGrouped = Array.from(gpuMap.values());
    console.log("gpu grouped: ", newGrouped);

    setGpusGrouped([...newGrouped]);
  }, [build]); // track build updates

  return (
    <div className="components">
      {otherComponents?.map((component, index) => (
        <div key={`${build.id}-${component.id}-${index}`}>
          <BuildComponent
            component={component}
            type={component.type}
            buildId={build.id}
            onUpdate={onUpdate}
            referenceId={component.component_reference_id}
          />
        </div>
      ))}
      {gpusGrouped?.map((component, index) => {
        return (
          <div
            key={`${build.id}-${component.component_reference_id}-${component.count}-${index}`}
          >
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
