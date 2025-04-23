import React, { useState, useEffect } from "react";
import {
  getCPUComponents,
  getGPUComponents,
  getMotherboardComponents,
} from "../handlers/apiHandler";
import AddUserComponentModel from "./AddUserComponentModel";

const AutocompleteInput = ({ type, onSelect }) => {
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);
  const [updates, setUpdates] = useState([]);

  const fetchComponents = async () => {
    try {
      let data = [];

      if (type === "CPU") {
        data = await getCPUComponents();
      } else if (type === "GPU") {
        data = await getGPUComponents();
      } else if (type === "Motherboard") {
        data = await getMotherboardComponents();
      } else {
        console.warn(`Unsupported component type: ${type}`);
        return;
      }

      setComponents(data);
    } catch (err) {
      console.error("Error fetching components:", err);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [type, updates]);

  const handleUpdate = () => {
    setUpdates((prev) => {
      return [...prev, "Input updated"];
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query) {
      const matches = components.filter(
        (component) =>
          component.name &&
          component.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredComponents(matches);
    } else {
      setFilteredComponents([]);
    }
  };

  const handleSelect = (component) => {
    setSearchTerm(component.name);
    setSelectedComponent(component);
    setFilteredComponents([]);
    setShowAddComponentModal(false); // Hide modal once a component is selected
    onSelect(component); // Returns full { id, name, type } object
  };

  return (
    <div className="mb-3">
      <input
        type="text"
        className="form-control mb-2"
        value={searchTerm}
        onChange={handleSearch}
        placeholder={`Search for a ${type}...`}
      />
      {filteredComponents.length > 0 && (
        <ul className="list-group">
          {filteredComponents.map((component) => (
            <li
              key={component.id}
              onClick={() => handleSelect(component)}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
            >
              {component.name} ({component.type})
            </li>
          ))}
        </ul>
      )}

      {filteredComponents.length === 0 && searchTerm && (
        <button
          onClick={() => setShowAddComponentModal(true)}
          className="btn btn-outline-primary btn-sm ms-2"
          style={{ marginLeft: "10px" }}
        >
          <i className="bi bi-database-fill-add"></i>
        </button>
      )}

      {showAddComponentModal && (
        <AddUserComponentModel
          type={type}
          setShowAddComponentModal={setShowAddComponentModal}
          onClose={() => {
            setSearchTerm("");
          }}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default AutocompleteInput;
