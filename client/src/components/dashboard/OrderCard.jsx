import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatDate, getDeviceName, getDeviceImage } from "../../utils/orderStatus";
import "./OrderCard.css";

export default function OrderCard({ order, basePath, extra }) {
  const deviceName = getDeviceName(order);
  const deviceImg = getDeviceImage(order);

  return (
    <Link to={`${basePath}/${order._id}`} className="order-card">
      <div className="order-card__main">
        {deviceImg ? (
          <img src={deviceImg} alt={deviceName} className="order-card__img" />
        ) : (
          <div className="order-card__img order-card__img--placeholder">📱</div>
        )}
        <div className="order-card__info">
          <h3 className="order-card__title">{deviceName}</h3>
          <p className="order-card__meta">Order #{order._id.slice(-6).toUpperCase()}</p>
          <p className="order-card__meta">{formatDate(order.createdAt)}</p>
          {order.device?.issue && (
            <p className="order-card__issue">{order.device.issue}</p>
          )}
        </div>
      </div>
      <div className="order-card__footer">
        <StatusBadge status={order.status} />
        {extra}
      </div>
    </Link>
  );
}
