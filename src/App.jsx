import { useState } from "react";
import Home from "./pages/Home";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import ShelterManagementPage from "./pages/ShelterManagementPage";
import FloodRiskPage from "./pages/FloodRiskPage";
import SheltersPage from "./pages/SheltersPage";
import Emergency from "./pages/Emergency";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("home");
  };

  const handleAuthorityLogin = () => {
    setCurrentPage("login");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
  };

  const handleCheckFloodRisk = () => {
    setCurrentPage("floodRisk");
  };

  const handleViewShelters = (location) => {
    setSelectedLocation(location || null);
    setCurrentPage("shelters");
  };

  const handleViewEmergency = () => {
    setCurrentPage("emergency");
  };

  const handleManageShelters = () => {
    setCurrentPage("shelter-management");
  };

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
  };

  // Render based on current page
  if (currentPage === "dashboard" && user) {
    return (
      <AuthorityDashboard
        user={user}
        onLogout={handleLogout}
        onManageShelters={handleManageShelters}
      />
    );
  }

  if (currentPage === "shelter-management" && user) {
    return (
      <ShelterManagementPage
        user={user}
        onBackToDashboard={handleBackToDashboard}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "login") {
    return <AuthorityLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "floodRisk") {
    return (
      <FloodRiskPage
        onBackToHome={handleBackToHome}
        onViewShelters={handleViewShelters}
        onViewEmergency={handleViewEmergency}
      />
    );
  }

  if (currentPage === "shelters") {
    return <SheltersPage onBack={handleCheckFloodRisk} selectedLocation={selectedLocation} />;
  }

  if (currentPage === "emergency") {
    return <Emergency onAuthorityLogin={handleAuthorityLogin} onBack={handleCheckFloodRisk} />;
  }

  return <Home onAuthorityLogin={handleAuthorityLogin} onCheckFloodRisk={handleCheckFloodRisk} />;
}

export default App;
