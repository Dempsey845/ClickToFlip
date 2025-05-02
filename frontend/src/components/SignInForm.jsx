import CustomForm from "../components/CustomForm";
import { attemptLoginWithFormData } from "../handlers/apiHandler";
import { useNavigate } from "react-router-dom";

function SignInForm({ onSignIn }) {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
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
    />
  );
}

export default SignInForm;
