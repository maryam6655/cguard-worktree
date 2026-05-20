const ShelterManagementHeader = ({ onBack, onAdd, onUpdate }) => {
  return (
    <header className="shelter-admin-header">
      <button type="button" className="header-secondary-btn" onClick={onBack}>
        Back to Dashboard
      </button>

      <h1 className="shelter-admin-title">Shelter Management</h1>

      <div className="header-primary-actions">
        <button type="button" className="header-update-btn" onClick={onUpdate}>
          Update Existing
        </button>
        <button type="button" className="header-primary-btn" onClick={onAdd}>
          + Add Shelter
        </button>
      </div>
    </header>
  );
};

export default ShelterManagementHeader;
