import SignIn from "../components/SignIn";

function SignInPage({ onSignIn }) {
  return (
    <div className="signInPage">
      <SignIn onSignIn={onSignIn} />
    </div>
  );
}

export default SignInPage;
