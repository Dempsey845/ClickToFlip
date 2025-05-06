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

async function contact(formData) {
  try {
    await axios.post(`${BACKEND_URL}/api/contact`, formData, {
      withCredentials: true,
    });
    toast.success("Contact successful!");
  } catch (err) {
    console.error(`${err.response?.data?.error || err.message}`);
    toast.error(`${err.response?.data?.error || err.message}`);
  }
}

// Register user with form data
async function registerUserWithFormData(formData) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/register`, formData, {
      withCredentials: true,
    });
    //console.log("Register response: ", response);
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
    //console.log("Login response: ", response);

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
    //console.log("check-auth response: ", response);
    return response.data.isAuthenticated;
  } catch (err) {
    toast.error("Error authenticating: ", err);
    return false;
  }
}

async function changePassword(newPassword) {
  try {
    await axios.patch(
      `${BACKEND_URL}/api/changePassword`,
      { newPassword },
      { withCredentials: true }
    );
    toast.success("Successfully changed password.");
  } catch (err) {
    console.error("Error changing password:", err);

    const message =
      err.response?.data?.message || "Something went wrong. Please try again.";

    toast.error(message);
  }
}

async function getUserData() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/getUserData`, {
      withCredentials: true,
    });
    return response.data.user;
  } catch (err) {
    console.error("User not authenticated.");
    return null;
  }
}

// Log the user out
async function logout() {
  try {
    await axios.get(`${BACKEND_URL}/api/logout`, {
      withCredentials: true,
    });
    toast.success("Logout successful.");
  } catch (err) {
    toast.error("Error logging out.");
  }
}

// GPU
const getGPUComponents = async () => {
  const res = await axios.get(`${BACKEND_URL}/api/components/gpu`, {
    withCredentials: true,
  });
  return res.data;
};

// CPU
const getCPUComponents = async () => {
  const res = await axios.get(`${BACKEND_URL}/api/components/cpu`, {
    withCredentials: true,
  });
  return res.data;
};

// Motherboard
const getMotherboardComponents = async () => {
  const res = await axios.get(`${BACKEND_URL}/api/components/motherboard`, {
    withCredentials: true,
  });
  return res.data;
};

// Add build
const addBuildWithBuildPayLoad = async (buildPayload) => {
  //console.log("Build payload: ", buildPayload);
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/builds`,
      buildPayload,
      { withCredentials: true }
    );
    ////console.log("Build created:", response.data);
    toast.success("Build created successfully!");
    return response.data;
  } catch (err) {
    console.error("Error submitting build", err);
    toast.error("Failed to create build.");
  }
};

const duplicateBuild = async (build) => {
  //console.log(build);
  const {
    id,
    description,
    total_cost,
    status,
    sale_price,
    sold_date,
    profit,
    image_url,
  } = build;
  const name = build.name + " (Copy)";
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/builds/buildComponents/${id}`,
      { withCredentials: true }
    );
    const componentIds = response.data.componentIds;
    if (!componentIds) {
      toast.error("Error duplicating build. Please Try Again.");
      return null;
    } else {
      const newBuild = await axios.post(
        `${BACKEND_URL}/api/builds`,
        {
          componentIds: componentIds,
          description: description,
          name: name,
          profit: profit,
          sale_price: sale_price,
          sold_date: sold_date,
          status: status,
          total_cost: total_cost,
          imageUrl: image_url,
        },
        { withCredentials: true }
      );
      toast.success("Successfully Duplicated Build: ");
      return newBuild;
    }
  } catch (err) {
    toast.error("Error duplicating build. Please Try Again.");
    return null;
  }
};

// Add GPU
const addGPUToBuild = async (buildId, gpuId) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/builds/addGPU/${buildId}`,
      gpuId,
      {
        withCredentials: true,
      }
    );

    const componentId = response.data.componentId;

    toast.success("Added new GPU to build.");
    return componentId;
  } catch (err) {
    toast.error("Error adding GPU to build");
    return false;
  }
};

// Delete GPU
const deleteGPUFromBuild = async (buildId, gpuId) => {
  try {
    await axios.delete(`${BACKEND_URL}/api/builds/deleteGPU/${buildId}`, {
      withCredentials: true,
      data: { gpuId },
    });
    toast.success("Removed GPU from build.");
  } catch (err) {
    toast.error("Failed to remove GPU from build.");
  }
};

// GET builds
const getUserBuilds = async () => {
  try {
    const result = await axios.get(`${BACKEND_URL}/api/builds`, {
      withCredentials: true,
    });
    return result.data;
  } catch (err) {
    console.error("Error fetching user builds: ", err);
    toast.error("Failed to fetch user builds.");
    return null;
  }
};

// Upload Image
const uploadImageWithFormData = async (formData) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/upload/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    toast.success("Upload successful!");
    return response.data.imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.error("Upload failed!");
  }
};

const updateBuild = async (buildId, updateData) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/builds/${buildId}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    toast.success("Build updated successfully!");
    //console.log("Updated build:", response.data);
    return response.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.error || "An unexpected error occurred.";
    toast.error(`Failed to update build: ${errorMsg}`);
    console.error("Error while updating build:", err);
  }
};

const getBuildById = async (buildId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/builds/${buildId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    console.error("Error in getBuildById:", err);
    throw err;
  }
};

const deleteBuildById = async (build) => {
  const buildId = build.id;
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/builds/${buildId}`,
      { withCredentials: true }
    );
    toast.success(`Successfully deleted build: ${response.data.message}`);
  } catch (err) {
    toast.error(
      `Error deleting build: ${err.response?.data?.error || err.message}`
    );
  }
};

