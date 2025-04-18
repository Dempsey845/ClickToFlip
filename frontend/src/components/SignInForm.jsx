import CustomForm from "../components/CustomForm";
import { attemptLoginWithFormData } from "../handlers/apiHandler";

function SignIn({ onSignIn }) {
  const handleLogin = async (formData) => {
    await attemptLoginWithFormData(formData);
    onSignIn();
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
