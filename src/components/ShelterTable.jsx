const STATUS_CLASS = {
  Available: 'status-pill--available',
  Full: 'status-pill--full',
  Inactive: 'status-pill--inactive',
};

const ShelterTable = ({ shelters, facilityLabels, onEdit, onDelete }) => {
  return (
    <section className="shelter-table-card" id="shelter-table-section">
      <div className="shelter-table-header">
        <h2>Existing Shelters</h2>
        <p>Manage shelter operations and keep facility, capacity, and contact records up to date.</p>
      </div>

      <div className="shelter-table-wrap">
        <table className="shelter-table">
          <thead>
            <tr>
              <th>Shelter Name</th>
              <th>Location / Address</th>
              <th>Union Council</th>
              <th>District</th>
              <th>Capacity</th>
              {facilityLabels.map((facility) => (
                <th key={facility.key}>{facility.label}</th>
              ))}
              <th>Status</th>
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
                <td>{shelter.unionCouncil || '—'}</td>
                <td>{shelter.district || '—'}</td>
                <td>{shelter.capacity}</td>
                {facilityLabels.map((facility) => (
                  <td key={facility.key}>
                    <span
                      className={`facility-pill ${
                        shelter.facilities?.[facility.key] ? 'is-available' : 'is-unavailable'
                      }`}
                    >
                      {shelter.facilities?.[facility.key] ? 'Yes' : 'No'}
                    </span>
                  </td>
                ))}
                <td>
                  <span
                    className={`status-pill ${
                      STATUS_CLASS[shelter.status] ?? 'status-pill--available'
                    }`}
                  >
                    {shelter.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => onEdit(shelter)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="table-action-btn table-action-btn--danger"
                      onClick={() => onDelete?.(shelter)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {shelters.length === 0 && (
              <tr>
                <td colSpan={6 + facilityLabels.length + 2} className="empty-table-state">
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
