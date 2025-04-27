import React, { useState, useEffect } from "react";
import { updateBuild, getBuildById } from "../handlers/apiHandler";
import "./AddBuildForm";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function EditBuildForm({ buildId, onClose, onSuccess, darkMode = false }) {
  const [formData, setFormData] = useState({
    buildName: "",
    description: "",
    status: "planned",
    totalCost: "",
    salePrice: "",
    soldDate: "",
    profit: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const processBuildData = (data) => {
    return {
      ...data,
    };
  };

  useEffect(() => {
    const fetchBuild = async () => {
      try {
        const data = await getBuildById(buildId);
        if (!data) return;

        const processedData = processBuildData(data);

        setFormData({
          buildName: processedData.name || "",
          description: processedData.description || "",
          status: processedData.status || "planned",
          totalCost: processedData.total_cost || "",
          salePrice: processedData.sale_price || "",
          soldDate: processedData.sold_date
            ? formatDate(processedData.sold_date)
            : "", // Format the sold date
          profit: processedData.profit || "",
        });

        setIsLoading(false); // Set loading to false when data is fetched
      } catch (err) {
        console.error("Error loading build:", err);
        setIsLoading(false);
      }
    };

    fetchBuild();
  }, [buildId]);

  useEffect(() => {
    const cost = parseFloat(formData.totalCost);
    const sale = parseFloat(formData.salePrice);
    if (!isNaN(cost) && !isNaN(sale)) {
      setFormData((prev) => ({
        ...prev,
        profit: (sale - cost).toFixed(2),
      }));
    }
  }, [formData.totalCost, formData.salePrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: formData.buildName,
      description: formData.description,
      status: formData.status,
      total_cost: formData.totalCost || null,
      sale_price: formData.salePrice || null,
      sold_date: formData.soldDate || null,
      profit: formData.profit || null,
    };

    try {
      await updateBuild(buildId, payload);
      if (onSuccess) onSuccess(payload);
      if (onClose) onClose();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="modal-overlay"
      style={{
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)", // Overlay color
      }}
    >
      <div
        className="modal-content shadow-lg rounded p-4"
        style={{
          backgroundColor: darkMode ? "#333" : "#fff", // Modal background color
          color: darkMode ? "#fff" : "#000", // Text color
        }}
      >
        <div className="d-flex justify-content-between mb-3">
          <h4>Edit PC Build</h4>
          <button className="btn-close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: darkMode ? "#fff" : "#000" }} // Label color
            >
              Build Name
            </label>
            <input
              className="form-control"
              name="buildName"
              value={formData.buildName}
              onChange={handleInputChange}
              required
              style={{
                backgroundColor: darkMode ? "#444" : "#fff", // Input background color
                color: darkMode ? "#fff" : "#000", // Input text color
              }}
            />
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: darkMode ? "#fff" : "#000" }} // Label color
            >
              Description
            </label>
            <textarea
              className="form-control"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              style={{
                backgroundColor: darkMode ? "#444" : "#fff", // Textarea background
                color: darkMode ? "#fff" : "#000", // Textarea text color
              }}
            />
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: darkMode ? "#fff" : "#000" }} // Label color
            >
              Status
            </label>
            <select
              className="form-select"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              style={{
                backgroundColor: darkMode ? "#444" : "#fff", // Select background color
                color: darkMode ? "#fff" : "#000", // Select text color
              }}
            >
              <option value="planned">Planned</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label
                className="form-label"
                style={{ color: darkMode ? "#fff" : "#000" }} // Label color
              >
                Total Cost (£)
              </label>
              <input
                className="form-control"
                name="totalCost"
                type="number"
                step="0.01"
                value={formData.totalCost || 0}
                onChange={handleInputChange}
                style={{
                  backgroundColor: darkMode ? "#444" : "#fff", // Input background
                  color: darkMode ? "#fff" : "#000", // Input text color
                }}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label
                className="form-label"
                style={{ color: darkMode ? "#fff" : "#000" }} // Label color
              >
                Sale Price (£)
              </label>
              <input
                className="form-control"
                name="salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice || 0}
                onChange={handleInputChange}
                style={{
                  backgroundColor: darkMode ? "#444" : "#fff", // Input background
                  color: darkMode ? "#fff" : "#000", // Input text color
                }}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label
                className="form-label"
                style={{ color: darkMode ? "#fff" : "#000" }} // Label color
              >
                Profit (£)
              </label>
              <input
                className="form-control"
                name="profit"
                type="number"
                readOnly
                value={formData.profit || 0}
                style={{
                  backgroundColor: darkMode ? "#444" : "#fff", // Input background
                  color: darkMode ? "#fff" : "#000", // Input text color
                }}
              />
            </div>
          </div>

          {formData.salePrice && (
            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: darkMode ? "#fff" : "#000" }} // Label color
              >
                Sold Date
              </label>
              <input
                className="form-control"
                name="soldDate"
                type="date"
                value={formData.soldDate || ""}
                onChange={handleInputChange}
                style={{
                  backgroundColor: darkMode ? "#444" : "#fff", // Input background
                  color: darkMode ? "#fff" : "#000", // Input text color
                }}
              />
            </div>
          )}

          <div className="d-grid mt-4">
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              style={{
                backgroundColor: darkMode ? "#0056b3" : "#007bff", // Button background
                color: darkMode ? "#fff" : "#fff", // Button text color
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBuildForm;
