import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://retro-portal-api.onrender.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
