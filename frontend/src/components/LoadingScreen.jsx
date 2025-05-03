import { useEffect, useState } from "react";

const LoadingScreen = ({
  darkMode = false,
  logoLight = "/Logo (Light).png",
  logoDark = "/Logo (Dark).png",
  message = "Loading, please wait...",
}) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Typing effect (reliable with currentIndex)
  useEffect(() => {
    if (currentIndex < message.length) {
      const typingTimeout = setTimeout(() => {
        setTypedMessage((prev) => prev + message[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(typingTimeout);
    }
  }, [currentIndex, message]);

  // Cursor blinking
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div
      className={`d-flex justify-content-center align-items-center vh-100 ${
        darkMode ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <div
        className={`text-center d-flex flex-column align-items-center ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
        style={{ transition: "opacity 1s ease-in-out" }}
      >
        <img
          src={darkMode ? logoDark : logoLight}
          alt="Logo"
          className="mb-4"
          style={{
            maxWidth: "250px",
            width: "100%",
            filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))",
          }}
        />

        <div
          className={`spinner-border mb-3 ${
            darkMode ? "text-light" : "text-primary"
          }`}
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        <p
          className="fs-5 fw-light"
          style={{
            fontFamily: "monospace",
            whiteSpace: "pre",
          }}
        >
          {typedMessage}
          {showCursor && <span className="blinking-cursor">|</span>}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
