import { FaClipboardList, FaPlusCircle, FaSyncAlt } from 'react-icons/fa';

const ShelterActionCard = ({ icon, title, description, onClick }) => {
  return (
    <button type="button" className="shelter-action-card" onClick={onClick}>
      <span className="shelter-action-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="shelter-action-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </button>
  );
};

const ShelterActionCards = ({ onAddShelter, onGoToUpdate, onViewCapacity }) => {
  return (
    <section className="shelter-action-grid" aria-label="Shelter actions">
      <ShelterActionCard
        icon={<FaPlusCircle />}
        title="Add New Shelter"
        description="Register a new shelter site with location, capacity, and service facilities."
        onClick={onAddShelter}
      />
      <ShelterActionCard
        icon={<FaSyncAlt />}
        title="Update Existing Shelter"
        description="Open the current shelter list and edit capacity, status, or facilities instantly."
        onClick={onGoToUpdate}
      />
      <ShelterActionCard
        icon={<FaClipboardList />}
        title="View Capacity Status"
        description="Review total, occupied, and available shelter coverage for active response."
        onClick={onViewCapacity}
      />
    </section>
  );
};

export default ShelterActionCards;
