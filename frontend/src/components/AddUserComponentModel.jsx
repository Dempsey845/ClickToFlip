import React, { useState } from "react";
import { addUserComponent, updateUserComponent } from "../handlers/apiHandler";

const AddUserComponentModel = ({
  type,
  setShowAddComponentModal,
  onClose,
  onComponentAdded,
  onComponentAddedWithData,
  fields = [
    { key: "Cores", value: "" },
    { key: "TDP", value: "" },
  ],
  defaultName = "",
  customTitle = null,
  disabledNameInput = false,
  defaultBrand = "",
  defaultModel = "",
  update = false,
  componentId,
  onUpdate,
  onDataUpdated,
  addingCustom = false,
  darkMode = false,
}) => {
  const [name, setName] = useState(defaultName);
  const [brand, setBrand] = useState(defaultBrand);
  const [model, setModel] = useState(defaultModel);
  const [specFields, setSpecFields] = useState(fields);
  const [loading, setLoading] = useState(false);

  const getBrandOptions = (componentType) => {
    switch (componentType) {
      case "CPU":
        return ["AMD", "Intel", "ARM", "Qualcomm"];
      case "GPU":
        return ["NVIDIA", "AMD", "Intel"];
      case "Motherboard":
        return ["ASUS", "MSI", "Gigabyte", "ASRock"];
      default:
        return [];
    }
  };

  const getModelPlaceholder = (componentType) => {
    switch (componentType) {
      case "CPU":
        return "e.g., Ryzen 5, Intel i7";
      case "GPU":
        return "e.g., RTX 2060, GTX 1080";
      case "Motherboard":
        return "e.g., ASUS ROG, MSI Tomahawk";
      default:
        return "Enter model";
    }
  };

  const handleAddSpecField = () => {
    setSpecFields((prevFields) => [
      ...(prevFields || []),
      { key: "", value: "" },
    ]);
  };

  const handleRemoveSpecField = (index) => {
    const newFields = [...specFields];
    newFields.splice(index, 1);
    setSpecFields(newFields);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specFields];
    updated[index][field] = value;
    setSpecFields(updated);
  };

  const handleSave = async () => {
    // Ensure specFields is never null or undefined, default to an empty array
    const validSpecFields = Array.isArray(specFields) ? specFields : [];

    // Check if required fields are filled
    if (!name.trim() || !brand.trim() || !model.trim()) {
      alert("Please fill in all required fields: Name, Brand, and Model.");
      return;
    }

    // Check for empty or null spec fields
    const invalidSpecField = validSpecFields.some(
      (field) => !field.key.trim() || !field.value.trim()
    );

    if (invalidSpecField) {
      alert("Please fill in all spec fields properly.");
      return;
    }

    setLoading(true);

    // Generate the specs string
    const specsString = validSpecFields
      .filter((f) => f.key.trim() && f.value.trim())
      .map((f) => `${f.key.trim()}: ${f.value.trim()}`)
      .join(", ");

    const newComponent = { name, type, brand, model, specs: specsString };
    if (addingCustom) newComponent.name += " (Custom)";

    let data;

    try {
      data = update
        ? await updateUserComponent(componentId, newComponent)
        : await addUserComponent(newComponent);

      setShowAddComponentModal(false);
      onClose?.();

      if (update) onDataUpdated?.(data);
      if (onComponentAdded) onComponentAdded();
      if (!update && onComponentAddedWithData) onComponentAddedWithData(data);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the component. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const brandOptions = getBrandOptions(type);
  const modelPlaceholder = getModelPlaceholder(type);

  return (
    <div
      className={`modal show fade ${darkMode ? "bg-dark text-white" : ""}`}
      style={{ display: "block" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className={`modal-content ${darkMode ? "bg-dark text-white" : ""}`}
        >
          <div className="modal-header">
            <h5 className="modal-title">{customTitle || `Add New ${type}`}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                onClose();
                setShowAddComponentModal(false);
              }}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Name:</label>
              <input
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${type} name`}
                disabled={disabledNameInput}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Brand:</label>
              <select
                className="form-select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Select brand</option>
                {brandOptions.map((b, i) => (
                  <option key={i} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Model:</label>
              <input
                className="form-control"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={modelPlaceholder}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold fs-5 mb-3 d-block">
                Specs:
              </label>

              {specFields?.map((field, index) => (
                <div
                  className="d-flex gap-2 align-items-center mb-2"
                  key={index}
                >
                  <input
                    className="form-control"
                    style={{ maxWidth: "200px" }}
                    value={field.key}
                    onChange={(e) =>
                      handleSpecChange(index, "key", e.target.value)
                    }
                    placeholder="Spec key (e.g., Cores)"
                  />
                  <input
                    className="form-control"
                    style={{ maxWidth: "200px" }}
                    value={field.value}
                    onChange={(e) =>
                      handleSpecChange(index, "value", e.target.value)
                    }
                    placeholder="Value (e.g., 8)"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger px-3 py-1"
                    onClick={() => handleRemoveSpecField(index)}
                    disabled={loading}
                    title="Remove Spec"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={handleAddSpecField}
                  disabled={loading}
                >
                  + Add Spec
                </button>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                setShowAddComponentModal(false);
              }}
              disabled={loading}
            >
              Close
            </button>
            {/*update && <button className="btn btn-danger">Delete</button>*/}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Loading..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserComponentModel;
