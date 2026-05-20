import Navbar from "../components/Navbar";
import EmergencyDashboard from "../components/EmergencyDashboard";
import "../styles/SheltersPage.css";

const SheltersPage = ({ onBack, selectedLocation }) => {
  return (
    <div className="shelters-page-shell">
      <Navbar showBackButton onBack={onBack} />

      <main className="shelters-page-main">
        {selectedLocation && (
          <div className="shelters-location-banner">
            Current area: {selectedLocation.uc} — {selectedLocation.district}
          </div>
        )}

        <EmergencyDashboard />
      </main>
    </div>
  );
};

export default SheltersPage;
