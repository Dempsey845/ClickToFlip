import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Header({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => navigate("/signin");
  const handleSignup = () => navigate("/signup");
  const handleLogout = () => {
    onLogout();
    navigate("/signin");
  };

  // A helper function to determine if the current link is active
  const isActive = (path) =>
    location.pathname === path ? "link-secondary" : "";

  return (
    <div className="container header">
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
        <div className="col-md-3 mb-2 mb-md-0">
          <a
            href="/"
            className="d-inline-flex link-body-emphasis text-decoration-none"
          >
            <svg
              className="bi"
              width="40"
              height="32"
              role="img"
              aria-label="Bootstrap"
            >
              <use xlinkHref="#bootstrap"></use>
            </svg>
          </a>
        </div>

        <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
          <li>
            <a href="/" className={`nav-link px-2 ${isActive("/")}`}>
              Home
            </a>
          </li>
          <li>
            <a
              href="/dashboard"
              className={`nav-link px-2 ${isActive("/dashboard")}`}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/contact"
              className={`nav-link px-2 ${isActive("/contact")}`}
            >
              Contact
            </a>
          </li>
          <li>
            <a href="/about" className={`nav-link px-2 ${isActive("/about")}`}>
              About
            </a>
          </li>
        </ul>

        <div className="col-md-3 text-end">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-outline-danger">
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                type="button"
                className="btn btn-outline-primary me-2"
              >
                Login
              </button>
              <button
                onClick={handleSignup}
                type="button"
                className="btn btn-primary"
              >
                Sign-up
              </button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;
