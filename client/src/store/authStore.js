import { create } from "zustand";

const storedToken = localStorage.getItem("token");
const storedRole = localStorage.getItem("role");

const useAuthStore = create((set) => ({
  mode: "login",
  role: ["customer", "agent", "admin"].includes(storedRole) ? storedRole : "agent",
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
      role: state.role === "agent" ? "customer" : state.role === "customer" ? "admin" : "agent",
      mode: state.role === "customer" ? "login" : state.mode,
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
