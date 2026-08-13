import axios from 'axios';

// Ye ASP.NET backend ka URL hai
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7168/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Har request ke saath JWT token automatically bhej dega (agar login hai)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Agar FormData bhej rahe hain (file upload ke liye, jaise Signup), to
  // Content-Type set NAHI karte - axios khud sahi boundary ke saath
  // multipart/form-data set kar dega. Baaki normal requests JSON use karengi.
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Agar token expire ho jaye (401 error), to login page pe bhej dega
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;