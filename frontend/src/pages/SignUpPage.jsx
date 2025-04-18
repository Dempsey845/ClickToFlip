import SignUpForm from "../components/SignUpForm";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
  const navigate = useNavigate();
  const handleSignUp = () => {
    navigate("/signin");
  };
  return (
    <div id="signUpPage">
      <SignUpForm onSignUp={handleSignUp} />
    </div>
  );
}

export default SignUpPage;
