import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Contact.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Contact() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      setSuccessMessage(
        data.message || t("contact.success", "Message sent successfully.")
      );

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        t("contact.error", "Unable to send message. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">C Guard</div>

        <ul className="nav-links">
          <li className="nav-item">{t("navbar.home", "Home")}</li>
          <li className="nav-item">{t("navbar.map", "Map")}</li>
          <li className="nav-item">{t("navbar.emergency", "Emergency")}</li>
          <li className="nav-item active">{t("navbar.contact", "Contact")}</li>
        </ul>

        <button className="login-btn">
          {t("navbar.authority_login", "Authority Login")}
        </button>
      </nav>

      {/* CONTACT SECTION */}
      <section className="contact-section">
        <div className="contact-header">
          <div className="contact-icon">✉️</div>
          <h1>{t("contact.title", "Contact Us")}</h1>
          <p>{t("contact.subtitle", "We’d love to hear from you")}</p>
        </div>

        <div className="contact-card">
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t("contact.form.name", "Name")}</label>
              <input
                type="text"
                name="name"
                placeholder={t("contact.placeholder.name", "Enter your name")}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t("contact.form.email", "Email")}</label>
              <input
                type="email"
                name="email"
                placeholder={t("contact.placeholder.email", "Enter your email")}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t("contact.form.subject", "Subject")}</label>
              <input
                type="text"
                name="subject"
                placeholder={t("contact.placeholder.subject", "Enter subject")}
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t("contact.form.message", "Message")}</label>
              <textarea
                name="message"
                placeholder={t(
                  "contact.placeholder.message",
                  "Write your message..."
                )}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="contact-btn"
              disabled={loading}
            >
              {loading
                ? t("contact.sending", "Sending...")
                : t("contact.send", "Send Message")}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <h4>C Guard</h4>
            <p>
              {t(
                "contact.footer.description",
                "Chenab River Flood Forecasting & Early Warning System"
              )}
            </p>
          </div>

          <div>
            <h4>{t("contact.footer.contact", "Contact")}</h4>
            <p>Email: Cguard@gmail.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          {t("contact.footer.bottom", "© 2026 C Guard | Final Year Project")}
        </div>
      </footer>
    </div>
  );
}