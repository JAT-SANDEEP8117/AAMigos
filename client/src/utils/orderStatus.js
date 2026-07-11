export const ORDER_STATUSES = [
  "Pending",
  "Approved",
  "PickedUp",
  "FreeApproval",
  "InRepair",
  "Delivering",
  "Paid",
  "Completed",
  "Cancelled",
];

export const STATUS_LABELS = {
  Pending: "Pending Approval",
  Approved: "Approved",
  PickedUp: "Picked Up",
  FreeApproval: "Free Service Review",
  InRepair: "In Repair",
  Delivering: "Out for Delivery",
  Paid: "Paid",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

export const AGENT_NEXT_STATUS = {
  Approved: "PickedUp",
  PickedUp: "FreeApproval",
  FreeApproval: "InRepair",
  InRepair: "Delivering",
  Delivering: "Paid",
  Paid: "Completed",
};

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDeviceName(order) {
  const device = order?.device;
  if (!device) return "Unknown Device";
  return [device.brandName, device.modelName].filter(Boolean).join(" ") || device.model?.name || "Unknown Device";
}

export function getDeviceImage(order) {
  return order?.device?.model?.img || null;
}
