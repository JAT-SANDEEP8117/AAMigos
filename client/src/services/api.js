const API_BASE = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(data.message || data.error || "Request failed", response.status);
  }

  return data;
}

export async function login(role, email, password) {
  const path =
    role === "admin"
      ? "/auth/admin/login"
      : role === "agent"
        ? "/auth/agent/login"
        : "/auth/user/login";
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(role, email, password) {
  if (role === "admin") {
    throw new ApiError("Admin accounts are created from server configuration", 400);
  }
  const path = role === "agent" ? "/auth/agent/register" : "/auth/user/register";
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchProfile(role) {
  const path =
    role === "admin"
      ? "/admin/getDetails"
      : role === "agent"
        ? "/agent/getDetails"
        : "/customer/getDetails";
  return apiRequest(path);
}

export function isProfileComplete(profile) {
  if (localStorage.getItem("role") === "admin") {
    return Boolean(profile?.email);
  }

  const base =
    profile?.name &&
    profile?.phone &&
    profile?.address?.dno &&
    profile?.address?.street &&
    profile?.address?.city &&
    profile?.address?.pincode &&
    profile?.profilePicture;

  if (localStorage.getItem("role") === "agent") {
    return Boolean(base && profile?.panCard && profile?.aadharNumber);
  }
  return Boolean(base);
}

export async function submitProfile(role, onboardingData) {
  const formData = new FormData();
  formData.append("profilePic", onboardingData.avatar);
  formData.append("name", onboardingData.name);
  formData.append("phone", onboardingData.contact);
  formData.append("dno", onboardingData.doorNo);
  formData.append("street", onboardingData.street);
  formData.append("city", onboardingData.city);
  formData.append("pincode", onboardingData.pincode);

  if (role === "agent") {
    formData.append("panCard", onboardingData.pan);
    formData.append("adhaarNumber", onboardingData.aadhaar);
  }

  const path = role === "agent" ? "/setup/agent/setupProfile" : "/setup/user/setupProfile";
  return apiRequest(path, { method: "POST", body: formData });
}

// ——— Customer ———

export const getCategories = () => apiRequest("/request/categories");

export const getCompanies = (category) => apiRequest(`/request/companies/${encodeURIComponent(category)}`);

export const getModels = (category, company) =>
  apiRequest(`/request/models/${encodeURIComponent(category)}/${encodeURIComponent(company)}`);

export const createOrder = (formData) =>
  apiRequest("/request/newOrder", { method: "POST", body: formData });

export const getAllOrders = () => apiRequest("/customer/allOrders");

export const getPendingOrders = () => apiRequest("/customer/pendingOrders");

export const getActiveOrders = () => apiRequest("/customer/activeOrders");

export const trackCustomerOrder = (reqId) => apiRequest(`/customer/trackOrder/${reqId}`);

export const cancelOrder = (reqId) =>
  apiRequest(`/customer/cancelOrder/${reqId}`, { method: "POST" });

export const getOrderPackages = (reqId) => apiRequest(`/customer/getPackages/${reqId}`);

export const selectPackage = (reqId, packageName) =>
  apiRequest(`/customer/updatePackage/${reqId}/${packageName}`, { method: "POST" });

// ——— Agent ———

export const getPendingRequests = () => apiRequest("/agent/pendingRequests");

export const approveRequest = (reqId) =>
  apiRequest(`/agent/approveRequest/${reqId}`, { method: "POST" });

export const getOngoingRequests = () => apiRequest("/agent/onGoingRequests");

export const getAllAssignedRequests = () => apiRequest("/agent/allAssignedRequests");

export const trackAgentOrder = (reqId) => apiRequest(`/agent/trackOrder/${reqId}`);

export const updateOrderStatus = (reqId, status) =>
  apiRequest(`/agent/updateStatus/${reqId}/update/${status}`, { method: "POST" });

export const setOrderPackages = (reqId, packages) =>
  apiRequest(`/agent/packages/${reqId}`, {
    method: "POST",
    body: JSON.stringify(packages),
  });

export const enableFreeService = (reqId) =>
  apiRequest(`/agent/freeService/${reqId}`, { method: "POST" });

// Admin

export const getAdminStats = () => apiRequest("/admin/stats");

export const getAdminAgents = () => apiRequest("/admin/agents");

export const getAdminServiceCenters = () => apiRequest("/admin/service-centers");

export const createAdminServiceCenter = (payload) =>
  apiRequest("/admin/service-centers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAdminCatalog = () => apiRequest("/admin/catalog");

export const createAdminCompany = (payload) =>
  apiRequest("/admin/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const createAdminModel = (payload) =>
  apiRequest("/admin/models", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// Chatbot

export const sendChatbotMessage = (message, history) =>
  apiRequest("/chatbot/message", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
