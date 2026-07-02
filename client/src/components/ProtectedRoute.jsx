import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { fetchProfile, isProfileComplete } from "../services/api";

export function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  if (token) {
    const role = localStorage.getItem("role") || "customer";
    return <Navigate to={`/${role}`} replace />;
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
  const [ready, setReady] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    fetchProfile(role)
      .then((profile) => {
        if (!isProfileComplete(profile)) {
          setRedirect(`/${role}/onboarding/profile`);
        } else {
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, [role]);

  if (redirect) return <Navigate to={redirect} replace />;
  if (!ready) {
    return (
      <div className="dash-layout" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="dash-loading">Loading...</p>
      </div>
    );
  }
  return children;
}

export function RoleRedirect() {
  const role = localStorage.getItem("role") || "customer";
  return <Navigate to={`/${role}`} replace />;
}