const doesImageExistInMultipleBuilds = async (filename) => {
  try {
    const res = await axios.get(
      `${BACKEND_URL}/api/builds/doesImageExistInMultipleBuilds/${filename}`,
      { withCredentials: true }
    );
    return res.data.existsInMultiple;
  } catch (err) {
    console.error("Error checking image existence:", err);
    return false;
  }
};

const deleteImageByFilename = async (filename) => {
  const exists = await doesImageExistInMultipleBuilds(filename);
  if (exists) return;
  try {
    await axios.delete(`${BACKEND_URL}/api/builds/image/${filename}`, {
      withCredentials: true,
    });
  } catch {
    toast.error(
      `Error deleting image: ${err.response?.data?.error || err.message}`
    );
  }
};

const deleteImageByURL = async (imageURL) => {
  // imageURL example = /uploads/1745238988354.jpg
  // convert to filename e.g: 1745238988354.jpg
  const filename = imageURL.slice(9);
  await deleteImageByFilename(filename);
};

const changeComponent = async (buildId, prevComponentId, newComponent) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/builds/changeComponent/${prevComponentId}/${buildId}`,
      newComponent.id,
      { withCredentials: true }
    );
    toast.success(`Updated to ${newComponent.name}!`);
    return response.data;
  } catch (err) {
    toast.error(
      `Error changing component: ${err.response?.data?.error || err.message}`
    );
  }
};

const removeBuildComponent = async (componentReferenceId) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/components/buildComponents/${componentReferenceId}`,
      { withCredentials: true }
    );
    toast.success("Successfully removed component from build.");
    return response;
  } catch {
    toast.error(
      `Error removing component from build: ${
        err.response?.data?.error || err.message
      }`
    );
  }
};

const addUserComponent = async (component) => {
  try {
    const result = await axios.post(
      `${BACKEND_URL}/api/components/addUserComponent`,
      component,
      { withCredentials: true }
    );
    toast.success(`Added Component: ${component.name}!`);
    return result.data.newComponent;
  } catch (err) {
    toast.error(
      `Error adding component: ${err.response?.data?.error || err.message}`
    );
  }
};

const updateUserComponent = async (id, component) => {
  try {
    const result = await axios.patch(
      `${BACKEND_URL}/api/components/updateUserComponent/${id}`,
      component,
      { withCredentials: true }
    );
    toast.success(`Updated Component: ${result.data.updatedComponent.name}`);
    return result.data.updatedComponent;
  } catch (err) {
    toast.error("Error updating user component.");
    console.error(`${err.response?.data?.error || err.message}`);
  }
};

const getUserComponents = async (type) => {
  try {
    const result = await axios.get(
      `${BACKEND_URL}/api/components/getUserComponents`,
      { withCredentials: true }
    );
    return result.data.rows;
  } catch (err) {
    console.error(`${err.response?.data?.error || err.message}`);
    return [];
  }
};

const getUserComponentsByType = async (type) => {
  try {
    const result = await axios.get(
      `${BACKEND_URL}/api/components/getUserComponents/${type}`,
      { withCredentials: true }
    );
    return result.data;
  } catch (err) {
    console.error(`${err.response?.data?.error || err.message}`);
    return [];
  }
};

const deleteUserComponent = async (componentId) => {
  try {
    const result = await axios.delete(
      `${BACKEND_URL}/api/components/userComponents/${componentId}`,
      { withCredentials: true }
    );
    toast.success("Successfully removed user component.");
    return result.data;
  } catch (err) {
    console.error(`${err.response?.data?.error || err.message}`);
    toast.error(`${err.response?.data?.error || err.message}`);
    return [];
  }
};

const changeUsername = async (username) => {
  try {
    await axios.patch(
      `${BACKEND_URL}/api/changeUsername`,
      { username },
      { withCredentials: true }
    );
    toast.success("Successfully changed password!");
  } catch (err) {
    console.error(`${err.response?.data?.error || err.message}`);
    toast.error(`${err.response?.data?.error || err.message}`);
  }
};

const deleteAccount = async () => {
  try {
    await axios.delete(`${BACKEND_URL}/api/deleteAccount`, {
      withCredentials: true,
    });
    toast.success("Successfully deleted account.");
    return true;
  } catch (err) {
    console.error(`${err.response?.data?.error || err.message}`);
    toast.error(`${err.response?.data?.error || err.message}`);
    return false;
  }
};

const getUsernameFromId = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/username/${userId}`, {
      withCredentials: true,
    });
    return response;
  } catch (err) {
    console.error(`${err.response?.data?.error || err.message}`);
    toast.error(`${err.response?.data?.error || err.message}`);
    return "";
  }
};

export {
  contact,
  registerUserWithFormData,
  attemptLoginWithFormData,
  isAuthenticated,
  getUserData,
  logout,
  getCPUComponents,
  getGPUComponents,
  getMotherboardComponents,
  addBuildWithBuildPayLoad,
  addGPUToBuild,
  deleteGPUFromBuild,
  getUserBuilds,
  uploadImageWithFormData,
  updateBuild,
  getBuildById,
  deleteBuildById,
  deleteImageByFilename,
  deleteImageByURL,
  changeComponent,
  removeBuildComponent,
  addUserComponent,
  updateUserComponent,
  getUserComponents,
  getUserComponentsByType,
  deleteUserComponent,
  changePassword,
  changeUsername,
  deleteAccount,
  getUsernameFromId,
  duplicateBuild,
};
