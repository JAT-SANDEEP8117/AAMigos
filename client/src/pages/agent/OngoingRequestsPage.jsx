import { useEffect, useState } from "react";
import { getOngoingRequests } from "../../services/api";
import OrderCard from "../../components/dashboard/OrderCard";

export default function OngoingRequestsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOngoingRequests()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="dash-loading">Loading ongoing jobs...</p>;

  return (
    <div>
      <h1 className="dash-page-title">Ongoing Jobs</h1>
      <p className="dash-page-subtitle">Repairs currently in progress under your assignment.</p>
      {error && <p className="dash-error">{error}</p>}

      {orders.length === 0 ? (
        <div className="dash-empty">
          <p className="dash-empty__title">No ongoing jobs</p>
          <p className="dash-empty__text">Approved requests will show up here.</p>
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
