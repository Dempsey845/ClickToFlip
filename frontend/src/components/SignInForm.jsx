import { useState } from "react";
import CustomForm from "../components/CustomForm";
import { attemptLoginWithFormData } from "../handlers/apiHandler";
import { useNavigate } from "react-router-dom";

function SignInForm({ onSignIn }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      setLoading(true);
      // Attempt to log in with the provided form data
      const loginSuccessful = await attemptLoginWithFormData(formData);

      // Only call onSignIn if login was successful
      if (loginSuccessful) {
        onSignIn(); // Update authentication state in the parent component
        // navigate("/dashboard"); // Redirect to the dashboard
      } else {
        console.log("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomForm
      title="Sign In"
      onSubmit={handleLogin}
      fields={[
        { name: "email", label: "Email", type: "text" },
        { name: "password", label: "Password", type: "password" },
      ]}
      disabled={loading}
    />
  );
}

export default SignInForm;
