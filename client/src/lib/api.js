import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 120_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/auth/")) {
        window.dispatchEvent(new CustomEvent("sabisafe:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export function errorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  const base = data?.error?.message || error?.message || fallback;
  const details = data?.error?.details;
  if (Array.isArray(details) && details.length) {
    return `${base} ${details.map((item) => item.message).join(" ")}`.trim();
  }
  return base;
}

export function errorCode(error) {
  return error?.response?.data?.error?.code || null;
}

export const endpoints = {
  config: () => api.get("/config"),
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  updateProfile: (payload) => api.patch("/users/me", payload),
  changePassword: (payload) => api.post("/users/me/password", payload),
  dashboard: () => api.get("/dashboard"),
  lessons: () => api.get("/lessons"),
  lesson: (slug) => api.get(`/lessons/${slug}`),
  submitQuiz: (slug, answers) => api.post(`/lessons/${slug}/quiz`, { answers }),
  aiStatus: () => api.get("/ai/status"),
  attestation: (fresh = false) => api.get(`/ai/attestation${fresh ? "?fresh=1" : ""}`),
  chat: (payload) => api.post("/ai/chat", payload),
  conversations: () => api.get("/ai/conversations"),
  conversation: (id) => api.get(`/ai/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/ai/conversations/${id}`),
  wallet: () => api.get("/wallet"),
  connectWallet: (accountId) => api.post("/wallet/connect", { accountId }),
  disconnectWallet: () => api.delete("/wallet"),
  walletActivity: () => api.get("/wallet/activity"),
  transactions: () => api.get("/transactions"),
  verifyTransaction: (txHash) => api.post("/transactions/verify", { txHash }),
  refreshTransaction: (hash) => api.post(`/transactions/${hash}/refresh`),
  contacts: () => api.get("/contacts"),
  createContact: (payload) => api.post("/contacts", payload),
  updateContact: (id, payload) => api.patch(`/contacts/${id}`, payload),
  deleteContact: (id) => api.delete(`/contacts/${id}`),
  refreshRegistry: (id) => api.post(`/contacts/${id}/verify-registry`),
  confirmOnchain: (id, txHash) => api.post(`/contacts/${id}/confirm-onchain`, { txHash }),
  receiving: () => api.get("/receiving"),
  createReceiving: (payload) => api.post("/receiving", payload),
  updateReceiving: (id, status) => api.patch(`/receiving/${id}`, { status }),
  publicReceiving: (id) => api.get(`/receiving/public/${id}`),
  safetyTips: () => api.get("/safety/tips"),
  preflight: (payload) => api.post("/safety/preflight", payload),
  scanMessage: (message) => api.post("/safety/scan-message", { message }),
  practice: () => api.get("/practice"),
  completeExercise: (key) => api.post(`/practice/${key}/complete`),
};
