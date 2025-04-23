import React, { useState, useEffect } from "react";
import {
  getCPUComponents,
  getGPUComponents,
  getMotherboardComponents,
  getUserComponentsByType,
} from "../handlers/apiHandler";
import AddUserComponentModel from "./AddUserComponentModel";
import "./AutocompleteInput.css";

const AutocompleteInput = ({ type, onSelect }) => {
  const [components, setComponents] = useState([]);
  const [userComponents, setUserComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);
  const [updates, setUpdates] = useState([]);

  // Filters
  const [brandFilter, setBrandFilter] = useState("");
  const [showUserComponentsOnly, setShowUserComponentsOnly] = useState(false);

  // Fetch general components based on type (CPU, GPU, etc.)
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

  // Fetch user components based on the selected type
  const fetchUserComponents = async () => {
    try {
      const data = await getUserComponentsByType(type);
      console.log("User data: ", data);
      setUserComponents(data);
    } catch (err) {
      console.error("Error fetching user components:", err);
    }
  };

  useEffect(() => {
    fetchComponents();
    fetchUserComponents(); // Fetch user components every time the type changes
  }, [type, updates]);

  const handleUpdate = () => setUpdates((prev) => [...prev, "Input updated"]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    const pool = showUserComponentsOnly ? userComponents : components;

    const matches = pool.filter((component) => {
      const matchesSearch = component.name
        ?.toLowerCase()
        .includes(query.toLowerCase());
      const matchesBrand =
        !brandFilter ||
        component.brand?.toLowerCase() === brandFilter.toLowerCase();
      return matchesSearch && matchesBrand;
    });

    setFilteredComponents(query ? matches : []);
  };

  const handleSelect = (component) => {
    setSearchTerm(component.name);
    setSelectedComponent(component);
    setFilteredComponents([]);
    setShowAddComponentModal(false);
    onSelect(component); // Pass selected component back to parent
  };

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-2">
        <input
          type="text"
          className="form-control"
          value={searchTerm}
          onChange={handleSearch}
          placeholder={`Search for a ${type}...`}
        />
        {filteredComponents.length === 0 && searchTerm && (
          <button
            onClick={() => setShowAddComponentModal(true)}
            className="btn btn-outline-primary btn-sm"
            title="Add new component"
          >
            <i className="bi bi-database-fill-add"></i>
          </button>
        )}
      </div>

      {/* Animated Filter Options */}
      <div className={`fade-slide-in ${searchTerm ? "show" : ""}`}>
        {searchTerm.length > 0 && (
          <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
            <div>
              <label className="form-label mb-1">Filter by brand</label>
              <select
                className="form-select form-select-sm"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                <option value="AMD">AMD</option>
                <option value="Intel">Intel</option>
                <option value="ARM">ARM</option>
                <option value="ASUS">ASUS</option>
                <option value="MSI">MSI</option>
                <option value="GIGABYTE">GIGABYTE</option>
                <option value="ASrock">ASrock</option>
                <option value="NVIDIA">NVIDIA</option>
              </select>
            </div>

            <div className="form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                checked={showUserComponentsOnly}
                onChange={(e) => setShowUserComponentsOnly(e.target.checked)}
                id="userCompCheck"
              />
              <label className="form-check-label" htmlFor="userCompCheck">
                User Components Only
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Search results */}
      {filteredComponents.length > 0 && (
        <ul className="list-group shadow-sm">
          {filteredComponents.map((component) => (
            <li
              key={component.id}
              onClick={() => handleSelect(component)}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
            >
              {component.name}{" "}
              <small className="text-muted">({component.type})</small>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {showAddComponentModal && (
        <AddUserComponentModel
          type={type}
          setShowAddComponentModal={setShowAddComponentModal}
          onClose={() => setSearchTerm("")}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default AutocompleteInput;
