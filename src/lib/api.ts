import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("mrf.token");
    const pousadaId = window.localStorage.getItem("mrf.pousada");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (pousadaId) config.headers["X-Pousada-Id"] = pousadaId;
  }
  return config;
});
