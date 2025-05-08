import React, { useState } from "react";
import CustomForm from "../components/CustomForm";
import { registerUserWithFormData } from "../handlers/apiHandler";
import { useNavigate } from "react-router-dom";

function SignUpForm({ onSignUp }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      await registerUserWithFormData(formData);
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
      navigate("/signin");
    }
    if (onSignUp) onSignUp();
  };

  return (
    <CustomForm
      title="Sign Up"
      onSubmit={handleRegister}
      fields={[
        { name: "email", label: "Email", type: "email" },
        { name: "username", label: "Username", type: "username" },
        { name: "password", label: "Password", type: "password" },
      ]}
      disabled={loading}
    />
  );
}

export default SignUpForm;
