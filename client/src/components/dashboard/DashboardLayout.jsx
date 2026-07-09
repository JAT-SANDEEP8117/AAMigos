import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { fetchProfile } from "../../services/api";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.svg";
import ChatbotWidget from "./ChatbotWidget";
import "./DashboardLayout.css";

const CUSTOMER_LINKS = [
  { to: "/customer", label: "Overview", end: true },
  { to: "/customer/orders", label: "My Orders" },
  { to: "/customer/orders/new", label: "New Repair" },
];

const AGENT_LINKS = [
  { to: "/agent", label: "Overview", end: true },
  { to: "/agent/pending", label: "Pending" },
  { to: "/agent/ongoing", label: "Ongoing" },
  { to: "/agent/assigned", label: "All Assigned" },
];

const ADMIN_LINKS = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/agents", label: "Agents" },
  { to: "/admin/service-centers", label: "Service Centers" },
  { to: "/admin/catalog", label: "Catalog" },
];

export default function DashboardLayout({ role }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const links = role === "admin" ? ADMIN_LINKS : role === "agent" ? AGENT_LINKS : CUSTOMER_LINKS;

  useEffect(() => {
    fetchProfile(role)
      .then(setProfile)
      .catch(() => {});
  }, [role]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dash-layout">
      <header className="dash-header">
        <div className="dash-header__brand">
          <img src={logo} alt="AAMigos" className="dash-header__logo" />
          <div>
            <p className="dash-header__title">AAMigos</p>
            <p className="dash-header__role">
              {role === "admin" ? "Admin Portal" : role === "agent" ? "Agent Portal" : "Customer Portal"}
            </p>
          </div>
        </div>
        <div className="dash-header__user">
          {profile?.profilePicture && (
            <img src={profile.profilePicture} alt="" className="dash-header__avatar" />
          )}
          <span className="dash-header__name">{profile?.name || "User"}</span>
          <button type="button" className="dash-header__logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      <nav className="dash-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `dash-nav__link${isActive ? " dash-nav__link--active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="dash-main">
        <Outlet context={{ profile, role }} />
      </main>
      <ChatbotWidget />
    </div>
  );
}
