import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPendingRequests, approveRequest } from "../../services/api";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatDate, getDeviceName } from "../../utils/orderStatus";

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(null);

  const load = async () => {
    setError("");
    try {
      const data = await getPendingRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (reqId) => {
    setApproving(reqId);
    setError("");
    try {
      await approveRequest(reqId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setApproving(null);
    }
  };

  if (loading) return <p className="dash-loading">Loading pending requests...</p>;

  return (
    <div>
      <h1 className="dash-page-title">Pending Requests</h1>
      <p className="dash-page-subtitle">Review and approve new repair pickup requests.</p>
      {error && <p className="dash-error">{error}</p>}

      {requests.length === 0 ? (
        <div className="dash-empty">
          <p className="dash-empty__title">No pending requests</p>
          <p className="dash-empty__text">New customer requests will appear here.</p>
        </div>
      ) : (
        <div className="dash-list">
          {requests.map((req) => (
            <div key={req._id} className="dash-detail-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
                    {getDeviceName(req)}
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "#8b949e" }}>
                    #{req._id.slice(-6).toUpperCase()} · {formatDate(req.createdAt)}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>

              {req.user && (
                <div className="dash-detail-row">
                  <span className="dash-detail-row__label">Customer</span>
                  <span>{req.user.name || "Customer"}</span>
                </div>
              )}
              {req.user?.phone && (
                <div className="dash-detail-row">
                  <span className="dash-detail-row__label">Phone</span>
                  <span>{req.user.phone}</span>
                </div>
              )}
              {req.device?.issue && (
                <div className="dash-detail-row">
                  <span className="dash-detail-row__label">Issue</span>
                  <span>{req.device.issue}</span>
                </div>
              )}

              <div className="dash-actions">
                <button
                  type="button"
                  className="dash-btn dash-btn--primary"
                  onClick={() => handleApprove(req._id)}
                  disabled={approving === req._id}
                >
                  {approving === req._id ? "Approving..." : "Approve & Assign"}
                </button>
                <Link to={`/agent/orders/${req._id}`} className="dash-btn dash-btn--ghost">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
