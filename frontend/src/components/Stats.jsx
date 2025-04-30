import React, { useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement,
  LinearScale,
} from "chart.js";

// Register necessary chart elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement,
  LinearScale
);

function Stats({ builds, darkMode }) {
  if (!builds) return null;

  if (builds.length < 2) {
    return (
      <div
        className={`alert alert-info text-center mt-3 ${
          darkMode ? "dark-alert" : ""
        }`}
        role="alert"
      >
        <h5 className={`mb-0 ${darkMode ? "text-light" : ""}`}>
          Add more builds to view stats...
        </h5>
      </div>
    );
  }

  const [showStats, setShowStats] = useState(true); // State to toggle visibility

  const sumField = (items, field) =>
    items.reduce((total, item) => total + parseFloat(item[field] || 0), 0);

  // Separate sold and planned builds
  const soldBuilds = builds.filter((build) => build.status === "sold");
  const unSoldBuilds = builds.filter(
    (build) => build.status !== "sold" && build.status !== "planned"
  );

  const soldProfit = sumField(soldBuilds, "profit");
  const totalRevenue = sumField(soldBuilds, "sale_price");
  const totalCost = sumField(builds, "total_cost");
  const unSoldCost = sumField(unSoldBuilds, "total_cost");

  // Average profit margin across sold builds (rounded to whole %)
  const averageMargin =
    totalRevenue > 0 ? Math.round((soldProfit / totalRevenue) * 100) : 0;

  // Data for Pie Chart: Profit vs Loss
  const pieData = {
    labels: ["Profit", "Loss"],
    datasets: [
      {
        label: "Profit/Loss",
        data: [soldProfit, unSoldCost],
        backgroundColor: ["#4CAF50", "#F44336"], // Green for profit, Red for loss
        borderColor: ["#388E3C", "#D32F2F"],
        borderWidth: 1,
      },
    ],
  };

  // Data for Bar Chart: Build Status Breakdown
  const barData = {
    labels: ["Sold", "In Progress"],
    datasets: [
      {
        label: "Builds",
        data: [soldBuilds.length, unSoldBuilds.length],
        backgroundColor: ["#4CAF50", "#FF9800"],
        borderColor: ["#388E3C", "#FF5722"],
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.raw ? `${tooltipItem.raw.toFixed(2)}` : "N/A";
          },
        },
      },
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div
      className={`stats-container card mb-4 shadow-sm ${
        darkMode ? "dark-container" : ""
      }`}
      style={{ margin: "0.25rem" }}
    >
      <div
        className={`stats-header ${darkMode ? "dark-header" : ""}`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          margin: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }} className={darkMode ? "text-light" : ""}>
          Build Stats
        </h3>
        <button
          className={`btn btn-outline-primary ${darkMode ? "dark-btn" : ""}`}
          onClick={() => setShowStats((prev) => !prev)}
        >
          {showStats ? (
            <i className="bi bi-eye-fill"></i>
          ) : (
            <i className="bi bi-eye-slash-fill"></i>
          )}
        </button>
      </div>

      {/* Conditionally render stats */}
      {showStats && (
        <div className="d-flex flex-wrap justify-content-around gap-3">
          {/* Pie Chart for Profit and Loss */}
          <div
            className={`chart-container ${
              darkMode ? "dark-chart-container" : ""
            }`}
            style={{ maxWidth: "400px", margin: "auto" }}
          >
            <h4 className={darkMode ? "text-light" : ""}>
              Profit vs Inventory Cost
            </h4>
            <Pie data={pieData} options={options} />
          </div>

          {/* Bar Chart for Build Status Breakdown */}
          <div
            className={`chart-container ${
              darkMode ? "dark-chart-container" : ""
            }`}
            style={{ maxWidth: "400px", margin: "auto" }}
          >
            <h4 className={darkMode ? "text-light" : ""}>
              Build Status (Sold vs In Progress)
            </h4>
            <Bar data={barData} options={options} />
          </div>

          {/* Display stats */}
          <div className={`stats-details ${darkMode ? "text-light" : ""}`}>
            <p>
              <strong>Total Sold Builds:</strong> {soldBuilds.length}
            </p>
            <p>
              <strong>Total In Progress Builds:</strong> {unSoldBuilds.length}
            </p>
            <p>
              <strong>Total Profit:</strong> ${soldProfit.toFixed(2)}
            </p>
            <p>
              <strong>Total Revenue:</strong> ${totalRevenue.toFixed(2)}
            </p>
            <p>
              <strong>Total Cost:</strong> ${totalCost.toFixed(2)}
            </p>
            <p>
              <strong>Average Profit Margin:</strong> {averageMargin}%
            </p>
            <p>
              <strong>Average Revenue per Build:</strong> $
              {(totalRevenue / soldBuilds.length || 0).toFixed(2)}
            </p>
            <p>
              <strong>Average Profit per Build:</strong> $
              {(soldProfit / soldBuilds.length || 0).toFixed(2)}
            </p>
            <p>
              <strong>Inventory Value:</strong> ${unSoldCost.toFixed(2)}
            </p>

            <p>
              <strong>Total Cost for In Progress Builds:</strong> $
              {unSoldCost.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stats;
