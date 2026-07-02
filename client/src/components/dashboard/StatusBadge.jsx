import { STATUS_LABELS } from "../../utils/orderStatus";
import "./StatusBadge.css";

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const variant = status?.toLowerCase() || "pending";

  return <span className={`status-badge status-badge--${variant}`}>{label}</span>;
}
