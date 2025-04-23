import { useState } from "react";
import AddUserComponentModel from "./AddUserComponentModel";
import { changeComponent } from "../handlers/apiHandler";
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

function BuildComponent({ component, type, buildId, onUpdate }) {
  // Component example:
  // {id: 7743, name: "djkal", specs: "socket: AM4, test: 10", "brand": "dafsa", model: "dadad"}
  // type: CPU / GPU / Motherboard
  const [localComponent, setLocalComponent] = useState(component);
  const [prevComponentId, setPrevComponentId] = useState(component.id);
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

  const handleComponentChange = (newC) => {
    setShowComponentChangeButton(true);
    setNewComponent(newC);
    setParsedSpecs(parseSpecsString(localComponent.specs));
  };

  const handleComponentChangeSubmit = async () => {
    if (!newComponent || !newComponent.id) {
      console.log("No new component or id");
    }
    await changeComponent(buildId, prevComponentId, newComponent);
    setParsedSpecs(parseSpecsString(newComponent.specs));
    setPrevComponentId(newComponent.id);
    setLocalComponent(newComponent);
    setShowComponentChangeButton(false);
    onUpdate();
  };

  const displaySpecs = () => {
    const mapped = Object.entries(parsedSpecs).map(([k, v]) => (
      <li key={k} className="list-group-item">
        {k}: {v}
      </li>
    ));
    return mapped;
  };

  const handleNewUserComponent = async (data) => {
    setNewComponent(data);
    await changeComponent(buildId, prevComponentId, data);
    setPrevComponentId(data.id);
    setParsedSpecs(parseSpecsString(data.specs));
    setLocalComponent(data);
    onUpdate();
  };

  return (
    <div key={localComponent.id} className="component">
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
        />
      )}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">
            {type == "CPU" && <i class="bi bi-cpu"></i>}{" "}
            {type == "GPU" && <i class="bi bi-gpu-card"></i>}{" "}
            {type == "Motherboard" && <i class="bi bi-motherboard"></i>}{" "}
            {localComponent.name || "N/A"}
            <button
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
              className="btn btn-outline-primary btn-sm ms-2"
              title={`Edit ${type}`}
            >
              <i className="bi bi-gear-fill"></i>
            </button>
          </h5>
          <AutocompleteInput type={type} onSelect={handleComponentChange} />
          {showComponentChangeButton && (
            <button
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={handleComponentChangeSubmit}
            >
              Change {type}
            </button>
          )}
        </div>
        <div className="card-body">
          {parsedSpecs && Object.keys(parsedSpecs).length > 0 ? (
            <ul className="list-group list-group-flush">{displaySpecs()}</ul>
          ) : (
            <p className="text-muted">No {type} specs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuildComponent;
