import axios from 'axios';

// https://retro-portal-api.onrender.com

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
