const PriceBreakdown = ({
  darkMode = false,
  prices = {},
  onChange,
  currency,
}) => {
  const components = [
    "CPU",
    "GPU",
    "RAM",
    "Motherboard",
    "PSU",
    "Case",
    "CPU Cooler",
    "Others",
  ];

  const handleInputChange = (key, value) => {
    if (onChange) {
      onChange({ ...prices, [key]: value });
    }
  };

  return (
    <div
      className={`p-4 rounded ${
        darkMode ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <h5 className="mb-3">Price Breakdown</h5>
      <div className="row g-2">
        {components.map((label) => (
          <div className="col-12 d-flex align-items-center" key={label}>
            <label className="me-auto">{label}</label>
            <div className="input-group" style={{ maxWidth: "150px" }}>
              <span className="input-group-text">{currency}</span>
              <input
                type="number"
                className="form-control"
                value={prices[label] ?? 0}
                onChange={(e) =>
                  handleInputChange(label, Number(e.target.value))
                }
                min={0}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceBreakdown;
