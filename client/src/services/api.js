import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  timeout: 60000,
});