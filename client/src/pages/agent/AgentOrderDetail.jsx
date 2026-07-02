import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  trackAgentOrder,
  updateOrderStatus,
  setOrderPackages,
  enableFreeService,
} from "../../services/api";
import StatusBadge from "../../components/dashboard/StatusBadge";
import {
  AGENT_NEXT_STATUS,
  ORDER_STATUSES,
  STATUS_LABELS,
  formatDate,
  getDeviceName,
} from "../../utils/orderStatus";

const PACKAGE_TIERS = [
  { key: "affordable", label: "Affordable" },
  { key: "goodToHave", label: "Good to Have" },
  { key: "niceToHave", label: "Nice to Have" },
];

function emptyPackageRow() {
  return { label: "", price: "" };
}

export default function AgentOrderDetail() {
  const { reqId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const [pkgForm, setPkgForm] = useState({
    affordable: [emptyPackageRow()],
    goodToHave: [emptyPackageRow()],
    niceToHave: [emptyPackageRow()],
  });

  const loadOrder = async () => {
    setError("");
    try {
      const data = await trackAgentOrder(reqId);
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [reqId]);

  const nextStatus = order ? AGENT_NEXT_STATUS[order.status] : null;

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;
    setActionLoading(true);
    try {
      await updateOrderStatus(reqId, nextStatus);
      await loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreeService = async () => {
    setActionLoading(true);
    try {
      await enableFreeService(reqId);
      await loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const updatePkgItem = (tier, idx, field, value) => {
    setPkgForm((prev) => {
      const updated = { ...prev };
      updated[tier] = [...prev[tier]];
      updated[tier][idx] = { ...updated[tier][idx], [field]: value };
      return updated;
    });
  };

  const addPkgRow = (tier) => {
    setPkgForm((prev) => ({
      ...prev,
      [tier]: [...prev[tier], emptyPackageRow()],
    }));
  };

  const handleSavePackages = async () => {
    setActionLoading(true);
    setError("");
    try {
      const payload = {};
      for (const tier of PACKAGE_TIERS) {
        payload[tier.key] = pkgForm[tier.key]
          .filter((item) => item.label.trim() && item.price)
          .map((item) => ({
            label: item.label.trim(),
            price: Number(item.price),
          }));
      }
      await setOrderPackages(reqId, payload);
      setShowPackages(false);
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
  const canSetPackages = ["PickedUp", "FreeApproval", "InRepair"].includes(order.status);

  return (
    <div>
      <Link to="/agent/ongoing" className="dash-btn dash-btn--ghost" style={{ marginBottom: 20 }}>
        ← Back to Jobs
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
        {order.user && (
          <>
            <div className="dash-detail-row">
              <span className="dash-detail-row__label">Customer</span>
              <span>{order.user.name}</span>
            </div>
            <div className="dash-detail-row">
              <span className="dash-detail-row__label">Phone</span>
              <span>{order.user.phone || "—"}</span>
            </div>
            {order.user.address && (
              <div className="dash-detail-row">
                <span className="dash-detail-row__label">Pickup Address</span>
                <span>
                  {[order.user.address.dno, order.user.address.street, order.user.address.city, order.user.address.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </>
        )}
        {order.FreeService && (
          <div className="dash-detail-row">
            <span className="dash-detail-row__label">Free Service</span>
            <span style={{ color: "#3fb950" }}>Enabled</span>
          </div>
        )}
      </div>

      <div className="dash-detail-card">
        <h2 className="dash-detail-card__title">Repair Progress</h2>
        <div className="dash-progress">
          {ORDER_STATUSES.filter((s) => s !== "Cancelled").map((status, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = status === order.status;
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

      <div className="dash-actions">
        {nextStatus && (
          <button
            type="button"
            className="dash-btn dash-btn--primary"
            onClick={handleAdvanceStatus}
            disabled={actionLoading}
          >
            Mark as {STATUS_LABELS[nextStatus]}
          </button>
        )}
        {order.status === "FreeApproval" && !order.FreeService && (
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            onClick={handleFreeService}
            disabled={actionLoading}
          >
            Approve Free Service
          </button>
        )}
        {canSetPackages && (
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            onClick={() => setShowPackages(!showPackages)}
          >
            {showPackages ? "Hide Packages" : "Set Repair Packages"}
          </button>
        )}
      </div>

      {showPackages && (
        <div className="dash-detail-card" style={{ marginTop: 20 }}>
          <h2 className="dash-detail-card__title">Repair Package Options</h2>
          {PACKAGE_TIERS.map((tier) => (
            <div key={tier.key} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: "0.85rem", color: "#c45f2f", marginBottom: 12 }}>{tier.label}</h3>
              {pkgForm[tier.key].map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <input
                    className="dash-form-input"
                    placeholder="Service item"
                    value={item.label}
                    onChange={(e) => updatePkgItem(tier.key, idx, "label", e.target.value)}
                  />
                  <input
                    className="dash-form-input"
                    type="number"
                    placeholder="Price ₹"
                    value={item.price}
                    onChange={(e) => updatePkgItem(tier.key, idx, "price", e.target.value)}
                    style={{ maxWidth: 120 }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="dash-btn dash-btn--ghost"
                onClick={() => addPkgRow(tier.key)}
              >
                + Add Item
              </button>
            </div>
          ))}
          <button
            type="button"
            className="dash-btn dash-btn--primary"
            onClick={handleSavePackages}
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Save Packages"}
          </button>
        </div>
      )}
    </div>
  );
}
