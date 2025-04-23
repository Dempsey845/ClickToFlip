import BuildComponent from "./BuildComponent";

function DisplayComponents({ build, onUpdate }) {
  const cpuComponent = {
    id: build.cpu_id,
    name: build.cpu_name,
    specs: build.cpu_specs,
    brand: build.cpu_brand,
    model: build.cpu_model,
  };
  const motherboardComponent = {
    id: build.motherboard_id,
    name: build.motherboard_name,
    specs: build.motherboard_specs,
    brand: build.motherboard_brand,
    model: build.motherboard_model,
  };
  const gpuComponents = build.gpus;
  return (
    <div className="components">
      <BuildComponent
        component={cpuComponent}
        type="CPU"
        buildId={build.id}
        onUpdate={onUpdate}
      />
      <BuildComponent
        component={motherboardComponent}
        type="Motherboard"
        buildId={build.id}
        onUpdate={onUpdate}
      />
      {gpuComponents?.map((gpu) => {
        return (
          <div key={gpu.id}>
            <BuildComponent
              component={gpu}
              type="GPU"
              buildId={build.id}
              onUpdate={onUpdate}
            />
          </div>
        );
      })}
    </div>
  );
}

export default DisplayComponents;
