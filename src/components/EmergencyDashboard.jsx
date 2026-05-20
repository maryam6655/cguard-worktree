import { useEffect, useState } from "react";
import { FaAmbulance, FaBolt, FaHospitalAlt, FaMapMarkerAlt, FaPhoneAlt, FaShieldAlt, FaTint, FaUserShield, FaWater, FaWarehouse } from "react-icons/fa";
import "../styles/EmergencyDashboard.css";

const contactIconMap = {
  alert:  FaShieldAlt,
  rescue: FaAmbulance,
  police: FaUserShield,
  flood:  FaWater,
  admin:  FaPhoneAlt,
};

const facilityIconMap = {
  "Drinking Water": FaTint,
  "Medical Aid":    FaHospitalAlt,
  "Electricity":    FaBolt,
};

const getIconKey = (department) => {
  if (department.toLowerCase().includes("pdma"))   return "alert";
  if (department.toLowerCase().includes("rescue")) return "rescue";
  if (department.toLowerCase().includes("police")) return "police";
  if (department.toLowerCase().includes("flood"))  return "flood";
  return "admin";
};

const sanitizeTelHref = (number) => number.replace(/[^\d+]/g, "");

function EmergencyContactCard({ item }) {
  const Icon = contactIconMap[item.icon] || FaPhoneAlt;
  const telHref = sanitizeTelHref(item.number);
  return (
    <article className="contact-card">
      <div className="contact-card-icon" aria-hidden="true">
        <Icon />
      </div>
      <div className="contact-card-body">
        <p className="contact-card-label">Emergency Service</p>
        <h4 className="contact-card-title">{item.name}</h4>
        <a className="contact-card-number" href={`tel:${telHref}`} aria-label={`Call ${item.name} at ${item.number}`}>
          {item.number}
        </a>
      </div>
      <a className="contact-card-action" href={`tel:${telHref}`}>
        Call Now
      </a>
    </article>
  );
}

function ShelterCard({ shelter }) {
  const isAvailable = shelter.status === "Available";
  const location    = shelter.location || shelter.district || "";
  const facilities  = shelter.facilities || shelter.amenities || [];

  return (
    <article className="shelter-card">
      <div className="shelter-card-header">
        <div>
          <p className="shelter-card-label">Flood Shelter</p>
          <h4 className="shelter-card-title">{shelter.name}</h4>
        </div>
        <span className={`status-pill ${isAvailable ? "status-pill--available" : "status-pill--full"}`}>
          {shelter.status}
        </span>
      </div>
      <div className="shelter-card-meta">
        <div className="shelter-meta-item">
          <FaMapMarkerAlt aria-hidden="true" />
          <span>{location}</span>
        </div>
        <div className="shelter-meta-item">
          <FaWarehouse aria-hidden="true" />
          <span>{shelter.capacity} persons</span>
        </div>
      </div>
      <div className="facility-chip-row">
        {facilities.map((facility) => {
          const FacilityIcon = facilityIconMap[facility] || FaShieldAlt;
          return (
            <span className="facility-chip" key={facility}>
              <FacilityIcon aria-hidden="true" />
              <span>{facility}</span>
            </span>
          );
        })}
      </div>
    </article>
  );
}

export default function EmergencyDashboard({ showBackButton = false, onBack }) {
  // ── Start with fallback data so cards always show immediately ──
  const [helplines, setHelplines] = useState([
    { name: "PDMA Punjab Helpline",      number: "1129",           icon: "alert"  },
    { name: "Rescue 1122",               number: "1122",           icon: "rescue" },
    { name: "Police Emergency",          number: "15",             icon: "police" },
    { name: "Punjab Flood Control Room", number: "(042) 99203005", icon: "flood"  },
    { name: "District Administration",   number: "1043",           icon: "admin"  },
  ]);
  const [shelters, setShelters] = useState([
    { name: "Government High School Shelter", location: "Jhang District", capacity: 250, status: "Available", facilities: ["Drinking Water", "Medical Aid", "Electricity"] },
    { name: "Community Center Relief Point",  location: "Chiniot",        capacity: 180, status: "Available", facilities: ["Drinking Water", "Medical Aid", "Electricity"] },
    { name: "District Sports Complex",        location: "Faisalabad",     capacity: 300, status: "Full",      facilities: ["Drinking Water", "Medical Aid", "Electricity"] },
    { name: "Municipal Hall Shelter",         location: "Gujrat",         capacity: 200, status: "Available", facilities: ["Drinking Water", "Medical Aid", "Electricity"] },
  ]);
  const [loading, setLoading] = useState(false); // false = show cards immediately

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, sheltersRes] = await Promise.all([
          fetch("https://ghaniasaghir-cguard-backend.hf.space/emergency-contacts"),
          fetch("https://ghaniasaghir-cguard-backend.hf.space/shelters"),
        ]);

        const contactsData = await contactsRes.json();
        const sheltersData = await sheltersRes.json();

        const mappedContacts = contactsData.map((c) => ({
          name:   c.department,
          number: c.number,
          icon:   getIconKey(c.department),
        }));

        // Replace fallback with real backend data
        setHelplines(mappedContacts);
        setShelters(sheltersData);
      } catch (error) {
        // Backend is asleep or unreachable — fallback data already showing, do nothing
        console.log("Using fallback data:", error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="emergency-dashboard-shell">
      <div className="emergency-dashboard-container">
        {showBackButton && (
          <div className="dashboard-topbar">
            <button className="dashboard-back-btn" onClick={onBack} type="button">
              Back
            </button>
          </div>
        )}

        <header className="emergency-dashboard-header">
          <h2 className="dashboard-title">Emergency Information</h2>
          <p className="dashboard-subtitle">
            Critical helplines and shelter availability for the Chenab flood response network.
          </p>
        </header>

        <div className="emergency-dashboard-grid">
          <section className="dashboard-panel">
            <div className="panel-header">
              <h3>Emergency Helpline Numbers</h3>
              <p>Immediate contacts for rescue, police, and district response coordination.</p>
            </div>
            <div className="contact-card-list">
              {helplines.map((item) => (
                <EmergencyContactCard key={item.name} item={item} />
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="panel-header">
              <h3>Flood Shelters</h3>
              <p>Verified shelter locations with capacity and support facility details.</p>
            </div>
            <div className="shelter-card-list">
              {shelters.map((shelter) => (
                <ShelterCard key={shelter.name} shelter={shelter} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}