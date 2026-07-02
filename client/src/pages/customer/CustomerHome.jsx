import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, getActiveOrders, getPendingOrders } from "../../services/api";
import OrderCard from "../../components/dashboard/OrderCard";

export default function CustomerHome() {
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [all, pending, active] = await Promise.all([
          getAllOrders(),
          getPendingOrders(),
          getActiveOrders(),
        ]);
        setStats({
          total: all.length,
          pending: pending.length,
          active: active.length,
        });
        setRecent(all.slice(0, 3));
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
      <h1 className="dash-page-title">Dashboard</h1>
      <p className="dash-page-subtitle">Schedule repairs and track your device pickup lifecycle.</p>
      {error && <p className="dash-error">{error}</p>}

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat__value">{stats.total}</div>
          <div className="dash-stat__label">Total Orders</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats.pending}</div>
          <div className="dash-stat__label">Pending</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{stats.active}</div>
          <div className="dash-stat__label">Active</div>
        </div>
      </div>

      <div className="dash-actions" style={{ marginBottom: 28 }}>
        <Link to="/customer/orders/new" className="dash-btn dash-btn--primary">
          + Schedule New Repair
        </Link>
        <Link to="/customer/orders" className="dash-btn dash-btn--ghost">
          View All Orders
        </Link>
      </div>

      <h2 className="dash-detail-card__title">Recent Orders</h2>
      {recent.length === 0 ? (
        <div className="dash-empty">
          <p className="dash-empty__title">No orders yet</p>
          <p className="dash-empty__text">Schedule your first device repair pickup to get started.</p>
          <Link to="/customer/orders/new" className="dash-btn dash-btn--primary">
            Schedule Repair
          </Link>
        </div>
      ) : (
        <div className="dash-list">
          {recent.map((order) => (
            <OrderCard key={order._id} order={order} basePath="/customer/orders" />
          ))}
        </div>
      )}
    </div>
  );
}
