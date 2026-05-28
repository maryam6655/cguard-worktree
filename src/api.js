const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  login:             `${BASE_URL}/login`,
  forecast:          `${BASE_URL}/forecast`,
  allUCs:            `${BASE_URL}/all-ucs`,
  shelters:          `${BASE_URL}/shelters`,
  addShelter:        `${BASE_URL}/shelters/add`,
  updateShelter:     (id) => `${BASE_URL}/shelters/${id}`,
  deleteShelter:     (id) => `${BASE_URL}/shelters/${id}`,
  emergencyContacts: `${BASE_URL}/emergency-contacts`,
  contact:           `${BASE_URL}/contact`,
  submitReport:      `${BASE_URL}/submit-report`,
  analytics:         (station) => `${BASE_URL}/analytics/${station}`,
};