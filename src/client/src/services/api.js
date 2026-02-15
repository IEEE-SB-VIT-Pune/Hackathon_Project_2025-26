import axios from "axios";

/* ================= 1. UNIFIED AXIOS INSTANCE ================= */
// ✅ FIX: Added 'export' here so 'import { API }' works in Login.jsx
export const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

/* ================= 2. AUTH COMPATIBILITY LAYER ================= */
export const getAuthToken = () => {
  const profile = localStorage.getItem("profile");
  if (profile) {
    const parsed = JSON.parse(profile);
    return parsed.token;
  }
  return localStorage.getItem("authToken");
};

export const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

/* ================= 3. AUTOMATIC INTERCEPTOR ================= */
API.interceptors.request.use((req) => {
  const token = getAuthToken();
  if (token && token !== "dummy-judge-token") {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/* ================= AUTH APIs ================= */
export const signIn = (formData) => API.post("/users/login", formData);
export const signUp = (formData) => API.post("/users/register", formData);
export const getMe = () => API.get("/users/me");

/* ================= ADMIN APIs ================= */
export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAdminHackathons = () => API.get("/admin/hackathons");
export const createHackathon = (data) => API.post("/hackathons", data);
export const updateHackathon = (id, data) => API.patch(`/hackathons/${id}`, data);
export const updateHackathonStatus = (id, status) => API.patch(`/hackathons/${id}/status`, { status });

/* ================= JUDGE APIs ================= */
export const getAllJudges = () => API.get("/admin/judges");
export const assignJudgesToHackathon = (hackathonId, judgeIds) =>
  API.post(`/admin/hackathons/${hackathonId}/judges`, { judgeIds });

/* ================= PARTICIPANT APIs ================= */
export const getHackathonById = (id) => API.get(`/hackathons/${id}`);
export const registerTeam = (data) => API.post("/teams", data);
export const getHackathonTeams = (hackathonId) => API.get(`/hackathons/${hackathonId}/teams`);
export const searchUsers = (query) => API.get(`/users/search?query=${query}`);

/* ================= TEAM & JOIN APIs ================= */
export const requestJoinTeam = (teamId) => API.post(`/teams/${teamId}/join`);
export const respondToRequest = (teamId, userId, status) => API.patch(`/teams/${teamId}/member/${userId}`, { status });
export const getMyTeamInvites = () => API.get("/teams/my-invites");
export const replyToTeamInvite = (teamId, status) => API.patch(`/teams/${teamId}/respond`, { status });

/* ================= ERROR HANDLER ================= */
export const handleApiError = (error) => {
  if (error.response) {
    return {
      success: false,
      status: error.response.status,
      message: error.response.data?.message || 'Server error',
      data: error.response.data,
    };
  }
  if (error.request) {
    return {
      success: false,
      status: 0,
      message: 'Network error. Server not reachable.',
      data: null,
    };
  }
  return {
    success: false,
    status: 0,
    message: error.message || 'Unexpected error',
    data: null,
  };
};

// Default export is also kept for compatibility
export default API;