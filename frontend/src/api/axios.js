import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "civicfix_token"
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // Let Axios/browser automatically set
    // multipart/form-data with the correct boundary
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;