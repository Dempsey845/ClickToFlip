import React, { useState } from "react";
import { registerUserWithFormData } from "../handlers/apiHandler";

function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((prevFormData) => {
      return { ...prevFormData, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerUserWithFormData(formData);
  };

  return (
    <div>
      <h3>Sign Up</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            onChange={handleInputChange}
            type="text"
            id="email"
            name="email"
            value={formData.email}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            onChange={handleInputChange}
            type="text"
            id="password"
            name="password"
            value={formData.password}
            required
          />
        </div>
        <div>
          <input type="submit" />
        </div>
      </form>
    </div>
  );
}

export default SignUpForm;
