import { useMemo, useState } from 'react';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import ShelterManagementHeader from '../components/ShelterManagementHeader';
import ShelterActionCards from '../components/ShelterActionCards';
import ShelterTable from '../components/ShelterTable';
import '../styles/AuthorityDashboard.css';
import '../styles/ShelterManagementPage.css';

const initialShelters = [
  {
    id: 1,
    name: 'Kot Saleem Community Shelter',
    location: 'Kot Saleem, Jhang District',
    capacity: 180,
    occupied: 112,
    status: 'Available',
    facilities: {
      water: true,
      medical: true,
      food: true
    }
  },
  {
    id: 2,
    name: 'Trimmu Relief Center',
    location: 'Trimmu, Jhang District',
    capacity: 240,
    occupied: 240,
    status: 'Full',
    facilities: {
      water: true,
      medical: true,
      food: false
    }
  },
  {
    id: 3,
    name: 'Qadirabad School Shelter',
    location: 'Qadirabad, Mandi Bahauddin District',
    capacity: 150,
    occupied: 70,
    status: 'Available',
    facilities: {
      water: true,
      medical: false,
      food: true
    }
  },
  {
    id: 4,
    name: 'Khanki Health Post Shelter',
    location: 'Khanki, Gujrat District',
    capacity: 120,
    occupied: 55,
    status: 'Available',
    facilities: {
      water: false,
      medical: true,
      food: true
    }
  }
];

const emptyShelterForm = {
  name: '',
  location: '',
  capacity: '',
  occupied: '',
  status: 'Available',
  facilities: {
    water: false,
    medical: false,
    food: false
  }
};

const facilityLabels = [
  { key: 'water', label: 'Drinking Water', shortLabel: 'Water' },
  { key: 'medical', label: 'Medical Aid', shortLabel: 'Medical' },
  { key: 'food', label: 'Food Supply', shortLabel: 'Food' }
];

