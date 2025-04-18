import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Register user with form data
async function registerUserWithFormData(formData) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/register`, formData, {
      withCredentials: true,
    });
    console.log("Register response: ", response);
  } catch (err) {
    console.error("Error posting register: ", err);
  }
}

// Attempt to log in with form data
async function attemptLoginWithFormData(formData) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/login`, formData, {
      withCredentials: true,
    });
    console.log("Login response: ", response);
  } catch (err) {
    console.error("Error posting login: ", err);
  }
}

// Check if the user is authenticated
async function isAuthenticated() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/check-auth`, {
      withCredentials: true,
    });
    console.log("check-auth response: ", response);
    return response.data.isAuthenticated;
  } catch (err) {
    console.error("Error checking auth: ", err);
    return false;
  }
}

// Log the user out
async function logout() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/logout`, {
      withCredentials: true,
    });
    console.log("logout response: ", response);
  } catch (err) {
    console.error("Error logging out: ", err);
  }
}

export {
  registerUserWithFormData,
  attemptLoginWithFormData,
  isAuthenticated,
  logout,
};
