const getBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = "8000";
  
  return `http://${hostname}:${port}`;
};

export const API_BASE_URL = getBaseUrl();
export const API_ENDPOINTS = {
    login: `${BASE_URL}/api/login`,
    health: `${BASE_URL}/api/health`,
    notifications: `${BASE_URL}/api/notifications`,
    invoices: `${BASE_URL}/api/invoices`,
    accounts: `${BASE_URL}/api/accounts`,
    calendar: `${BASE_URL}/api/calendar/events`,
    participants: `${BASE_URL}/api/calendar/participants`,
    // Dynamische URL für Kontendetails
    accountDetails: (code) => `${BASE_URL}/api/accounts/${code}/transactions`,
};