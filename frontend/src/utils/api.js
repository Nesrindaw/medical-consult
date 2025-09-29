import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// إضافة التوكن تلقائيًا إذا موجود
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// التعامل مع الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // لو التوكن غير صالح → نرجع المستخدم للـ Login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
