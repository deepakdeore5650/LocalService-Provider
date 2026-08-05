import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089',
})

// Add an interceptor to include the JWT token on every request if it exists
api.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      // ignore JSON parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api
