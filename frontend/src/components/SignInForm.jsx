import CustomForm from "../components/CustomForm";
import { attemptLoginWithFormData } from "../handlers/apiHandler";

function SignIn({ onSignIn }) {
  const handleLogin = async (formData) => {
    try {
      // Attempt to log in with the provided form data
      const loginSuccessful = await attemptLoginWithFormData(formData);

      // Only call onSignIn if login was successful
      if (loginSuccessful) {
        onSignIn();
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

export default SignIn;
