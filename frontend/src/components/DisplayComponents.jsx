import AutocompleteInput from "./AutocompleteInput";
import {
  addGPUToBuild,
  changeComponent,
  deleteGPUFromBuild,
} from "../handlers/apiHandler";
import { useState } from "react";
import AddUserComponentModel from "./AddUserComponentModel";

function parseCpuSpecsString(specString) {
  const result = {};

  // Split by commas, e.g., ["Cores: 6", " TDP: 65W"]
  const entries = specString.split(",");

  entries.forEach((entry) => {
    const [rawKey, rawValue] = entry.split(":");

    if (!rawKey || !rawValue) return;

    const key = rawKey.trim();
    const value = rawValue.trim();

    switch (key) {
      case "Cores":
        const cores = parseInt(value, 10);
        if (!isNaN(cores)) {
          result.Cores = cores;
        }
        break;

      case "TDP":
        // Accept strings like "65W" or "N/A"
        if (value.toLowerCase() !== "naw" && value.toLowerCase() !== "n/a") {
          result.TDP = value;
        }
        break;
      default:
        if (value.toLowerCase() != "naw" && value.toLowerCase() != "n/a") {
          result[key] = value;
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
  if (!specString || typeof specString !== "string") return result;

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
  build,
  cpuName,
  cpuSpecs,
  gpus,
  motherboardName,
  motherboardSpecs,
  onUpdate,
}) {
  const [showChangeCpuButton, setShowChangeCpuButton] = useState(false);
  const [showChangeMoboButton, setShowChangeMoboButton] = useState(false);
  const [showChangeGpusButton, setShowChangeGpusButton] = useState(false);
  const [newCPU, setNewCPU] = useState(null);
  const [newGPU, setNewGPU] = useState(null);
  const [newMobo, setNewMobo] = useState(null);
  const [localGpus, setLocalGpus] = useState(gpus || []);
  const [showEditModel, setShowEditModel] = useState(false);
  const [editModelFields, setEditModelFields] = useState({
    type: "",
    fields: [{ key: "", value: "" }],
    name: "",
    title: "",
    brand: "",
    model: "",
  });
  const parsedCpuSpecs = parseCpuSpecsString(cpuSpecs);
  const parsedMoboSpecs = parseMotherboardSpecsString(motherboardSpecs);

  const handleAddGPU = () => {
    if (newGPU) {
      setLocalGpus((prev) => [...prev, newGPU]);
      setNewGPU(null);
      addGPUToBuild(build.id, newGPU.id);
    }
  };

  const handleCPUChange = (component) => {
    setShowChangeCpuButton(true);
    setNewCPU(component);
  };

  const handleCPUSubmit = async () => {
    await changeComponent(build.id, build.cpu_id, newCPU);
    setShowChangeCpuButton(false);
    onUpdate();
  };

  const handleMoboChange = (component) => {
    setShowChangeMoboButton(true);
    setNewMobo(component);
  };

  const handleMoboSubmit = async () => {
    await changeComponent(build.id, build.motherboard_id, newMobo);
    setShowChangeMoboButton(false);
    onUpdate();
  };

  const handleGPUChange = (selected, index) => {
    setLocalGpus((prev) => {
      const updated = [...prev];
      updated[index] = selected;
      return updated;
    });
  };

  const handleGPUSubmit = async (gpuIndex) => {
    await changeComponent(build.id, build.gpu_ids[gpuIndex], newGPU);
    setShowChangeGpusButton(false);
    onUpdate();
  };

  const displaySpecs = (parsedSpecs) => {
    const mapped = Object.entries(parsedSpecs).map(([k, v]) => (
      <li key={k} className="list-group-item">
        {k}: {v}
      </li>
    ));
    return mapped;
  };

  const convertParsedToFields = (parsed) => {
    /*
    {
      "Cores": 6,
      "TDP": "65W"
    } ->
    { key: "Cores", value: "6" },
    { key: "TDP", value: "65W" }
    */

    const fields = [];

    for (const [k, v] of Object.entries(parsed)) {
      fields.push({ key: k, value: `${v}` });
    }

    return fields;
  };

  return (
    <div className="container mt-4">
      {showEditModel && (
        <AddUserComponentModel
          type={editModelFields.type}
          fields={editModelFields.fields}
          setShowAddComponentModal={setShowEditModel}
          defaultName={editModelFields.name}
          disabledNameInput={true}
          onClose={() => {
            setShowEditModel(false);
          }}
          customTitle={editModelFields.title}
          defaultBrand={editModelFields.brand}
          defaultModel={editModelFields.model}
        />
      )}
      {/* CPU */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">CPU: {cpuName || "N/A"}</h5>
          <button
            onClick={() => {
              setEditModelFields({
                type: "CPU",
                fields: convertParsedToFields(parsedCpuSpecs),
                name: `${cpuName} (Custom)`,
                title: `Edit ${cpuName} Properties`,
                brand: build.cpu_brand,
                model: build.cpu_model,
              });
              setShowEditModel(true);
            }}
            className="btn btn-primary mb-3"
          >
            Edit CPU
          </button>
        </div>
        <div className="card-body">
          {parsedCpuSpecs && Object.keys(parsedCpuSpecs).length > 0 ? (
            <ul className="list-group list-group-flush">
              {displaySpecs(parsedCpuSpecs)}
            </ul>
          ) : (
            <p className="text-muted">No CPU specs available.</p>
          )}
          <p>Change CPU: </p>
          <AutocompleteInput type={"CPU"} onSelect={handleCPUChange} />
          {showChangeCpuButton && (
            <button onClick={handleCPUSubmit}>Update CPU</button>
          )}
        </div>
      </div>

      {/* GPUs */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">GPU{localGpus?.length !== 1 ? "s" : ""}</h5>
        </div>
        <div className="card-body">
          {localGpus?.length === 0 ? (
            <p className="text-muted">No GPUs added.</p>
          ) : (
            localGpus.length > 0 &&
            localGpus?.map((gpu, index) => {
              const parsedSpecs = parseGpuSpecsString(gpu.specs);
              return (
                <div key={gpu.id} className="mb-4">
                  <strong>{gpu.name}</strong>
                  <button className="btn btn-primary mb-3">Edit GPU</button>
                  {parsedSpecs && Object.keys(parsedSpecs).length > 0 ? (
                    <ul className="list-group list-group-flush mt-1">
                      {displaySpecs(parsedSpecs)}
                    </ul>
                  ) : (
                    <p className="text-muted">No GPU specs available.</p>
                  )}
                  <button
                    onClick={async () => {
                      await deleteGPUFromBuild(build.id, gpu.id);
                      onUpdate();
                    }}
                    className="btn btn-sm btn-outline-danger ms-2"
                  >
                    Remove
                  </button>
                  <p>Change GPU: </p>
                  <AutocompleteInput
                    type={"GPU"}
                    onSelect={(selectedGPU) =>
                      handleGPUChange(selectedGPU, index)
                    }
                  />
                  {showChangeGpusButton && (
                    <button
                      onClick={() => handleGPUSubmit(index)}
                      className="btn btn-sm btn-outline-primary mt-2"
                    >
                      Update GPU
                    </button>
                  )}
                </div>
              );
            })
          )}

          {/* Add GPU Section */}
          <hr />
          <h6>Add New GPU:</h6>
          <AutocompleteInput type={"GPU"} onSelect={setNewGPU} />
          <button onClick={handleAddGPU} className="btn btn-success mt-2">
            Add GPU
          </button>
        </div>
      </div>

      {/* Motherboard */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Motherboard: {motherboardName || "N/A"}</h5>
          <button className="btn btn-primary mb-3">Edit Motherboard</button>
        </div>
        <div className="card-body">
          {parsedMoboSpecs && Object.keys(parsedMoboSpecs).length > 0 ? (
            <ul className="list-group list-group-flush">
              {displaySpecs(parsedMoboSpecs)}
            </ul>
          ) : (
            <p className="text-muted">No motherboard specs available.</p>
          )}
          <p>Change Motherboard: </p>
          <AutocompleteInput type={"Motherboard"} onSelect={handleMoboChange} />
          {showChangeMoboButton && (
            <button onClick={handleMoboSubmit}>Update Motherboard</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayComponents;
