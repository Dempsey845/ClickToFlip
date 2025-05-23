import React, { useState, useEffect } from "react";
import AutocompleteInput from "../components/AutocompleteInput";
import { addBuildWithBuildPayLoad } from "../handlers/apiHandler";
import "./AddBuildForm.css";
import PriceBreakdown from "./PriceBreakdown";

function AddBuildForm({ onUpdate, onImageAdded, darkMode, currency }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    buildName: "",
    description: "",
    status: "planned",
    totalCost: "",
    salePrice: "",
    soldDate: "",
    profit: "",
  });

  const [selectedCPU, setSelectedCPU] = useState(null);
  const [selectedGPU, setSelectedGPU] = useState(null);
  const [selectedMotherboard, setSelectedMotherboard] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedGPUs, setSelectedGPUs] = useState([null]);
  const [buildId, setBuildId] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for the submit button

  const [prices, setPrices] = useState({
    CPU: 50,
    GPU: 100,
    RAM: 0,
    Motherboard: 50,
    PSU: 20,
    Case: 0,
    "CPU Cooler": 0,
    Others: 20,
  });

  const [breakTotalCost, setBreakTotalCost] = useState(0);

  useEffect(() => {
    const total = Object.values(prices).reduce(
      (sum, val) => sum + Number(val),
      0
    );
    setBreakTotalCost(total);
  }, [prices]);

  const handleGPUChange = (index, value) => {
    const updated = [...selectedGPUs];
    updated[index] = value;
    setSelectedGPUs(updated);
  };

  const addGPUInput = () => {
    setSelectedGPUs([...selectedGPUs, null]);
  };

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

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!selectedCPU) errors.cpu = "CPU is required";
    if (!selectedMotherboard) errors.motherboard = "Motherboard is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setLoading(true); // Set loading to true when submission starts

    try {
      const cpuId = selectedCPU?.id;
      const motherboardId = selectedMotherboard?.id;
      const gpuIds = selectedGPUs.map((gpu) => gpu?.id).filter((id) => id);

      const componentIds = [cpuId, motherboardId, ...gpuIds].filter(Boolean);

      if (componentIds.length === 0) {
        console.error("No valid component IDs found");
        return;
      }

      const buildPayload = {
        name: formData.buildName,
        description: formData.description,
        status: formData.status,
        total_cost: breakTotalCost || null,
        sale_price: formData.salePrice || null,
        sold_date: formData.soldDate || null,
        profit: formData.profit || null,
        price_breakdown: prices || {
          CPU: 0,
          GPU: 0,
          RAM: 0,
          Motherboard: 0,
          PSU: 0,
          Case: 0,
          "CPU Cooler": 0,
          Others: 0,
        },
        componentIds,
      };

      const data = await addBuildWithBuildPayLoad(buildPayload);
      setBuildId(data.buildId);
      onUpdate();
      setShowModal(false);

      // Reset form
      setFormData({
        buildName: "",
        description: "",
        status: "planned",
        totalCost: "",
        salePrice: "",
        soldDate: "",
        profit: "",
      });
      setPrices({
        CPU: 50,
        GPU: 100,
        RAM: 0,
        Motherboard: 50,
        PSU: 20,
        Case: 0,
        "CPU Cooler": 0,
        Others: 20,
      });
      setSelectedCPU(null);
      setSelectedGPU(null);
      setSelectedMotherboard(null);
      setSelectedGPUs([null]);
    } catch (error) {
      console.error("Error creating build:", error);
    } finally {
      setLoading(false); // Set loading to false once submission is complete
    }
  };

  const showBuildForm = () => {
    return (
      <form onSubmit={handleOnSubmit}>
        {/* Basic Info */}
        <div className="mb-3">
          <label htmlFor="buildName" className="form-label">
            Build Name
          </label>
          <input
            className={`form-control ${
              darkMode ? "bg-dark text-light border-secondary" : ""
            }`}
            id="buildName"
            name="buildName"
            type="text"
            value={formData.buildName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            className={`form-control ${
              darkMode ? "bg-dark text-light border-secondary" : ""
            }`}
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <PriceBreakdown
            darkMode={darkMode}
            prices={prices}
            onChange={(updated) => setPrices(updated)}
            currency={currency}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            className={`form-select ${
              darkMode ? "bg-dark text-light border-secondary" : ""
            }`}
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="planned">Planned</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* Components */}
        <div className="mb-3">
          <label className="form-label">
            CPU <span className="text-danger">*</span>
          </label>
          <AutocompleteInput
            type="CPU"
            onSelect={setSelectedCPU}
            darkMode={darkMode}
          />
          {formErrors.cpu && (
            <div className="form-text text-danger">{formErrors.cpu}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">GPU(s)</label>
          {selectedGPUs.map((gpu, index) => (
            <div key={index} className="mb-2">
              <AutocompleteInput
                type="GPU"
                onSelect={(val) => handleGPUChange(index, val)}
                darkMode={darkMode}
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={addGPUInput}
          >
            + Add GPU
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Motherboard <span className="text-danger">*</span>
          </label>
          <AutocompleteInput
            type="Motherboard"
            onSelect={setSelectedMotherboard}
            darkMode={darkMode}
          />
          {formErrors.motherboard && (
            <div className="form-text text-danger">
              {formErrors.motherboard}
            </div>
          )}
        </div>

        {/* Financials */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="totalCost" className="form-label">
              Total Cost ({currency})
            </label>
            <input
              className={`form-control ${
                darkMode ? "bg-dark text-light border-secondary" : ""
              }`}
              id="totalCost"
              name="totalCost"
              type="number"
              disabled={true}
              value={breakTotalCost}
              onChange={handleInputChange}
            />
          </div>

          {formData.status === "sold" && (
            <>
              <div className="col-md-4 mb-3">
                <label htmlFor="salePrice" className="form-label">
                  Sale Price ({currency})
                </label>
                <input
                  className={`form-control ${
                    darkMode ? "bg-dark text-light border-secondary" : ""
                  }`}
                  id="salePrice"
                  name="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="profit" className="form-label">
                  Profit ({currency})
                </label>
                <input
                  className={`form-control ${
                    darkMode ? "bg-dark text-light border-secondary" : ""
                  }`}
                  id="profit"
                  name="profit"
                  type="number"
                  step="0.01"
                  value={formData.profit}
                  readOnly
                />
              </div>
            </>
          )}
        </div>

        {formData.salePrice && (
          <div className="mb-3">
            <label htmlFor="soldDate" className="form-label">
              Sold Date
            </label>
            <input
              className={`form-control ${
                darkMode ? "bg-dark text-light border-secondary" : ""
              }`}
              id="soldDate"
              name="soldDate"
              type="date"
              value={formData.soldDate}
              onChange={handleInputChange}
            />
          </div>
        )}
        <div className="d-grid mt-4">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <span>Loading...</span> // Show loading text
            ) : (
              "Add Build"
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <>
      <button className="btn btn-success" onClick={() => setShowModal(true)}>
        <i className="bi bi-pc-display"></i> + Add New Build
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div
            className={`modal-content shadow-lg rounded p-4 ${
              darkMode ? "bg-dark text-light" : "bg-white"
            }`}
          >
            <div className="d-flex justify-content-between mb-3">
              <h4>Add New PC Build</h4>
              <button
                className="btn-close"
                onClick={() => {
                  setShowModal(false);
                }}
              />
            </div>

            {showBuildForm()}
          </div>
        </div>
      )}
    </>
  );
}

export default AddBuildForm;
