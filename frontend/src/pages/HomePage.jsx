import React from "react";
import "animate.css";

function HomePage({ darkMode }) {
  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div
        className={`text-center py-5 ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <h1 className="display-4 fw-bold animate__animated animate__fadeInUp">
          Click To Flip
        </h1>
        <p className="lead animate__animated animate__fadeInUp animate__delay-1s">
          Track. Flip. Profit. Simplify your PC flipping game.
        </p>
        <a
          href="/dashboard"
          className="btn btn-primary btn-lg mt-3 animate__animated animate__fadeInUp animate__delay-2s"
        >
          Start Flipping Now
        </a>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <h2 className="text-center mb-4">
          Why <span className="text-primary">Click To Flip</span>?
        </h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <i className="bi bi-graph-up-arrow display-5 text-success"></i>
            <h4 className="mt-3">Profit Tracking</h4>
            <p>Easily monitor profit margins and financial growth.</p>
          </div>
          <div className="col-md-4 mb-4">
            <i className="bi bi-tools display-5 text-warning"></i>
            <h4 className="mt-3">Component Management</h4>
            <p>Organise builds and specs effortlessly in one place.</p>
          </div>
          <div className="col-md-4 mb-4">
            <i className="bi bi-bar-chart-steps display-5 text-info"></i>
            <h4 className="mt-3">Visual Stats</h4>
            <p>Analyse performance with dynamic charts and breakdowns.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`text-center py-3 mt-5 ${
          darkMode ? "bg-dark text-light" : "bg-light text-dark"
        }`}
      >
        <small>&copy; {new Date().getFullYear()} Click To Flip</small>
      </footer>
    </div>
  );
}

export default HomePage;
