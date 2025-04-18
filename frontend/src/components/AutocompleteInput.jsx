import React, { useState, useEffect } from "react";
import {
  getCPUComponents,
  getGPUComponents,
  getMotherboardComponents,
} from "../handlers/apiHandler";

const AutocompleteInput = ({ type, onSelect }) => {
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  useEffect(() => {
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

        setComponents(data); // No need to parse, already structured
      } catch (err) {
        console.error("Error fetching components:", err);
      }
    };

    fetchComponents();
  }, [type]);

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
    onSelect(component); // Returns full { id, name, type } object
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder={`Search for a ${type}...`}
      />
      {filteredComponents.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredComponents.map((component) => (
            <li
              key={component.id}
              onClick={() => handleSelect(component)}
              style={{
                cursor: "pointer",
                padding: "5px",
                borderBottom: "1px solid #ccc",
              }}
            >
              {component.name} ({component.type})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
