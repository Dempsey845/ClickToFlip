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
import "./Stats.css";

// Register necessary chart elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement,
  LinearScale
);

function Stats({ builds, darkMode, currency }) {
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

  const [showStats, setShowStats] = useState(true); // State to toggle visibility of charts
  const [showDisplayStats, setShowDisplayStats] = useState(true); // State to toggle visibility of display stats

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
    labels: ["Profit", "Inventory Cost"],
    datasets: [
      {
        label: "Profit/Inventory Cost",
        data: [soldProfit, unSoldCost],
        backgroundColor: ["#4CAF50", "#F44336"], // Green for profit, Red for loss
        borderColor: ["#388E3C", "#D32F2F"],
        borderWidth: 1,
      },
    ],
  };

  // Data for Bar Chart: Build Status Breakdown
  const barData = {
    labels: ["Sold", "Unsold"],
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
      style={{ margin: "0.25rem", maxWidth: "100%" }}
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
        <h3
          style={{ margin: 0 }}
          className={`${darkMode ? "text-light" : ""} text-center text-sm-left`}
        >
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
        <div className="d-flex flex-column flex-sm-row flex-wrap justify-content-between gap-3">
          {/* Pie Chart for Profit and Loss */}
          <div
            className={`chart-container ${
              darkMode ? "dark-chart-container" : ""
            }`}
            style={{
              flex: "1 1 100%",
              maxWidth: "400px",
              width: "100%",
              margin: "auto",
            }}
          >
            <h4
              className={`${
                darkMode ? "text-light" : ""
              } text-center text-sm-left`}
            >
              Profit vs Inventory Cost
            </h4>
            <Pie data={pieData} options={options} />
          </div>

          {/* Bar Chart for Build Status Breakdown */}
          <div
            className={`chart-container ${
              darkMode ? "dark-chart-container" : ""
            }`}
            style={{
              flex: "1 1 100%",
              maxWidth: "400px",
              width: "100%",
              margin: "auto",
            }}
          >
            <h4
              className={`${
                darkMode ? "text-light" : ""
              } text-center text-sm-left`}
            >
              Build Status (Sold vs Unsold)
            </h4>
            <Bar data={barData} options={options} />
          </div>

          {/* Toggle Button for Display Stats (Mobile View) */}
          <button
            className={`btn btn-outline-secondary d-block d-sm-none ${
              darkMode ? "dark-btn" : ""
            }`}
            onClick={() => setShowDisplayStats((prev) => !prev)}
          >
            {showDisplayStats ? "Hide Stats" : "Show Stats"}
          </button>

          {/* Display stats */}
          {showDisplayStats && (
            <div className="row g-3 stats-details" style={{ marginTop: "0px" }}>
              {[
                { label: "Total Sold Builds", value: soldBuilds.length },
                { label: "Total Unsold Builds", value: unSoldBuilds.length },
                {
                  label: "Total Profit",
                  value: `${currency}${soldProfit.toFixed(2)}`,
                },
                {
                  label: "Total Revenue",
                  value: `${currency}${totalRevenue.toFixed(2)}`,
                },
                {
                  label: "Total Cost",
                  value: `${currency}${totalCost.toFixed(2)}`,
                },
                { label: "Avg Profit Margin", value: `${averageMargin}%` },
                {
                  label: "Avg Revenue per Build",
                  value: `${currency}${(
                    totalRevenue / soldBuilds.length || 0
                  ).toFixed(2)}`,
                },
                {
                  label: "Avg Profit per Build",
                  value: `${currency}${(
                    soldProfit / soldBuilds.length || 0
                  ).toFixed(2)}`,
                },
                {
                  label: "Inventory Value",
                  value: `${currency}${unSoldCost.toFixed(2)}`,
                },
              ].map((stat, index) => (
                <div className="col-12 col-sm-6 col-lg-4" key={index}>
                  <div
                    className={`p-3 border rounded shadow-sm ${
                      darkMode ? "bg-dark text-light" : "bg-light"
                    }`}
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <strong>{stat.label}:</strong>
                    <div>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Stats;
