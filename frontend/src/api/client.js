export const API_BASE = import.meta.env.VITE_API_BASE || "/api";
export const BACKEND_URL = API_BASE.startsWith("http") ? API_BASE.replace(/\/api\/?$/, "") : "";

export const getAvatarUrl = (avatarUrl, name, theme) => {
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light');
  const bg = isLight ? "f5efeb" : "690e1f";
  const fg = isLight ? "690e1f" : "f1a32a";

  if (!avatarUrl) {
    const encoded = encodeURIComponent(name || "Instructor");
    return `https://ui-avatars.com/api/?name=${encoded}&background=${bg}&color=${fg}&size=150&font-size=0.33&bold=true`;
  }
  if (avatarUrl.includes("ui-avatars.com")) {
    return avatarUrl
      .replace(/background=[A-Fa-f0-9]+/i, `background=${bg}`)
      .replace(/color=[A-Fa-f0-9]+/i, `color=${fg}`);
  }
  if (avatarUrl.startsWith("/uploads")) {
    return `${BACKEND_URL}${avatarUrl}`;
  }
  return avatarUrl;
};

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  const headers = {
    ...(options.headers || {}),
  };

  // Only set JSON Content-Type if body is not FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (!endpoint.includes("/auth/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-expired"));
    }
  }

  return response;
};
