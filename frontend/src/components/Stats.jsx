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

function Stats({ builds }) {
  if (!builds) return null;

  if (builds.length < 2) {
    return (
      <div className="alert alert-info text-center mt-3" role="alert">
        <h5 className="mb-0">Add more builds to view stats...</h5>
      </div>
    );
  }

  const [showStats, setShowStats] = useState(true); // State to toggle visibility

  // Separate sold and planned builds
  const soldBuilds = builds.filter((build) => build.status === "sold");
  const unSoldBuilds = builds.filter(
    (build) => build.status !== "sold" && build.status !== "planned"
  );

  // Calculate profit for pie chart
  const soldProfit = soldBuilds.reduce(
    (total, build) => total + parseFloat(build.profit),
    0
  );
  const unSoldCost = unSoldBuilds.reduce(
    (total, build) => total + parseFloat(build.total_cost),
    0
  );

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
      className="stats-container card mb-4 shadow-sm"
      style={{ margin: "0.25rem" }}
    >
      <div
        className="stats-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          margin: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>Build Stats</h3>
        <button
          className="btn btn-outline-primary"
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
        <>
          {/* Pie Chart for Profit and Loss */}
          <div
            className="chart-container"
            style={{ maxWidth: "400px", margin: "auto" }}
          >
            <h4>Overall Profit vs Loss</h4>
            <Pie data={pieData} options={options} />
          </div>

          {/* Bar Chart for Build Status Breakdown */}
          <div
            className="chart-container"
            style={{ maxWidth: "400px", margin: "auto" }}
          >
            <h4>Build Status (Sold vs In Progress)</h4>
            <Bar data={barData} options={options} />
          </div>

          {/* Display stats */}
          <div className="stats-details">
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
              <strong>Total Cost for In Progress Builds:</strong> $
              {unSoldCost.toFixed(2)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Stats;
