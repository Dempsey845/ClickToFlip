function parseCpuSpecsString(specString) {
  const result = {};

  // Split by commas, e.g., ["Cores: 6", " TDP: 65W"]
  const entries = specString.split(",");

  entries.forEach((entry) => {
    const [rawKey, rawValue] = entry.split(":");

    if (!rawKey || !rawValue) return;

    const key = rawKey.trim().toLowerCase();
    const value = rawValue.trim();

    switch (key) {
      case "cores":
        const cores = parseInt(value, 10);
        if (!isNaN(cores)) {
          result.cores = cores;
        }
        break;

      case "tdp":
        // Accept strings like "65W" or "N/A"
        if (value.toLowerCase() !== "naw" && value.toLowerCase() !== "n/a") {
          result.tdp = value;
        }
        break;
    }
  });

  return result;
}

function parseMotherboardSpecsString(specString) {
  const result = {};

  // Split by commas: ["Socket: AM4", " Chipset: AMD B450"]
  const entries = specString.split(",");

  entries.forEach((entry) => {
    const [rawKey, rawValue] = entry.split(":");

    if (!rawKey || !rawValue) return;

    const key = rawKey.trim().toLowerCase();
    const value = rawValue.trim();

    switch (key) {
      case "socket":
        if (value && value.toLowerCase() !== "n/a") {
          result.socket = value;
        }
        break;

      case "chipset":
        if (value && value.toLowerCase() !== "n/a") {
          result.chipset = value;
        }
        break;
    }
  });

  return result;
}

function parseGpuSpecsString(specString) {
  const result = {};
  const entries = specString.split(",");

  entries.forEach((entry) => {
    const [rawKey, rawValue] = entry.split(":");
    if (!rawKey || !rawValue) return;

    const key = rawKey.trim().toLowerCase();
    const value = rawValue.trim();

    if (key === "memory" && value.toLowerCase() !== "unknown") {
      result.memory = value;
    }
  });

  return result;
}

function DisplayComponents({
  cpuName,
  cpuSpecs,
  gpus,
  motherboardName,
  motherboardSpecs,
}) {
  const parsedCpuSpecs = parseCpuSpecsString(cpuSpecs);
  const parsedMoboSpecs = parseMotherboardSpecsString(motherboardSpecs);

  return (
    <div className="container mt-4">
      {/* CPU */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">CPU: {cpuName || "N/A"}</h5>
        </div>
        <div className="card-body">
          {parsedCpuSpecs && Object.keys(parsedCpuSpecs).length > 0 ? (
            <ul className="list-group list-group-flush">
              {parsedCpuSpecs.cores !== undefined && (
                <li className="list-group-item">
                  Cores: {parsedCpuSpecs.cores}
                </li>
              )}
              {parsedCpuSpecs.tdp && (
                <li className="list-group-item">TDP: {parsedCpuSpecs.tdp}</li>
              )}
            </ul>
          ) : (
            <p className="text-muted">No CPU specs available.</p>
          )}
        </div>
      </div>

      {/* GPUs */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">GPU{gpus.length !== 1 ? "s" : ""}</h5>
        </div>
        <div className="card-body">
          {gpus.length === 0 ? (
            <p className="text-muted">No GPUs added.</p>
          ) : (
            gpus.map((gpu, index) => {
              const parsedSpecs = parseGpuSpecsString(gpu.specs);
              return (
                <div key={index} className="mb-3">
                  <strong>{gpu.name}</strong>
                  {parsedSpecs && Object.keys(parsedSpecs).length > 0 ? (
                    <ul className="list-group list-group-flush mt-1">
                      {parsedSpecs.memory && (
                        <li className="list-group-item">
                          Memory: {parsedSpecs.memory}
                        </li>
                      )}
                      {/* Add more GPU specs here if needed */}
                    </ul>
                  ) : (
                    <p className="text-muted">No GPU specs available.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Motherboard */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Motherboard: {motherboardName || "N/A"}</h5>
        </div>
        <div className="card-body">
          {parsedMoboSpecs && Object.keys(parsedMoboSpecs).length > 0 ? (
            <ul className="list-group list-group-flush">
              {parsedMoboSpecs.socket && (
                <li className="list-group-item">
                  Socket: {parsedMoboSpecs.socket}
                </li>
              )}
              {parsedMoboSpecs.chipset && (
                <li className="list-group-item">
                  Chipset: {parsedMoboSpecs.chipset}
                </li>
              )}
            </ul>
          ) : (
            <p className="text-muted">No motherboard specs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayComponents;
