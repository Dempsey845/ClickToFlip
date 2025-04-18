import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
import { toast } from "react-toastify";

const handleError = (err) => {
  if (err.response) {
    if (err.response.status === 401) {
      return "Incorrect email or password. Please try again.";
    } else if (err.response.status === 400) {
      return "Bad request. Please check your inputs.";
    } else {
      return "An error occurred. Please try again.";
    }
  } else if (err.request) {
    // The request was made but no response was received
    return "No response from the server. Please try again later.";
  } else {
    // Something else went wrong in setting up the request
    return "Error in setting up request. Please try again.";
  }
};

// Register user with form data
async function registerUserWithFormData(formData) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/register`, formData, {
      withCredentials: true,
    });
    console.log("Register response: ", response);
    toast.success("Registration successful!");
  } catch (err) {
    console.error("Error posting register: ", err);

    if (err.response && err.response.status === 400) {
      // Show a toast if the user already exists
      toast.error("User already exists. Please use a different email.");
    } else {
      // Show a general error toast for other errors
      toast.error("Registration failed. Please try again.");
    }
  }
}

// Attempt to log in with form data

async function attemptLoginWithFormData(formData) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/login`, formData, {
      withCredentials: true,
    });
    console.log("Login response: ", response);

    // Manually check for login success
    if (
      response.status === 200 &&
      response.data.message === "Login successful"
    ) {
      toast.success("Login successful!");
      return true; // Return true for successful login
    } else {
      // If login fails, throw an error
      toast.error("Login failed. Please check your credentials.");
      throw new Error("Login failed");
    }
  } catch (err) {
    const errorMessage = handleError(err);
    toast.error(errorMessage);
    throw new Error(errorMessage);
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
    toast.error("Error authenticating: ", err);
    return false;
  }
}

// Log the user out
async function logout() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/logout`, {
      withCredentials: true,
    });
    toast.success("Logout successful.");
  } catch (err) {
    toast.error("Error logging out.");
  }
}

export {
  registerUserWithFormData,
  attemptLoginWithFormData,
  isAuthenticated,
  logout,
};
