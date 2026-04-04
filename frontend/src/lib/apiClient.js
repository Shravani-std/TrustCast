import axios from "axios";

// Use relative URLs in dev so Vite proxy handles forwarding to the backend.
// In production, set VITE_API_BASE_URL to your deployed backend URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const authStorage = {
  getToken: () => localStorage.getItem("trustcast_token"),
  setToken: (token) => localStorage.setItem("trustcast_token", token),
  clearToken: () => localStorage.removeItem("trustcast_token"),
};

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});