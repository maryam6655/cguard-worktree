import { useState } from "react";
import Home from "./pages/Home";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import ShelterManagementPage from "./pages/ShelterManagementPage";
import FloodRiskPage from "./pages/FloodRiskPage";
import SheltersPage from "./pages/SheltersPage";
import Emergency from "./pages/Emergency";
import ChatbotWidget from "./components/ChatbotWidget";
import { LanguageProvider } from "./context/LanguageContext";
import "./App.css";

// Pages where the public chatbot should NOT appear (authority area + login).
const CHATBOT_HIDDEN_PAGES = new Set(["login", "dashboard", "shelter-management"]);

// Authority routes — bilingual RTL (Urdu) is suppressed here so the authority
// UI keeps its original LTR layout. The user's language preference still
// persists; it just doesn't apply to these pages.
const AUTHORITY_PAGES = new Set(["login", "dashboard", "shelter-management"]);

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

  // Pick the page to render (state-based routing — no react-router here).
  let pageElement;
  if (currentPage === "dashboard" && user) {
    pageElement = (
      <AuthorityDashboard
        user={user}
        onLogout={handleLogout}
        onManageShelters={handleManageShelters}
      />
    );
  } else if (currentPage === "shelter-management" && user) {
    pageElement = (
      <ShelterManagementPage
        user={user}
        onBackToDashboard={handleBackToDashboard}
        onLogout={handleLogout}
      />
    );
  } else if (currentPage === "login") {
    pageElement = <AuthorityLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
  } else if (currentPage === "floodRisk") {
    pageElement = (
      <FloodRiskPage
        onBackToHome={handleBackToHome}
        onViewShelters={handleViewShelters}
        onViewEmergency={handleViewEmergency}
      />
    );
  } else if (currentPage === "shelters") {
    pageElement = <SheltersPage onBack={handleCheckFloodRisk} selectedLocation={selectedLocation} />;
  } else if (currentPage === "emergency") {
    pageElement = <Emergency onAuthorityLogin={handleAuthorityLogin} onBack={handleCheckFloodRisk} />;
  } else {
    pageElement = <Home onAuthorityLogin={handleAuthorityLogin} onCheckFloodRisk={handleCheckFloodRisk} />;
  }

  const showChatbot = !CHATBOT_HIDDEN_PAGES.has(currentPage);
  const suppressRtl = AUTHORITY_PAGES.has(currentPage);

  return (
    <LanguageProvider suppressRtl={suppressRtl}>
      {pageElement}
      <ChatbotWidget hidden={!showChatbot} />
    </LanguageProvider>
  );
}

export default App;
