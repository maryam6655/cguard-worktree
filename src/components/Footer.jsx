import { FaChevronRight, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import CGuardLogoIcon from './CGuardLogoIcon';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="footer-main">
      <div className="footer-container">
        <div className="footer-hero">
          <div className="footer-brand footer-brand--hero">
            <CGuardLogoIcon size={40} />
            <div>
              <h3 className="footer-logo">C Guard</h3>
              <p className="footer-description">
                Chenab River flood forecasting and early warning support for emergency response teams and local communities.
              </p>
            </div>
          </div>

          <p className="footer-tagline">
            Protecting lives with early flood risk insights and coordinated response information.
          </p>
        </div>

        <div className="footer-grid">
          <div className="footer-panel footer-links-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => scrollToSection('home')}>
                  <FaChevronRight aria-hidden="true" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('map')}>
                  <FaChevronRight aria-hidden="true" />
                  <span>Flood Map</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('emergency')}>
                  <FaChevronRight aria-hidden="true" />
                  <span>Emergency</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('contact')}>
                  <FaChevronRight aria-hidden="true" />
                  <span>Contact Us</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-panel footer-contact-section">
            <h4 className="footer-heading">Contact</h4>
            <div className="footer-contact-item">
              <span className="contact-icon" aria-hidden="true"><FaEnvelope /></span>
              <span>Cguard@gmail.com</span>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon" aria-hidden="true"><FaPhoneAlt /></span>
              <span>+92 300 1234567</span>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon" aria-hidden="true"><FaMapMarkerAlt /></span>
              <span>Chenab River Basin, Pakistan</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} C Guard | Final Year Project</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
