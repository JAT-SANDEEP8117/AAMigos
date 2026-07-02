import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPendingRequests,
  getOngoingRequests,
  getAllAssignedRequests,
} from "../../services/api";
import OrderCard from "../../components/dashboard/OrderCard";

export default function AgentHome() {
  const [stats, setStats] = useState({ pending: 0, ongoing: 0, assigned: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [pending, ongoing, assigned] = await Promise.all([
          getPendingRequests(),
          getOngoingRequests(),
          getAllAssignedRequests(),
        ]);
        setStats({
          pending: pending.length,
          ongoing: ongoing.length,
          assigned: assigned.length,
        });
        setRecent(ongoing.slice(0, 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="dash-loading">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="dash-page-title">Agent Dashboard</h1>
      <p className="dash-page-subtitle">Manage pickup requests and repair lifecycle updates.</p>
      {error && <p className="dash-error">{error}</p>}

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat__value">{stats.pending}</div>
          <div className="dash-stat__label">Pending Requests</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats.ongoing}</div>
          <div className="dash-stat__label">Ongoing</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats.assigned}</div>
          <div className="dash-stat__label">Total Assigned</div>
        </div>
      </div>

      <div className="dash-actions" style={{ marginBottom: 28 }}>
        <Link to="/agent/pending" className="dash-btn dash-btn--primary">
          View Pending Requests
        </Link>
        <Link to="/agent/ongoing" className="dash-btn dash-btn--ghost">
          Ongoing Jobs
        </Link>
      </div>

      <h2 className="dash-detail-card__title">Active Jobs</h2>
      {recent.length === 0 ? (
        <div className="dash-empty">
          <p className="dash-empty__title">No active jobs</p>
          <p className="dash-empty__text">Approve pending requests to start managing repairs.</p>
          <Link to="/agent/pending" className="dash-btn dash-btn--primary">
            View Pending
          </Link>
        </div>
      ) : (
        <div className="dash-list">
          {recent.map((order) => (
            <OrderCard key={order._id} order={order} basePath="/agent/orders" />
          ))}
        </div>
      )}
    </div>
  );
}
