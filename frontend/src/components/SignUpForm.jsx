import React, { useState } from "react";
import CustomForm from "../components/CustomForm";
import { registerUserWithFormData } from "../handlers/apiHandler";

function SignUpForm({ onSignUp }) {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      await registerUserWithFormData(formData);
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
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
