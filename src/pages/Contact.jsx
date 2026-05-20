import "../styles/Contact.css";

export default function Contact() {
  return (
    <div className="contact-page">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">C Guard</div>

        <ul className="nav-links">
          <li className="nav-item">Home</li>
          <li className="nav-item">Map</li>
          <li className="nav-item">Emergency</li>
          <li className="nav-item active">Contacts</li>
        </ul>

        <button className="login-btn">Authority Login</button>
      </nav>

      {/* CONTACT SECTION */}
      <section className="contact-section">
        <div className="contact-header">
          <div className="contact-icon">✉️</div>
          <h1>Contact Us</h1>
          <p>We’d love to hear from you</p>
        </div>

        <div className="contact-card">
          <form>
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input type="text" placeholder="Enter subject" />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="Write your message..." />
            </div>

            <button type="submit" className="contact-btn">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <h4>C Guard</h4>
            <p>Chenab River Flood Forecasting & Early Warning System</p>
          </div>

          <div>
            <h4>Contact</h4>
            <p>Email: Cguard@gmail.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 C Guard | Final Year Project
        </div>
      </footer>

    </div>
  );
}
