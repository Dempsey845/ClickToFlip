import React, { useState } from "react";

function CustomForm({ title, fields, onSubmit, disabled = false }) {
  const [formData, setFormData] = useState(() =>
    fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {})
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h3 className="mb-3">{title}</h3>
        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, type = "text" }) => (
            <div className="mb-3" key={name}>
              <label htmlFor={name} className="form-label">
                {label}
              </label>
              <input
                className="form-control"
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleInputChange}
                required
              />
            </div>
          ))}
          <button disabled={disabled} type="submit" className="btn btn-primary">
            {disabled ? "Loading..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomForm;
