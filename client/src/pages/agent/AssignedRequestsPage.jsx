import { useEffect, useState } from "react";
import { getAllAssignedRequests } from "../../services/api";
import OrderCard from "../../components/dashboard/OrderCard";

export default function AssignedRequestsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllAssignedRequests()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="dash-loading">Loading assigned orders...</p>;

  return (
    <div>
      <h1 className="dash-page-title">All Assigned Orders</h1>
      <p className="dash-page-subtitle">Complete history of orders assigned to you.</p>
      {error && <p className="dash-error">{error}</p>}

      {orders.length === 0 ? (
        <div className="dash-empty">
          <p className="dash-empty__title">No assigned orders</p>
          <p className="dash-empty__text">Orders you approve will be listed here.</p>
        </div>
      ) : (
        <div className="dash-list">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} basePath="/agent/orders" />
          ))}
        </div>
      )}
    </div>
  );
}
