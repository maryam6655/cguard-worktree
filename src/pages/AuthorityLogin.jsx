import React, { useState } from "react";
import CGuardLogoIcon from "../components/CGuardLogoIcon";
import "../styles/AuthorityLogin.css";

const floodPoster = "/flood.jpg";
const floodVideo = "/flood.mp4";

const AuthorityLogin = ({ onLogin, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === "Login") {
        // REAL API CALL to backend
        const response = await fetch("https://ghaniasaghir-cguard-backend.hf.space/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Save token so other pages can use it
          localStorage.setItem("token", data.token);
          localStorage.setItem("userEmail", data.email);
          localStorage.setItem("userName", data.name);

          const userData = {
            email: data.email,
            name: data.name,
            role: data.role,
            loginTime: new Date().toISOString()
          };
          onLogin(userData);
        } else {
          alert(data.detail || "Invalid email or password");
        }

      } else {
        // REAL REGISTER API CALL
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        if (formData.password.length < 6) {
          alert("Password must be at least 6 characters");
          return;
        }

        const response = await fetch("https://ghaniasaghir-cguard-backend.hf.space/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.email.split("@")[0],
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          alert("Account created! Please login.");
          switchToTab("Login");
        } else {
          alert(data.detail || "Registration failed. Try again.");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Could not connect to server. Make sure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchToTab = (tab) => {
    setActiveTab(tab);
    setFormData({
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="login-page">
      {/* Back Button */}
      {onBackToHome && (
        <button className="back-to-home-btn" onClick={onBackToHome}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>
      )}

      {/* Left Side - Background Image with Branding */}
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
                <div className="brand-title">Chenab River Basin Flood Forecasting System</div>
                <div className="brand-line"></div>
                <div className="brand-footer">Authorized access for flood monitoring and response teams</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="login-right">
        <div className="login-card">
          <h2>Authority Login</h2>
          <p className="login-desc">For authorized government officials only</p>

          {/* Tabs */}
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

          {/* Form */}
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
                  style={{ paddingRight: "40px", width: "100%" }}
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
                    justifyContent: "center"
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
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
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

            {activeTab === "Login" && (
              <div className="forgot">Forgot Password?</div>
            )}

            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ?
                (activeTab === "Login" ? "Logging in..." : "Creating Account...") :
                (activeTab === "Login" ? "Login" : "Sign Up")
              }
            </button>
          </form>

          <div className="switch-text">
            {activeTab === "Login" ? (
              <>Don't have access? <span onClick={() => switchToTab("Sign Up")}>Switch to Sign Up</span></>
            ) : (
              <>Already have an account? <span onClick={() => switchToTab("Login")}>Switch to Login</span></>
            )}
          </div>

          <div className="footer-text">
            C Guard | Final Year Project 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;