import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, getActiveOrders, getPendingOrders } from "../../services/api";
import OrderCard from "../../components/dashboard/OrderCard";

const TABS = [
  { key: "all", label: "All Orders", fetch: getAllOrders },
  { key: "pending", label: "Pending", fetch: getPendingOrders },
  { key: "active", label: "Active", fetch: getActiveOrders },
];

export default function OrdersPage() {
  const [tab, setTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const current = TABS.find((t) => t.key === tab);
        const data = await current.fetch();
        if (active) setOrders(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [tab]);

  return (
    <div>
      <h1 className="dash-page-title">My Orders</h1>
      <p className="dash-page-subtitle">Track all your repair requests in one place.</p>

      <div className="dash-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`dash-tab${tab === t.key ? " dash-tab--active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="dash-error">{error}</p>}
      {loading && <p className="dash-loading">Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <div className="dash-empty">
          <p className="dash-empty__title">No orders found</p>
          <p className="dash-empty__text">You don&apos;t have any {tab !== "all" ? tab : ""} orders yet.</p>
          <Link to="/customer/orders/new" className="dash-btn dash-btn--primary">
            Schedule Repair
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="dash-list">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} basePath="/customer/orders" />
          ))}
        </div>
      )}
    </div>
  );
}
