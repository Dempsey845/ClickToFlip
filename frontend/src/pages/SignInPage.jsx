import SignInForm from "../components/SignInForm";

function SignInPage({ onSignIn }) {
  return (
    <div className="signInPage">
      <SignIn onSignIn={onSignIn} />
    </div>
  );
}

export default SignInPage;
