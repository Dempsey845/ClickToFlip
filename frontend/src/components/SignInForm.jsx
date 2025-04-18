import React, { useState } from "react";
import { attemptLoginWithFormData } from "../handlers/apiHandler";

function SignInForm({ onSignIn }) {
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
    await attemptLoginWithFormData(formData);
    onSignIn();
  };

  return (
    <div>
      <h3>Sign Ip</h3>
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

export default SignInForm;
