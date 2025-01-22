import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchHealthCheck = async () => {
  const { data } = await api.get('/health');
  return data;
};

export default api;