const ShelterManagementPage = ({ user, onBackToDashboard, onLogout }) => {
  const [selectedUC, setSelectedUC] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('48');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shelters, setShelters] = useState(initialShelters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatePickerOpen, setIsUpdatePickerOpen] = useState(false);
  const [editingShelterId, setEditingShelterId] = useState(null);
  const [formData, setFormData] = useState(emptyShelterForm);

  const availableShelters = shelters.filter((shelter) => shelter.status === 'Available').length;
  const fullShelters = shelters.filter((shelter) => shelter.status === 'Full').length;
  const totalCapacity = shelters.reduce((total, shelter) => total + shelter.capacity, 0);
  const totalOccupied = shelters.reduce((total, shelter) => total + shelter.occupied, 0);

  const unitCommands = useMemo(() => ([
    { id: 1, name: 'Kot Saleem' },
    { id: 2, name: 'Kot Khaira' },
    { id: 3, name: 'Marala' },
    { id: 4, name: 'Rasul' },
    { id: 5, name: 'Qadirabad' },
    { id: 6, name: 'Khanki' },
    { id: 7, name: 'Trimmu' },
    { id: 8, name: 'Panjnad' }
  ]), []);

  const openForm = (shelter = null) => {
    setIsUpdatePickerOpen(false);

    if (shelter) {
      setEditingShelterId(shelter.id);
      setFormData({
        name: shelter.name,
        location: shelter.location,
        capacity: String(shelter.capacity),
        occupied: String(shelter.occupied),
        status: shelter.status,
        facilities: { ...shelter.facilities }
      });
    } else {
      setEditingShelterId(null);
      setFormData(emptyShelterForm);
    }

    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingShelterId(null);
    setFormData(emptyShelterForm);
  };

  const openUpdatePicker = () => {
    setIsUpdatePickerOpen(true);
  };

  const closeUpdatePicker = () => {
    setIsUpdatePickerOpen(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleFacilityChange = (facilityKey) => {
    setFormData((current) => ({
      ...current,
      facilities: {
        ...current.facilities,
        [facilityKey]: !current.facilities[facilityKey]
      }
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const parsedCapacity = Number(formData.capacity);
    const parsedOccupied = Number(formData.occupied || 0);
    const normalizedOccupied = formData.status === 'Full'
      ? parsedCapacity
      : Math.min(Math.max(parsedOccupied, 0), parsedCapacity);

    const normalizedShelter = {
      id: editingShelterId ?? Date.now(),
      name: formData.name.trim(),
      location: formData.location.trim(),
      capacity: parsedCapacity,
      occupied: normalizedOccupied,
      status: formData.status,
      facilities: { ...formData.facilities }
    };

    setShelters((current) => {
      if (editingShelterId) {
        return current.map((shelter) => (
          shelter.id === editingShelterId ? normalizedShelter : shelter
        ));
      }

      return [normalizedShelter, ...current];
    });

    closeForm();
  };

  return (
    <div className="dashboard-container shelter-management-shell">
      <TopNavbar user={user} onLogout={onLogout} />

      <div className="dashboard-content">
        <Sidebar
          unitCommands={unitCommands}
          selectedUC={selectedUC}
          onUCChange={setSelectedUC}
          forecastPeriod={forecastPeriod}
          onForecastPeriodChange={setForecastPeriod}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onManageShelters={onBackToDashboard}
          activePage="shelter-management"
        />

        <main className="main-area shelter-management-main">
          <div className="shelter-management-inner">
            <ShelterManagementHeader
              onBack={onBackToDashboard}
              onAdd={() => openForm()}
              onUpdate={openUpdatePicker}
            />

            <section className="shelter-content-shell">
              <div className="main-header shelter-management-header">
                <p className="main-subtitle">Manage shelter capacity, occupancy, availability, and support facilities for flood response operations.</p>
              </div>

              <ShelterActionCards
                onAddShelter={() => openForm()}
                onGoToUpdate={() => document.getElementById('shelter-table-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                onViewCapacity={() => document.getElementById('shelter-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              />

              <section className="shelter-summary-row" id="shelter-summary" aria-label="Shelter summary">
                <div className="summary-card">
                  <span className="summary-label">Total Shelters</span>
                  <strong>{shelters.length}</strong>
                </div>
                <div className="summary-card summary-card--available">
                  <span className="summary-label">Available</span>
                  <strong>{availableShelters}</strong>
                </div>
                <div className="summary-card summary-card--full">
                  <span className="summary-label">Full</span>
                  <strong>{fullShelters}</strong>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Total Capacity</span>
                  <strong>{totalCapacity}</strong>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Total Occupied</span>
                  <strong>{totalOccupied}</strong>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Utilization</span>
                  <strong>{totalCapacity ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'}</strong>
                </div>
              </section>

              <ShelterTable shelters={shelters} facilityLabels={facilityLabels} onEdit={openForm} />
            </section>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="shelter-modal-overlay" onClick={closeForm} role="presentation">
          <div className="shelter-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="shelter-form-title">
            <div className="shelter-modal-header">
              <div>
                <h2 id="shelter-form-title">{editingShelterId ? 'Edit Shelter' : 'Add Shelter'}</h2>
                <p>Update shelter details and available facilities.</p>
              </div>
              <button className="modal-close-btn" type="button" onClick={closeForm}>
                Close
              </button>
            </div>

            <form className="shelter-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Shelter Name</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Location</span>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(event) => handleFieldChange('location', event.target.value)}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Capacity</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(event) => handleFieldChange('capacity', event.target.value)}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Occupied</span>
                  <input
                    type="number"
                    min="0"
                    max={formData.capacity || undefined}
                    value={formData.occupied}
                    onChange={(event) => handleFieldChange('occupied', event.target.value)}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Status</span>
                  <select
                    value={formData.status}
                    onChange={(event) => handleFieldChange('status', event.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                  </select>
                </label>
              </div>

              <div className="facility-section">
                <span className="facility-section-title">Facilities</span>
                <div className="facility-checkbox-grid">
                  {facilityLabels.map((facility) => (
                    <label className="facility-checkbox" key={facility.key}>
                      <input
                        type="checkbox"
                        checked={formData.facilities[facility.key]}
                        onChange={() => handleFacilityChange(facility.key)}
                      />
                      <span>{facility.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="shelter-form-actions">
                <button type="button" className="modal-secondary-btn" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary-btn">
                  {editingShelterId ? 'Save Changes' : 'Add Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdatePickerOpen && (
        <div className="shelter-modal-overlay" onClick={closeUpdatePicker} role="presentation">
          <div className="shelter-modal shelter-update-picker" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="update-picker-title">
            <div className="shelter-modal-header">
              <div>
                <h2 id="update-picker-title">Update Existing Shelter</h2>
                <p>Select a shelter from the current list to edit capacity, status, and facilities.</p>
              </div>
              <button className="modal-close-btn" type="button" onClick={closeUpdatePicker}>
                Close
              </button>
            </div>

            <div className="update-picker-list" role="list">
              {shelters.map((shelter) => (
                <div className="update-picker-item" key={shelter.id} role="listitem">
                  <div>
                    <h4>{shelter.name}</h4>
                    <p>{shelter.location}</p>
                  </div>
                  <button type="button" className="table-action-btn" onClick={() => openForm(shelter)}>
                    Update This Shelter
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterManagementPage;