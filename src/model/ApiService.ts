import axios from 'axios';
import { API_BASE_URL } from '../config';

export const apiService = {
  
  async fetchGameById(id: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/games/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching game by ID:', error.response?.data || error.message);
      throw new Error('Failed to fetch game');
    }
  },
};
