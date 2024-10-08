import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const makePostRequest = async (endpoint, data = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
      withCredentials: true // This ensures cookies are sent with the request
    });
    return response;
  } catch (error) {
    console.error('Error making POST request:', error);
    throw error;
  }
};