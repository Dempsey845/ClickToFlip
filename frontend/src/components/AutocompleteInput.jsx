import React, { useState, useEffect } from "react";
import { getComponents } from "../handlers/apiHandler";

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

const AutocompleteInput = () => {
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState("");

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const data = await getComponents();
        const parsed = data
          .map((entry) => parseComponentRow(entry.row))
          .filter((item) => item && item.name); // filter out nulls
        setComponents(parsed);
      } catch (err) {
        console.error("Error fetching components:", err);
      }
    };

    fetchComponents();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query) {
      const matches = components.filter(
        (component) =>
          component?.name &&
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
        placeholder="Search for a PC component..."
      />
      {filteredComponents.length > 0 && (
        <ul>
          {filteredComponents.map((component, index) => (
            <li
              key={index}
              onClick={() => handleSelect(component)}
              style={{
                cursor: "pointer",
                padding: "5px",
                border: "1px solid #ccc",
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
