import Navbar from "../components/Navbar";
import EmergencyDashboard from "../components/EmergencyDashboard";
import "../styles/EmergencyPage.css";

export default function Emergency({ onAuthorityLogin, onBack }) {
  return (
    <div className="emergency-page-shell">
      <Navbar
        onAuthorityLogin={onAuthorityLogin}
        showBackButton
        onBack={onBack}
      />
      <main className="emergency-page-main">
        <EmergencyDashboard />
      </main>
    </div>
  );
}
