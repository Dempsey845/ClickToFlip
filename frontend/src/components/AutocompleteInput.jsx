import React, { useState, useEffect } from "react";
import {
  getCPUComponents,
  getGPUComponents,
  getMotherboardComponents,
} from "../handlers/apiHandler";

// Parses PostgreSQL row string like '("AMD Ryzen 5 3600",CPU)' into { name, type }
const parseComponentRow = (rowString) => {
  const match = rowString.match(/^\((.*?),(.*?)\)$/);
  if (!match) return null;

  let name = match[1];
  let type = match[2];

  // Remove surrounding quotes if present
  name = name.replace(/^"|"$/g, "");
  type = type.replace(/^"|"$/g, "");

  return { name, type };
};

const AutocompleteInput = ({ type }) => {
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  useEffect(() => {
    const fetchComponents = async () => {
      let data = [];
      try {
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

        const parsed = data
          .map((entry) => parseComponentRow(entry.row))
          .filter((item) => item && item.name && item.type === type);

        setComponents(parsed);
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
          {filteredComponents.map((component, index) => (
            <li
              key={index}
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
