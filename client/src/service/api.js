import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const ROOT_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiRoot = axios.create({
  baseURL: ROOT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiPublic = axios.create({
  baseURL: ROOT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const applyInterceptors = (client) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Sending request with token:', token.substring(0, 20) + '...');
      } else {
        console.warn('No auth token found in localStorage!');
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
        console.error('API Error:', errorMessage);
        error.message = errorMessage;
        return Promise.reject(error);
      } else if (error.request) {
        console.error('Network Error:', error.message);
        error.message = 'Network error. Please check your connection.';
        return Promise.reject(error);
      } else {
        console.error('Error:', error.message);
        return Promise.reject(error);
      }
    }
  );
};

applyInterceptors(api);
applyInterceptors(apiRoot);

export { apiRoot, apiPublic };
export default api;
