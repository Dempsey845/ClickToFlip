import React, { useState } from "react";
import { contact } from "../handlers/apiHandler";

function ContactPage({ darkMode }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      await contact(formData);
      setFormData({ name: "", email: "", message: "" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Header Section */}
      <div className="container py-5 text-center">
        <h1 className="display-5 fw-bold">Contact Us</h1>
        <p className="lead">
          Got a question or feature idea? We’d love to hear from you.
        </p>
      </div>

      {/* Contact Form */}
      <div className="container mb-5" style={{ maxWidth: "600px" }}>
        <form id="contactForm" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              <i className="bi bi-person-fill me-2"></i>Name
            </label>
            <input
              type="text"
              className={`form-control ${
                darkMode ? "bg-secondary text-light border-0" : ""
              }`}
              id="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="bi bi-envelope-fill me-2"></i>Email address
            </label>
            <input
              type="email"
              className={`form-control ${
                darkMode ? "bg-secondary text-light border-0" : ""
              }`}
              id="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              <i className="bi bi-chat-dots-fill me-2"></i>Message
            </label>
            <textarea
              className={`form-control ${
                darkMode ? "bg-secondary text-light border-0" : ""
              }`}
              id="message"
              rows="4"
              placeholder="Type your message here..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <footer
        className={`text-center py-3 mt-5 ${
          darkMode ? "bg-dark text-light" : "bg-light text-dark"
        }`}
      >
        <small>&copy; {new Date().getFullYear()} Click To Flip</small>
      </footer>
    </div>
  );
}

export default ContactPage;
