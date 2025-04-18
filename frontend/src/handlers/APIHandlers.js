import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function registerUserWithFormData(formData) {
  /* 
        formData: {email: "", password: ""}
    */
  axios
    .post(BACKEND_URL + "/api/register", formData)
    .then((response) => {
      console.log("Register response: ", response);
    })
    .catch((err) => {
      console.error("Error posting register: ", err);
    });
}

export { registerUserWithFormData };
