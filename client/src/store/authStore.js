import { create } from "zustand";

const storedToken = localStorage.getItem("token");
const storedRole = localStorage.getItem("role");

const useAuthStore = create((set) => ({
  mode: "login",
  role: storedRole === "customer" ? "customer" : "agent",
  token: storedToken,
  loading: false,
  error: "",

  toggleMode: () =>
    set((state) => ({
      mode: state.mode === "login" ? "signup" : "login",
      error: "",
    })),

  toggleRole: () =>
    set((state) => ({
      role: state.role === "agent" ? "customer" : "agent",
      error: "",
    })),

  setMode: (mode) => set({ mode, error: "" }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setAuth: ({ token, role }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    set({ token, role, error: "" });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    set({ token: null, error: "" });
  },

  isAuthenticated: () => Boolean(localStorage.getItem("token")),
}));

export default useAuthStore;
