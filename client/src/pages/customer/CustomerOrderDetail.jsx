import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  trackCustomerOrder,
  cancelOrder,
  getOrderPackages,
  selectPackage,
} from "../../services/api";
import StatusBadge from "../../components/dashboard/StatusBadge";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  formatDate,
  getDeviceName,
} from "../../utils/orderStatus";

export default function CustomerOrderDetail() {
  const { reqId } = useParams();
  const [order, setOrder] = useState(null);
  const [packages, setPackages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState("");

  const loadOrder = useCallback(async () => {
    setError("");
    try {
      const data = await trackCustomerOrder(reqId);
      setOrder(data);
      if (["FreeApproval", "InRepair", "Delivering", "Paid"].includes(data.status)) {
        try {
          const pkgData = await getOrderPackages(reqId);
          setPackages(pkgData);
        } catch {
          setPackages(null);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reqId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setActionLoading(true);
    try {
      await cancelOrder(reqId);
      await loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectPackage = async (name) => {
    setActionLoading(true);
    setError("");
    try {
      await selectPackage(reqId, name);
      setSelectedPkg(name);
      await loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="dash-loading">Loading order details...</p>;
  if (error && !order) return <p className="dash-error">{error}</p>;
  if (!order) return null;

  const currentIdx = ORDER_STATUSES.indexOf(order.status);
  const canCancel = order.status === "Pending";
  const showPackages = packages?.packages && order.userPackage === "Pending";

  const calcTotal = (items) =>
    items?.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0;

  return (
    <div>
      <Link to="/customer/orders" className="dash-btn dash-btn--ghost" style={{ marginBottom: 20 }}>
        ← Back to Orders
      </Link>

      <h1 className="dash-page-title">{getDeviceName(order)}</h1>
      <p className="dash-page-subtitle">
        Order #{order._id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
      </p>

      {error && <p className="dash-error">{error}</p>}

      <div className="dash-detail-card">
        <div className="dash-detail-row">
          <span className="dash-detail-row__label">Status</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="dash-detail-row">
          <span className="dash-detail-row__label">Issue</span>
          <span>{order.device?.issue || "—"}</span>
        </div>
        <div className="dash-detail-row">
          <span className="dash-detail-row__label">IMEI / Serial</span>
          <span>{order.device?.imeiNumber || "—"}</span>
        </div>
        <div className="dash-detail-row">
          <span className="dash-detail-row__label">Warranty</span>
          <span>{order.device?.warranty ? "Yes" : "No"}</span>
        </div>
        {order.assignedAgent && (
          <div className="dash-detail-row">
            <span className="dash-detail-row__label">Assigned Agent</span>
            <span>{order.assignedAgent.name || "Agent assigned"}</span>
          </div>
        )}
        {order.userPackage && order.userPackage !== "Pending" && (
          <div className="dash-detail-row">
            <span className="dash-detail-row__label">Selected Package</span>
            <span style={{ textTransform: "capitalize" }}>{order.userPackage}</span>
          </div>
        )}
        {order.FreeService && (
          <div className="dash-detail-row">
            <span className="dash-detail-row__label">Free Service</span>
            <span style={{ color: "#3fb950" }}>Approved</span>
          </div>
        )}
      </div>

      <div className="dash-detail-card">
        <h2 className="dash-detail-card__title">Repair Progress</h2>
        <div className="dash-progress">
          {ORDER_STATUSES.filter((s) => s !== "Cancelled").map((status, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = status === order.status;
            if (order.status === "Cancelled") return null;
            return (
              <div
                key={status}
                className={`dash-progress__step${isDone ? " dash-progress__step--done" : ""}${isCurrent ? " dash-progress__step--current" : ""}`}
              >
                <div className="dash-progress__dot">{isDone ? "✓" : idx + 1}</div>
                <span className="dash-progress__label">{STATUS_LABELS[status]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showPackages && (
        <div className="dash-detail-card">
          <h2 className="dash-detail-card__title">Select Repair Package</h2>
          <p className="dash-page-subtitle" style={{ marginBottom: 0 }}>
            Choose a repair package recommended by your agent.
          </p>
          <div className="dash-package-grid">
            {Object.entries(packages.packages).map(([name, items]) => {
              if (!items?.length) return null;
              const total = calcTotal(items);
              return (
                <button
                  key={name}
                  type="button"
                  className={`dash-package${selectedPkg === name || order.userPackage === name ? " dash-package--selected" : ""}`}
                  onClick={() => handleSelectPackage(name)}
                  disabled={actionLoading}
                >
                  <div className="dash-package__name">{name.replace(/([A-Z])/g, " $1").trim()}</div>
                  {items.map((item) => (
                    <div key={item.label} className="dash-package__item">
                      <span>{item.label}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                  <div className="dash-package__total">Total: ₹{total}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {canCancel && (
        <div className="dash-actions">
          <button
            type="button"
            className="dash-btn dash-btn--danger"
            onClick={handleCancel}
            disabled={actionLoading}
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}
