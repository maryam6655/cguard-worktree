const ShelterTable = ({ shelters, facilityLabels, onEdit }) => {
  return (
    <section className="shelter-table-card" id="shelter-table-section">
      <div className="shelter-table-header">
        <h2>Existing Shelters</h2>
        <p>Manage shelter operations and keep facility and occupancy records up to date.</p>
      </div>

      <div className="shelter-table-wrap">
        <table className="shelter-table">
          <thead>
            <tr>
              <th>Shelter Name</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Occupied</th>
              <th>Status</th>
              <th>Facilities (Water, Medical, Food)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shelters.map((shelter) => (
              <tr key={shelter.id}>
                <td>
                  <span className="shelter-name">{shelter.name}</span>
                </td>
                <td>{shelter.location}</td>
                <td>{shelter.capacity}</td>
                <td>{shelter.occupied}</td>
                <td>
                  <span className={`status-pill ${shelter.status === 'Available' ? 'status-pill--available' : 'status-pill--full'}`}>
                    {shelter.status}
                  </span>
                </td>
                <td>
                  <div className="facility-list">
                    {facilityLabels.map((facility) => {
                      const enabled = shelter.facilities[facility.key];

                      return (
                        <span key={facility.key} className={`facility-pill ${enabled ? 'is-available' : 'is-unavailable'}`}>
                          {facility.shortLabel}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <button type="button" className="table-action-btn" onClick={() => onEdit(shelter)}>
                    Edit / Update
                  </button>
                </td>
              </tr>
            ))}

            {shelters.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-table-state">
                  No shelters added yet. Use "+ Add Shelter" to create your first shelter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ShelterTable;
