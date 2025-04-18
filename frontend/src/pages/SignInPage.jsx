import SignInForm from "../components/SignInForm";
import { useNavigate } from "react-router-dom";

function SignInPage({ onSignIn }) {
  const navigate = useNavigate();
  const handleSignIn = () => {
    onSignIn();
    navigate("/dashboard");
  };

  return (
    <div d="signInPage">
      <SignInForm onSignIn={handleSignIn} />
    </div>
  );
}

export default SignInPage;
