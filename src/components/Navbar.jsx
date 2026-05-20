import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import CGuardLogoIcon from './CGuardLogoIcon';

const Navbar = ({ onAuthorityLogin, showBackButton = false, onBack }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Handle scroll to add shadow/background to navbar
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = ['home', 'map', 'emergency', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 70; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsMenuOpen(false); // Close mobile menu after clicking
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'map', label: 'Map' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className={`navbar-main ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-logo" onClick={() => scrollToSection('home')}>
          <span className="navbar-logo-icon">
            <CGuardLogoIcon size={40} />
          </span>
          <span className="navbar-logo-text">C Guard</span>
        </div>

        {!showBackButton && (
          <>
            {/* Desktop Menu */}
            <ul className="navbar-links">
              {navItems.map(item => (
                <li
                  key={item.id}
                  className={`navbar-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </li>
              ))}
            </ul>

            <button className="navbar-login-btn" onClick={onAuthorityLogin}>
              Authority Login
            </button>
          </>
        )}

        {showBackButton && (
          <button className="navbar-back-btn" onClick={onBack} type="button">
            ← Back to Previous Page
          </button>
        )}

        {/* Mobile Hamburger */}
        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {!showBackButton && isMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`mobile-menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </div>
          ))}
          <button className="mobile-login-btn" onClick={() => { onAuthorityLogin(); setIsMenuOpen(false); }}>
            Authority Login
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
