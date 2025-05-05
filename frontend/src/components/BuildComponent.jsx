import { useEffect, useRef, useState } from "react";
import AddUserComponentModel from "./AddUserComponentModel";
import { changeComponent, removeBuildComponent } from "../handlers/apiHandler";
import AutocompleteInput from "./AutocompleteInput";

function parseSpecsString(specString) {
  if (!specString) return null;

  const result = {};

  // Split by commas, e.g., ["Cores: 6", " TDP: 65W"]
  const entries = specString.split(",");

  entries.forEach((entry) => {
    const [rawKey, rawValue] = entry.split(":");

    if (!rawKey || !rawValue) return;

    const key = rawKey.trim();
    const value = rawValue.trim();

    result[key] = value;
  });

  return result;
}

function convertParsedToFields(parsed) {
  /*
    {
      "Cores": 6,
      "TDP": "65W"
    } ->
    { key: "Cores", value: "6" },
    { key: "TDP", value: "65W" }
    */

  if (!parsed) {
    return null;
  }

  const fields = [];

  for (const [k, v] of Object.entries(parsed)) {
    fields.push({ key: k, value: `${v}` });
  }

  return fields;
}

function BuildComponent({
  component,
  type,
  buildId,
  onUpdate,
  useBuild = true,
  referenceId,
  userComponent = false,
  onUserComponentDelete,
  darkMode,
  viewOnly = false,
}) {
  // Component example:
  // {id: 7743, name: "djkal", specs: "socket: AM4, test: 10", "brand": "dafsa", model: "dadad"}
  // type: CPU / GPU / Motherboard
  const [localComponent, setLocalComponent] = useState({
    ...component,
    component_reference_id: referenceId,
    count: component.count,
    component_reference_ids: component.component_reference_ids,
  });
  const [parsedSpecs, setParsedSpecs] = useState(
    parseSpecsString(localComponent.specs)
  );
  const [showEditModel, setShowEditModel] = useState(false);
  const [editModelFields, setEditModelFields] = useState({
    type: "",
    fields: [{ key: "", value: "" }],
    name: "",
    title: "",
    brand: "",
    model: "",
    id: null,
  });
  const [update, setUpdate] = useState(false);

  const [showComponentChangeButton, setShowComponentChangeButton] =
    useState(false);
  const [newComponent, setNewComponent] = useState(null);

  const [prevComponentId, setPrevComponentId] = useState(
    component.component_id | localComponent.id
  );

  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPrevComponentId(localComponent.component_id | localComponent.id);
  }, [localComponent]);

  const handleComponentChange = (newC) => {
    setShowComponentChangeButton(true);
    setNewComponent({ ...newC, component_reference_id: referenceId });
    setParsedSpecs(parseSpecsString(localComponent.specs));
  };

  const handleComponentChangeSubmit = async () => {
    setLoading(true);
    try {
      await changeComponent(buildId, prevComponentId, newComponent);
      setParsedSpecs(parseSpecsString(newComponent.specs));
      setLocalComponent(newComponent);
      setShowComponentChangeButton(false);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const displaySpecs = () => {
    const mapped = Object.entries(parsedSpecs).map(([k, v]) => (
      <li
        key={k}
        className={`list-group-item ${
          darkMode ? "bg-dark text-light" : "bg-white text-dark"
        }`}
      >
        {k}: {v}
      </li>
    ));
    return mapped;
  };

  const handleNewUserComponent = async (data) => {
    setPrevComponentId(localComponent.component_id | localComponent.id);
    setNewComponent({ ...data, component_reference_id: referenceId });
    try {
      setLoading(true);
      if (useBuild) await changeComponent(buildId, prevComponentId, data);
    } finally {
      setLoading(false);
    }
    setParsedSpecs(parseSpecsString(data.specs));
    setLocalComponent({ ...data, component_reference_id: referenceId });
    onUpdate();
  };

  const handleUpdatedData = (data) => {
    setNewComponent({ ...data, component_reference_id: referenceId });
    setParsedSpecs(parseSpecsString(data.specs));
  };

  const removeGPU = async () => {
    if (localComponent.count && localComponent.count > 1) {
      const updatedIds = localComponent.component_reference_ids.slice(1);
      const newId = updatedIds[0];

      setLocalComponent((prev) => ({
        ...prev,
        component_reference_id: newId,
        component_reference_ids: updatedIds,
        count: prev.count - 1,
      }));

      setLoading(true);
      try {
        await removeBuildComponent(localComponent.component_reference_ids[0]);
      } finally {
        setLoading(false);
      }
    } else {
      setDeleted(true);
      setLoading(true);
      try {
        await removeBuildComponent(localComponent.component_reference_id);
      } finally {
        setLoading(false);
      }
    }

    onUpdate();
  };

  if (deleted) return null;

  return (
    <div className={`component ${darkMode ? "bg-dark text-light" : ""}`}>
      {showEditModel && (
        <AddUserComponentModel
          type={editModelFields.type}
          fields={editModelFields.fields}
          setShowAddComponentModal={setShowEditModel}
          defaultName={editModelFields.name}
          disabledNameInput={true}
          onClose={() => {
            setUpdate(false);
            setShowEditModel(false);
          }}
          customTitle={editModelFields.title}
          defaultBrand={editModelFields.brand}
          defaultModel={editModelFields.model}
          onComponentAddedWithData={handleNewUserComponent}
          update={update}
          componentId={editModelFields.id}
          onUpdate={onUpdate}
          onDataUpdated={handleUpdatedData}
          darkMode={darkMode}
        />
      )}
      {localComponent && (
        <div className={`card mb-3 ${darkMode ? "bg-dark text-light" : ""}`}>
          <div className={`card-header`}>
            <h5 className="mb-0">
              {type == "CPU" && <i className="bi bi-cpu"></i>}{" "}
              {type == "GPU" && <i className="bi bi-gpu-card"></i>}{" "}
              {type == "Motherboard" && <i className="bi bi-motherboard"></i>}{" "}
              {localComponent.name || "N/A"}{" "}
              {localComponent.count > 1 && `(${localComponent.count})`}
              {!viewOnly && (
                <button
                  disabled={loading}
                  onClick={() => {
                    const isCustom = localComponent.name.includes("(Custom)");
                    setUpdate(isCustom);
                    var compName = isCustom
                      ? localComponent.name
                      : `${localComponent.name} (Custom)`;
                    setEditModelFields({
                      type: type,
                      fields: convertParsedToFields(parsedSpecs),
                      name: compName,
                      title: `Edit ${compName} Properties`,
                      brand: localComponent.brand,
                      model: localComponent.model,
                      id: localComponent.id,
                    });
                    setShowEditModel(true);
                  }}
                  className={`btn btn-outline-primary btn-sm ms-2 ${
                    darkMode ? "dark-btn" : ""
                  }`}
                  title={`Edit ${type}`}
                >
                  <i className="bi bi-gear-fill"></i>
                </button>
              )}
              {!viewOnly && type === "GPU" && !userComponent && (
                <button
                  disabled={loading}
                  className={`btn btn-outline-danger btn-sm ms-2 ${
                    darkMode ? "dark-btn" : ""
                  }`}
                  onClick={removeGPU}
                >
                  <i className="bi bi-trash3"></i>
                </button>
              )}
              {!viewOnly && userComponent && (
                <button
                  disabled={loading}
                  className={`btn btn-outline-danger btn-sm ms-2 ${
                    darkMode ? "dark-btn" : ""
                  }`}
                  onClick={() => {
                    onUserComponentDelete(localComponent.id);
                    setDeleted(true);
                  }}
                >
                  <i className="bi bi-trash3"></i>
                </button>
              )}
            </h5>
            {!viewOnly && useBuild && (
              <AutocompleteInput
                type={type}
                onSelect={handleComponentChange}
                darkMode={darkMode}
                ƒ
              />
            )}
            {!viewOnly && showComponentChangeButton && (
              <button
                disabled={loading}
                className={`btn btn-sm btn-outline-primary mt-2 ${
                  darkMode ? "dark-btn" : ""
                }`}
                onClick={handleComponentChangeSubmit}
              >
                Change {type}
              </button>
            )}
          </div>
          <div
            className={`card-body ${
              darkMode ? "bg-dark text-light" : "bg-white text-dark"
            }`}
          >
            {parsedSpecs && Object.keys(parsedSpecs).length > 0 ? (
              <ul
                className={`list-group list-group-flush ${
                  darkMode ? "bg-dark text-light" : "bg-white text-dark"
                }`}
              >
                {displaySpecs()}
              </ul>
            ) : (
              <p
                className={`text-muted ${
                  darkMode ? "text-light" : "text-dark"
                }`}
              >
                No {type} specs available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuildComponent;
