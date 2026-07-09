import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../services/api";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="dash-loading">Loading admin dashboard...</p>;

  const statusRows = stats?.byStatus || [];

  return (
    <div>
      <h1 className="dash-page-title">Admin Dashboard</h1>
      <p className="dash-page-subtitle">Monitor platform activity and maintain repair catalog data.</p>
      {error && <p className="dash-error">{error}</p>}

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat__value">{stats?.customers || 0}</div>
          <div className="dash-stat__label">Customers</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats?.agents || 0}</div>
          <div className="dash-stat__label">Agents</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats?.requests || 0}</div>
          <div className="dash-stat__label">Requests</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats?.serviceCenters || 0}</div>
          <div className="dash-stat__label">Service Centers</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats?.companies || 0}</div>
          <div className="dash-stat__label">Companies</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats?.models || 0}</div>
          <div className="dash-stat__label">Device Models</div>
        </div>
      </div>

      <div className="dash-actions" style={{ marginBottom: 28 }}>
        <Link to="/admin/catalog" className="dash-btn dash-btn--primary">
          Manage Catalog
        </Link>
        <Link to="/admin/service-centers" className="dash-btn dash-btn--ghost">
          Service Centers
        </Link>
      </div>

      <div className="dash-detail-card">
        <h2 className="dash-detail-card__title">Request Status Summary</h2>
        {statusRows.length === 0 ? (
          <p className="dash-page-subtitle" style={{ marginBottom: 0 }}>No repair requests yet.</p>
        ) : (
          statusRows.map((row) => (
            <div key={row._id} className="dash-detail-row">
              <span className="dash-detail-row__label">{row._id}</span>
              <span>{row.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
