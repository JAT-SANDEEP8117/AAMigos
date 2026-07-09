import { useEffect, useState } from "react";
import { getAdminAgents } from "../../services/api";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminAgents()
      .then(setAgents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="dash-loading">Loading agents...</p>;

  return (
    <div>
      <h1 className="dash-page-title">Agents</h1>
      <p className="dash-page-subtitle">View registered pickup agents and their assigned repair workload.</p>
      {error && <p className="dash-error">{error}</p>}

      {agents.length === 0 ? (
        <div className="dash-empty">
          <p className="dash-empty__title">No agents found</p>
          <p className="dash-empty__text">Agent accounts will appear here after signup.</p>
        </div>
      ) : (
        <div className="dash-list">
          {agents.map((agent) => (
            <div key={agent._id} className="dash-detail-card">
              <h2 className="dash-detail-card__title">{agent.name || "Unnamed Agent"}</h2>
              <div className="dash-detail-row">
                <span className="dash-detail-row__label">Email</span>
                <span>{agent.email}</span>
              </div>
              <div className="dash-detail-row">
                <span className="dash-detail-row__label">Phone</span>
                <span>{agent.phone || "-"}</span>
              </div>
              <div className="dash-detail-row">
                <span className="dash-detail-row__label">Assigned Requests</span>
                <span>{agent.assignedRequests?.length || 0}</span>
              </div>
              <div className="dash-detail-row">
                <span className="dash-detail-row__label">KYC</span>
                <span>{agent.panCard && agent.aadharNumber ? "Complete" : "Pending"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
