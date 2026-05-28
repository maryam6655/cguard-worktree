import React, { useState } from "react";
import CGuardLogoIcon from "../components/CGuardLogoIcon";
import "../styles/AuthorityLogin.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const floodPoster = "/flood.jpg";
const floodVideo = "/flood.mp4";

const AuthorityLogin = ({ onLogin, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const switchToTab = (tab) => {
    setActiveTab(tab);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === "Login") {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          alert(data.detail || data.message || "Invalid email or password");
          return;
        }

        const token = data.access_token || data.token;

        if (!token) {
          alert("Login successful but token missing from backend response.");
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("access_token", token);
        localStorage.setItem("authToken", token);
        localStorage.setItem("userEmail", data.email || formData.email);
        localStorage.setItem("userName", data.name || "Authority User");
        localStorage.setItem("userRole", data.role || "authority");

        const userData = {
          email: data.email || formData.email,
          name: data.name || "Authority User",
          role: data.role || "authority",
          loginTime: new Date().toISOString(),
        };

        onLogin(userData);
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          return;
        }

        if (formData.password.length < 6) {
          alert("Password must be at least 6 characters");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.email.split("@")[0],
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          alert(data.detail || data.message || "Registration failed. Try again.");
          return;
        }

        alert("Account created! Please login.");
        switchToTab("Login");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Could not connect to server. Make sure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-page">
      {onBackToHome && (
        <button className="back-to-home-btn" onClick={onBackToHome}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
      )}

      <div className="login-left">
        <div className="login-left-overlay">
          <video
            className={`login-left-video ${videoFailed ? "hidden" : ""}`}
            autoPlay
            muted
            loop
            playsInline
            poster={floodPoster}
            preload="auto"
            onLoadedData={() => setVideoFailed(false)}
            onError={() => setVideoFailed(true)}
          >
            <source src={floodVideo} type="video/mp4" />
          </video>

          <img
            alt="flood background"
            className={`login-left-fallback ${videoFailed ? "visible" : ""}`}
            src={floodPoster}
          />

          <div className="login-left-shade"></div>

          <div className="login-left-copy">
            <div className="login-brand-row">
              <div className="login-brand-logo">
                <CGuardLogoIcon size={96} />
              </div>

              <div className="login-brand-copy">
                <div className="brand-kicker">C GUARD</div>
                <div className="brand-title">
                  Chenab River Basin Flood Forecasting System
                </div>
                <div className="brand-line"></div>
                <div className="brand-footer">
                  Authorized access for flood monitoring and response teams
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Authority Login</h2>
          <p className="login-desc">For authorized government officials only</p>

          <div className="tab-row">
            <div
              className={`tab ${activeTab === "Login" ? "active" : ""}`}
              onClick={() => switchToTab("Login")}
            >
              Login
            </div>

            <div
              className={`tab ${activeTab === "Sign Up" ? "active" : ""}`}
              onClick={() => switchToTab("Sign Up")}
            >
              Sign Up
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your official email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    paddingRight: "40px",
                    width: "100%",
                  }}
                />

                <div
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#6b859f",
                    fontSize: "18px",
                    userSelect: "none",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </div>

            {activeTab === "Sign Up" && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {activeTab === "Login" && <div className="forgot">Forgot Password?</div>}

            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting
                ? activeTab === "Login"
                  ? "Logging in..."
                  : "Creating Account..."
                : activeTab === "Login"
                  ? "Login"
                  : "Sign Up"}
            </button>
          </form>

          <div className="switch-text">
            {activeTab === "Login" ? (
              <>
                Don't have access?{" "}
                <span onClick={() => switchToTab("Sign Up")}>
                  Switch to Sign Up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span onClick={() => switchToTab("Login")}>Switch to Login</span>
              </>
            )}
          </div>

          <div className="footer-text">C Guard | Final Year Project 2026</div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;