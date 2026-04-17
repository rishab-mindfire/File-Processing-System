import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});
// add interceptor to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('File-System');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error),
);
//get projects
