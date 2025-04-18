import React from "react";
import CustomForm from "../components/CustomForm";
import { registerUserWithFormData } from "../handlers/apiHandler";

function SignUpForm({ onSignUp }) {
  const handleRegister = async (formData) => {
    await registerUserWithFormData(formData);
    if (onSignUp) onSignUp();
  };

  return (
    <CustomForm
      title="Sign Up"
      onSubmit={handleRegister}
      fields={[
        { name: "email", label: "Email", type: "email" },
        { name: "password", label: "Password", type: "password" },
      ]}
    />
  );
}

export default SignUpForm;
