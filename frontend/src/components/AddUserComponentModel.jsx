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
  darkMode = false, // Add darkMode as a prop
}) => {
  const [name, setName] = useState(defaultName);
  const [brand, setBrand] = useState(defaultBrand);
  const [model, setModel] = useState(defaultModel);
  const [specFields, setSpecFields] = useState(fields);

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
    setSpecFields([...specFields, { key: "", value: "" }]);
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
    if (!name.trim() || !brand.trim() || !model.trim()) {
      alert("Please fill in all required fields: Name, Brand, and Model.");
      return;
    }

    const specsString = specFields
      .filter((f) => f.key.trim() && f.value.trim())
      .map((f) => `${f.key.trim()}: ${f.value.trim()}`)
      .join(", ");

    const newComponent = { name, type, brand, model, specs: specsString };

    if (addingCustom) {
      newComponent.name = newComponent.name + " (Custom)";
    }

    const data = update
      ? await updateUserComponent(componentId, newComponent)
      : await addUserComponent(newComponent);
    setShowAddComponentModal(false);

    if (update) onDataUpdated(data);

    if (onComponentAdded) onComponentAdded(); // trigger refresh
    if (onComponentAddedWithData && !update) onComponentAddedWithData(data);
    if (onUpdate) onUpdate();
  };

  const handleClose = () => {
    onClose();
    setShowAddComponentModal(false);
  };

  const brandOptions = getBrandOptions(type);
  const modelPlaceholder = getModelPlaceholder(type);

  return (
    <div
      style={{
        ...styles.overlay,
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)", // Adjust overlay for dark mode
      }}
    >
      <div
        style={{
          ...styles.modal,
          backgroundColor: darkMode ? "#333" : "white", // Dark or light background for modal
          color: darkMode ? "#fff" : "#000", // Text color based on dark mode
        }}
      >
        {customTitle ? <h2>{customTitle}</h2> : <h2>Add New {type}</h2>}

        <label style={{ color: darkMode ? "#fff" : "#000" }}>Name:</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Enter ${type} name`}
          style={{
            ...styles.input,
            backgroundColor: darkMode ? "#444" : "#fff", // Input background
            color: darkMode ? "#fff" : "#000", // Input text color
          }}
          disabled={disabledNameInput}
        />

        <label style={{ color: darkMode ? "#fff" : "#000" }}>Brand:</label>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          style={{
            ...styles.input,
            backgroundColor: darkMode ? "#444" : "#fff", // Select background
            color: darkMode ? "#fff" : "#000", // Select text color
          }}
        >
          <option value="">Select brand</option>
          {brandOptions.map((b, i) => (
            <option key={i} value={b}>
              {b}
            </option>
          ))}
        </select>

        <label style={{ color: darkMode ? "#fff" : "#000" }}>Model:</label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={modelPlaceholder}
          style={{
            ...styles.input,
            backgroundColor: darkMode ? "#444" : "#fff", // Input background
            color: darkMode ? "#fff" : "#000", // Input text color
          }}
        />

        <label style={{ color: darkMode ? "#fff" : "#000" }}>Specs:</label>
        {specFields?.map((field, index) => (
          <div key={index} style={styles.specRow}>
            <input
              value={field.key}
              onChange={(e) => handleSpecChange(index, "key", e.target.value)}
              placeholder="Spec key (e.g., Cores)"
              style={{
                ...styles.specInput,
                backgroundColor: darkMode ? "#444" : "#fff", // Spec input background
                color: darkMode ? "#fff" : "#000", // Spec input text color
              }}
            />
            <input
              value={field.value}
              onChange={(e) => handleSpecChange(index, "value", e.target.value)}
              placeholder="Value (e.g., 8)"
              style={{
                ...styles.specInput,
                backgroundColor: darkMode ? "#444" : "#fff", // Spec input background
                color: darkMode ? "#fff" : "#000", // Spec input text color
              }}
            />
            <button
              onClick={() => handleRemoveSpecField(index)}
              style={styles.removeBtn}
            >
              ✕
            </button>
          </div>
        ))}
        <button onClick={handleAddSpecField} style={styles.addBtn}>
          + Add Spec
        </button>

        <div style={styles.actions}>
          <button onClick={handleClose} style={styles.cancelBtn}>
            Close
          </button>
          {update && <button style={styles.removeBtn}>Delete</button>}
          <button onClick={handleSave} style={styles.saveBtn}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1050, // Ensure overlay is above everything else
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1060, // Ensure modal content is above the overlay
    position: "relative", // Make sure modal content stays relative to its overlay
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },
  specRow: {
    display: "flex",
    gap: "5px",
    marginBottom: "8px",
  },
  specInput: {
    flex: 1,
    padding: "6px",
  },
  removeBtn: {
    backgroundColor: "red",
    color: "white",
    border: "none",
    padding: "0 8px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  addBtn: {
    marginBottom: "10px",
    backgroundColor: "#28a745",
    color: "white",
    padding: "6px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  cancelBtn: {
    backgroundColor: "#ccc",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  saveBtn: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AddUserComponentModel;
