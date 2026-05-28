import { useEffect, useMemo, useState } from 'react';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import ShelterManagementHeader from '../components/ShelterManagementHeader';
import ShelterTable from '../components/ShelterTable';
import '../styles/AuthorityDashboard.css';
import '../styles/ShelterManagementPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const emptyShelterForm = {
  name: '',
  location: '',
  unionCouncil: '',
  district: '',
  contactNumber: '',
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

const facilityNameToKey = {
  'Drinking Water': 'water',
  Water: 'water',
  'Medical Aid': 'medical',
  Medical: 'medical',
  'Food Supply': 'food',
  Food: 'food'
};

const getAuthToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('authToken') ||
  localStorage.getItem('access_token') ||
  '';

const facilitiesArrayToObject = (facilities) => {
  const result = {
    water: false,
    medical: false,
    food: false
  };

  if (!Array.isArray(facilities)) return result;

  facilities.forEach((facility) => {
    const key = facilityNameToKey[facility] || facilityNameToKey[String(facility).trim()];
    if (key) result[key] = true;
  });

  return result;
};

const facilitiesObjectToArray = (facilities) =>
  facilityLabels
    .filter((facility) => facilities?.[facility.key])
    .map((facility) => facility.label);

const normalizeShelterFromBackend = (shelter) => ({
  id: shelter.id,
  name: shelter.name || '',
  location: shelter.location || '',
  unionCouncil: shelter.unionCouncil || shelter.uc_name || '',
  district: shelter.district || '',
  contactNumber: shelter.contactNumber || shelter.contact_number || '',
  capacity: Number(shelter.capacity || 0),
  occupied: Number(shelter.occupied || 0),
  status: shelter.status || 'Available',
  facilities: facilitiesArrayToObject(shelter.facilities),
  updated_at: shelter.updated_at
});

