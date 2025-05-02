import SignInForm from "../components/SignInForm";

function SignInPage({ onSignIn }) {
  return (
    <div className="signInPage">
      <SignInForm onSignIn={onSignIn} />
    </div>
  );
}

export default SignInPage;
