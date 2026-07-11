import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { fetchProfile, isProfileComplete } from "../services/api";

const PROFILE_TIMEOUT_MS = 8000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms),
    ),
  ]);
}

export function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(!token);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    const role = localStorage.getItem("role") || "customer";

    withTimeout(fetchProfile(role), PROFILE_TIMEOUT_MS)
      .then(() => {
        if (!active) return;
        setRedirectTo(`/${role}`);
      })
      .catch(() => {
        if (!active) return;
        logout();
        setReady(true);
      });

    return () => {
      active = false;
    };
  }, [token, logout]);

  if (!token) return children;
  if (redirectTo) return <Navigate to={redirectTo} replace />;
  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8b949e",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  return children;
}

export function OnboardingRoute({ children }) {
  const { role } = useParams();
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== "customer" && role !== "agent") {
    return <Navigate to="/" replace />;
  }

  const storedRole = localStorage.getItem("role");
  if (storedRole && storedRole !== role) {
    return <Navigate to={`/${storedRole}/onboarding/profile`} replace />;
  }

  return children;
}

export function CustomerOnlyRoute({ children }) {
  const { role } = useParams();
  if (role === "customer") {
    return <Navigate to={`/${role}/onboarding/address`} replace />;
  }
  return children;
}

export function RoleRoute({ role: requiredRole, children }) {
  const storedRole = localStorage.getItem("role");
  if (storedRole !== requiredRole) {
    return <Navigate to={`/${storedRole || "customer"}`} replace />;
  }
  return children;
}

export function ProfileGuard({ children }) {
  const role = localStorage.getItem("role") || "customer";
  const logout = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    let active = true;

    withTimeout(fetchProfile(role), PROFILE_TIMEOUT_MS)
      .then((profile) => {
        if (!active) return;
        if (!isProfileComplete(profile)) {
          setRedirect(`/${role}/onboarding/profile`);
        } else {
          setReady(true);
        }
      })
      .catch(() => {
        if (!active) return;
        logout();
        setRedirect("/");
      });

    return () => {
      active = false;
    };
  }, [role, logout]);

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e1117",
          color: "#8b949e",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }
  return children;
}

export function RoleRedirect() {
  const role = localStorage.getItem("role") || "customer";
  return <Navigate to={`/${role}`} replace />;
}
