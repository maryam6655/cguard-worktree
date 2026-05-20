import { useState } from "react";
import "../styles/LandingPage.css";
import CGuardLogoIcon from "../components/CGuardLogoIcon";

const floodPoster = "/flood.jpg";
const floodVideo = "/flood.mp4";

export default function LandingPage({ onCheckFloodRisk }) {
  const [videoFailed, setVideoFailed] = useState(false);

  const handleCheckFloodRisk = () => {
    if (onCheckFloodRisk) {
      onCheckFloodRisk();
    } else {
      // Fallback to scroll behavior if prop not provided
      const mapSection = document.getElementById('map');
      if (mapSection) {
        window.scrollTo({
          top: mapSection.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <section id="home" className="landing-container">
      {/* Background Video */}
      <div className="background-image-wrapper">
        <video
          className={`background-video ${videoFailed ? "hidden" : ""}`}
          autoPlay
          muted
          loop
          playsInline
          poster={floodPoster}
          preload="metadata"
          onError={() => setVideoFailed(true)}
        >
          <source src={floodVideo} type="video/mp4" />
        </video>
        <img
          alt="flood background"
          className={`background-image-fallback ${videoFailed ? "visible" : ""}`}
          src={floodPoster}
        />
        <div className="background-overlay"></div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-brand-row">
            <div className="hero-logo-wrap">
              <CGuardLogoIcon size={132} />
            </div>

            <div className="hero-brand-copy">
              <h1 className="hero-title">C GUARD</h1>
              <p className="hero-subtitle">Chenab River Basin Flood Forecasting System</p>
              <p className="hero-highlight">Real-time monitoring and early warning technology</p>
            </div>
          </div>

          <p className="hero-description">
            Protecting lives with early flood risk insights and timely warnings to support safer communities along the Chenab River Basin through advanced monitoring and forecasting technology.
          </p>

          <button className="cta-btn" onClick={handleCheckFloodRisk}>Check Flood Risk</button>
        </div>
      </div>
    </section>
  );
}
