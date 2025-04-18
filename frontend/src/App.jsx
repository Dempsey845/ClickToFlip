import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SignUpForm from "./components/SignUpForm";
import SignInForm from "./components/SignInForm";
import { isAuthenticated, logout } from "./handlers/apiHandler";

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setAuthenticated(auth);
      } catch (err) {
        console.error("Failed to check authentication:", err);
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const attemptLogout = async () => {
    await logout();
    setAuthenticated(false);
    console.log("Logged out!");
  };

  const onSignIn = () => {
    setAuthenticated(isAuthenticated());
  };

  const showSignIn = () => {
    return <SignInForm onSignIn={onSignIn} />;
  };

  const showLogout = () => {
    return (
      <div>
        <h3 onClick={attemptLogout}>Logout</h3>
      </div>
    );
  };

  return <div>{authenticated ? showLogout() : showSignIn()}</div>;
}

export default App;
