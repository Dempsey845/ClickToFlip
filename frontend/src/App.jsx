import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isAuthenticated, logout, getUserData } from "./handlers/apiHandler";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import Header from "./components/Header";
import UserComponentsPage from "./pages/UserComponentsPage";
import SettingsPage from "./pages/SettingsPage";
import ViewBuild from "./components/ViewBuild";
import ContactPage from "./pages/ContactPage";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setAuthenticated(auth);
      } catch (err) {
        console.error("Failed to check authentication:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  const attemptLogout = async () => {
    await logout();
    setAuthenticated(false);
  };

  const handleSignIn = () => {
    setAuthenticated(true);
  };

  const handleSignUp = () => {};

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={
        darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"
      }
    >
      <Router>
        <Header
          isAuthenticated={authenticated}
          onLogout={attemptLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} />} />
          <Route
            path="/contact"
            element={<ContactPage darkMode={darkMode} />}
          />
          <Route
            path="/builds/:buildId"
            element={<ViewBuild darkMode={darkMode} />}
          />
          <Route
            path="/dashboard"
            element={
              authenticated ? (
                <DashboardPage onLogout={attemptLogout} darkMode={darkMode} />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          <Route
            path="/my-components"
            element={
              authenticated ? (
                <UserComponentsPage darkMode={darkMode} />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          <Route
            path="/signin"
            element={<SignInPage onSignIn={handleSignIn} />}
          />
          <Route
            path="/signup"
            element={<SignUpPage onSignUp={handleSignUp} />}
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />
        </Routes>
        <ToastContainer />
      </Router>
    </div>
  );
}

export default App;
