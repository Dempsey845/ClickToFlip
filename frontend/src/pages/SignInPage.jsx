import { useNavigate } from "react-router-dom";
import SignInForm from "../components/SignInForm";

function SignInPage({ onSignIn }) {
  const navigate = useNavigate();
  const handleSignIn = () => {
    onSignIn();
    navigate("/dashboard");
  };
  return (
    <div className="signInPage">
      <SignInForm onSignIn={onSignIn} />
    </div>
  );
}

export default SignInPage;
