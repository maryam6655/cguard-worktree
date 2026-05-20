import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import LandingPage from './LandingPage';
import MapPage from './MapPage';
import EmergencySection from '../components/EmergencySection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import '../styles/Home.css';

const Home = ({ onAuthorityLogin, onCheckFloodRisk }) => {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="home-page">
      <Navbar onAuthorityLogin={onAuthorityLogin} />
      
      <main className="home-content">
        <LandingPage onCheckFloodRisk={onCheckFloodRisk} />
        <section id="map" className="map-section-wrapper">
          <div className="map-section-header">
            <h2 className="section-title">Live Flood Risk Map</h2>
            <p className="section-subtitle">Real-time visualization of flood risk across Chenab River Basin</p>
          </div>
          <MapPage />
        </section>
        <EmergencySection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