const ShelterManagementPage = ({ user, onBackToDashboard, onLogout }) => {
  const [selectedUC, setSelectedUC] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('48');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shelters, setShelters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShelterId, setEditingShelterId] = useState(null);
  const [formData, setFormData] = useState(emptyShelterForm);
  const [loadingShelters, setLoadingShelters] = useState(false);
  const [savingShelter, setSavingShelter] = useState(false);
  const [deletingShelterId, setDeletingShelterId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const availableShelters = shelters.filter((shelter) => shelter.status === 'Available').length;
  const fullShelters = shelters.filter((shelter) => shelter.status === 'Full').length;
  const totalCapacity = shelters.reduce((total, shelter) => total + Number(shelter.capacity || 0), 0);
  const totalOccupied = shelters.reduce((total, shelter) => total + Number(shelter.occupied || 0), 0);

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

  const loadShelters = async () => {
    setLoadingShelters(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/shelters`, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Could not load shelters. Status: ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.shelters)
          ? data.shelters
          : [];

      setShelters(list.map(normalizeShelterFromBackend));
    } catch (error) {
      console.error('Shelter load error:', error);
      setErrorMessage('Unable to load shelters from backend.');
    } finally {
      setLoadingShelters(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const openForm = (shelter = null) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (shelter) {
      setEditingShelterId(shelter.id);
      setFormData({
        name: shelter.name,
        location: shelter.location,
        unionCouncil: shelter.unionCouncil ?? '',
        district: shelter.district ?? '',
        contactNumber: shelter.contactNumber ?? '',
        capacity: String(shelter.capacity),
        occupied: String(shelter.occupied ?? 0),
        status: shelter.status,
        facilities: { ...shelter.facilities }
      });
    } else {
      setEditingShelterId(null);
      setFormData(emptyShelterForm);
    }

    setIsModalOpen(true);
  };

  const handleDeleteShelter = async (shelter) => {
    if (!shelter) return;

    const confirmed = window.confirm(
      `Delete "${shelter.name}"? This shelter will no longer be visible to citizens.`
    );
    if (!confirmed) return;

    const token = getAuthToken();
    if (!token) {
      setErrorMessage('Authority token missing. Please login again.');
      return;
    }

    setDeletingShelterId(shelter.id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/shelters/${shelter.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Delete failed. Status: ${response.status}`);
      }

      setSuccessMessage('Shelter deleted successfully.');
      await loadShelters();
    } catch (error) {
      console.error('Shelter delete error:', error);
      setErrorMessage(error.message || 'Unable to delete shelter.');
    } finally {
      setDeletingShelterId(null);
    }
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingShelterId(null);
    setFormData(emptyShelterForm);
  };

  const scrollToShelterTable = () => {
    const node = document.getElementById('shelter-table-section');
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    node.classList.add('shelter-table-card--flash');
    window.setTimeout(() => node.classList.remove('shelter-table-card--flash'), 1400);
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

  const buildBackendPayload = () => {
    const parsedCapacity = Number(formData.capacity);
    const parsedOccupied = Number(formData.occupied || 0);

    if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
      throw new Error('Capacity must be greater than 0.');
    }

    const normalizedOccupied =
      formData.status === 'Full'
        ? parsedCapacity
        : Math.min(Math.max(parsedOccupied, 0), parsedCapacity);

    return {
      name: formData.name.trim(),
      location: formData.location.trim(),
      district: formData.district.trim(),
      contact_number: formData.contactNumber.trim(),
      capacity: parsedCapacity,
      occupied: normalizedOccupied,
      status: formData.status,
      facilities: facilitiesObjectToArray(formData.facilities),
      uc_id: null
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = getAuthToken();
    if (!token) {
      setErrorMessage('Authority token missing. Please login again.');
      return;
    }

    setSavingShelter(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = buildBackendPayload();

      const isEditing = Boolean(editingShelterId);
      const url = isEditing
        ? `${API_BASE_URL}/api/shelters/${editingShelterId}`
        : `${API_BASE_URL}/api/shelters/add`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Save failed. Status: ${response.status}`);
      }

      setSuccessMessage(isEditing ? 'Shelter updated successfully.' : 'Shelter added successfully.');
      closeForm();
      await loadShelters();
    } catch (error) {
      console.error('Shelter save error:', error);
      setErrorMessage(error.message || 'Unable to save shelter.');
    } finally {
      setSavingShelter(false);
    }
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
              onUpdate={scrollToShelterTable}
            />

            <section className="shelter-content-shell">
              <div className="main-header shelter-management-header">
                <p className="main-subtitle">Add, update, and manage emergency shelters shown to citizens.</p>
              </div>

              {errorMessage && (
                <div className="shelter-feedback shelter-feedback--error">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="shelter-feedback shelter-feedback--success">
                  {successMessage}
                </div>
              )}

              <section className="shelter-summary-row" id="shelter-summary" aria-label="Shelter summary">
                <div className="summary-card">
                  <span className="summary-label">Total Shelters</span>
                  <strong>{loadingShelters ? '...' : shelters.length}</strong>
                </div>
                <div className="summary-card summary-card--available">
                  <span className="summary-label">Available</span>
                  <strong>{loadingShelters ? '...' : availableShelters}</strong>
                </div>
                <div className="summary-card summary-card--full">
                  <span className="summary-label">Full</span>
                  <strong>{loadingShelters ? '...' : fullShelters}</strong>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Total Capacity</span>
                  <strong>{loadingShelters ? '...' : totalCapacity}</strong>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Total Occupied</span>
                  <strong>{loadingShelters ? '...' : totalOccupied}</strong>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Utilization</span>
                  <strong>{totalCapacity ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'}</strong>
                </div>
              </section>

              {loadingShelters ? (
                <div className="shelter-loading">Loading shelters from backend...</div>
              ) : (
                <ShelterTable
                  shelters={shelters}
                  facilityLabels={facilityLabels}
                  onEdit={openForm}
                  onDelete={handleDeleteShelter}
                  deletingShelterId={deletingShelterId}
                />
              )}
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
                  <span>Location / Address</span>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(event) => handleFieldChange('location', event.target.value)}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Union Council</span>
                  <input
                    type="text"
                    value={formData.unionCouncil}
                    onChange={(event) => handleFieldChange('unionCouncil', event.target.value)}
                    placeholder="Optional display field"
                  />
                </label>

                <label className="form-field">
                  <span>District</span>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(event) => handleFieldChange('district', event.target.value)}
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
                  <span>Contact Number</span>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(event) => handleFieldChange('contactNumber', event.target.value)}
                    placeholder="Enter contact number"
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
                    <option value="Inactive">Inactive</option>
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
                <button type="button" className="modal-secondary-btn" onClick={closeForm} disabled={savingShelter}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary-btn" disabled={savingShelter}>
                  {savingShelter ? 'Saving...' : 'Save Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterManagementPage;