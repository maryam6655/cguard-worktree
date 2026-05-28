import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  FaAmbulance,
  FaBolt,
  FaHospitalAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaTint,
  FaUserShield,
  FaWater,
  FaWarehouse,
} from "react-icons/fa";
import "../styles/EmergencyDashboard.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const contactIconMap = {
  alert: FaShieldAlt,
  rescue: FaAmbulance,
  police: FaUserShield,
  flood: FaWater,
  admin: FaPhoneAlt,
};

const facilityIconMap = {
  "Drinking Water": FaTint,
  "Medical Aid": FaHospitalAlt,
  Electricity: FaBolt,
};

const getIconKey = (department) => {
  if (department.toLowerCase().includes("pdma")) return "alert";
  if (department.toLowerCase().includes("rescue")) return "rescue";
  if (department.toLowerCase().includes("police")) return "police";
  if (department.toLowerCase().includes("flood")) return "flood";
  return "admin";
};

const sanitizeTelHref = (number) => number.replace(/[^\d+]/g, "");

const translateFacility = (facility, t) => {
  const keyMap = {
    "Drinking Water": "emergency.facility.drinking_water",
    "Medical Aid": "emergency.facility.medical_aid",
    Electricity: "emergency.facility.electricity",
  };

  return t(keyMap[facility] || "emergency.facility.other", facility);
};

const translateStatus = (status, t) => {
  if (status === "Available") return t("emergency.status.available", "Available");
  if (status === "Full") return t("emergency.status.full", "Full");
  return status;
};

function EmergencyContactCard({ item, t }) {
  const Icon = contactIconMap[item.icon] || FaPhoneAlt;
  const telHref = sanitizeTelHref(item.number);

  return (
    <article className="contact-card">
      <div className="contact-card-icon" aria-hidden="true">
        <Icon />
      </div>

      <div className="contact-card-body">
        <p className="contact-card-label">
          {t("emergency.card.service", "Emergency Service")}
        </p>

        <h4 className="contact-card-title">{item.name}</h4>

        <a
          className="contact-card-number"
          href={`tel:${telHref}`}
          aria-label={`${t("emergency.card.call", "Call")} ${item.name} ${t(
            "emergency.card.at",
            "at"
          )} ${item.number}`}
        >
          {item.number}
        </a>
      </div>

      <a className="contact-card-action" href={`tel:${telHref}`}>
        {t("emergency.card.call_now", "Call Now")}
      </a>
    </article>
  );
}

function ShelterCard({ shelter, t }) {
  const isAvailable = shelter.status === "Available";
  const location = shelter.location || shelter.district || "";
  const facilities = shelter.facilities || shelter.amenities || [];

  return (
    <article className="shelter-card">
      <div className="shelter-card-header">
        <div>
          <p className="shelter-card-label">
            {t("emergency.shelter.label", "Flood Shelter")}
          </p>

          <h4 className="shelter-card-title">{shelter.name}</h4>
        </div>

        <span
          className={`status-pill ${isAvailable ? "status-pill--available" : "status-pill--full"
            }`}
        >
          {translateStatus(shelter.status, t)}
        </span>
      </div>

      <div className="shelter-card-meta">
        <div className="shelter-meta-item">
          <FaMapMarkerAlt aria-hidden="true" />
          <span>
            {t(`emergency.location.${location}`, location)}
          </span>
        </div>

        <div className="shelter-meta-item">
          <FaWarehouse aria-hidden="true" />
          <span>
            {shelter.capacity} {t("emergency.shelter.persons", "persons")}
          </span>
        </div>
      </div>

      <div className="facility-chip-row">
        {facilities.map((facility) => {
          const FacilityIcon = facilityIconMap[facility] || FaShieldAlt;

          return (
            <span className="facility-chip" key={facility}>
              <FacilityIcon aria-hidden="true" />
              <span>{translateFacility(facility, t)}</span>
            </span>
          );
        })}
      </div>
    </article>
  );
}

export default function EmergencyDashboard({ showBackButton = false, onBack }) {
  const { t } = useLanguage();

  const [helplines, setHelplines] = useState([
    { name: "PDMA Punjab Helpline", number: "1129", icon: "alert" },
    { name: "Rescue 1122", number: "1122", icon: "rescue" },
    { name: "Police Emergency", number: "15", icon: "police" },
    { name: "Punjab Flood Control Room", number: "(042) 99203005", icon: "flood" },
    { name: "District Administration", number: "1043", icon: "admin" },
  ]);

  const [shelters, setShelters] = useState([
    {
      name: "Government High School Shelter",
      location: "Jhang District",
      capacity: 250,
      status: "Available",
      facilities: ["Drinking Water", "Medical Aid", "Electricity"],
    },
    {
      name: "Community Center Relief Point",
      location: "Chiniot",
      capacity: 180,
      status: "Available",
      facilities: ["Drinking Water", "Medical Aid", "Electricity"],
    },
    {
      name: "District Sports Complex",
      location: "Faisalabad",
      capacity: 300,
      status: "Full",
      facilities: ["Drinking Water", "Medical Aid", "Electricity"],
    },
    {
      name: "Municipal Hall Shelter",
      location: "Gujrat",
      capacity: 200,
      status: "Available",
      facilities: ["Drinking Water", "Medical Aid", "Electricity"],
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, sheltersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/emergency-contacts`),
          fetch(`${API_BASE_URL}/api/shelters`),
        ]);

        const contactsData = await contactsRes.json();
        const sheltersData = await sheltersRes.json();

        const mappedContacts = contactsData.map((c) => ({
          name: c.department,
          number: c.number,
          icon: getIconKey(c.department),
        }));

        setHelplines(mappedContacts);
        setShelters(sheltersData);
      } catch (error) {
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
              {t("emergency.back", "Back")}
            </button>
          </div>
        )}

        <header className="emergency-dashboard-header">
          <h2 className="dashboard-title">
            {t("emergency.title", "Emergency Information")}
          </h2>

          <p className="dashboard-subtitle">
            {t(
              "emergency.subtitle",
              "Critical helplines and shelter availability for the Chenab flood response network."
            )}
          </p>
        </header>

        <div className="emergency-dashboard-grid">
          <section className="dashboard-panel">
            <div className="panel-header">
              <h3>
                {t("emergency.helpline.title", "Emergency Helpline Numbers")}
              </h3>

              <p>
                {t(
                  "emergency.helpline.subtitle",
                  "Immediate contacts for rescue, police, and district response coordination."
                )}
              </p>
            </div>

            <div className="contact-card-list">
              {helplines.map((item) => (
                <EmergencyContactCard key={item.name} item={item} t={t} />
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="panel-header">
              <h3>{t("emergency.shelters.title", "Flood Shelters")}</h3>

              <p>
                {t(
                  "emergency.shelters.subtitle",
                  "Verified shelter locations with capacity and support facility details."
                )}
              </p>
            </div>

            <div className="shelter-card-list">
              {shelters.map((shelter) => (
                <ShelterCard key={shelter.name} shelter={shelter} t={t} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}