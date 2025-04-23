// App.js or main component
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isAuthenticated, logout } from "./handlers/apiHandler";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import Header from "./components/Header";
import UserComponentsPage from "./pages/UserComponentsPage";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const attemptLogout = async () => {
    await logout();
    setAuthenticated(false);
  };

  const handleSignIn = () => {
    setAuthenticated(true);
  };

  const handleSignUp = () => {};

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Header isAuthenticated={authenticated} onLogout={attemptLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            authenticated ? (
              <DashboardPage onLogout={attemptLogout} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/my-components"
          element={
            authenticated ? (
              <UserComponentsPage />
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
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
