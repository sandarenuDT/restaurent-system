// Maps order/item/table statuses to badge styles

const ORDER_STATUS = {
  pending:   { label: "Pending",   cls: "badge-orange" },
  confirmed: { label: "Confirmed", cls: "badge-blue"   },
  preparing: { label: "Preparing", cls: "badge-yellow" },
  ready:     { label: "Ready",     cls: "badge-green"  },
  served:    { label: "Served",    cls: "badge-gray"   },
  cancelled: { label: "Cancelled", cls: "badge-red"    },
};

const TABLE_STATUS = {
  available:       { label: "Available",        cls: "badge-green"  },
  occupied:        { label: "Occupied",         cls: "badge-blue"   },
  bill_requested:  { label: "Bill Requested",   cls: "badge-orange" },
  reserved:        { label: "Reserved",         cls: "badge-purple" },
  unavailable:     { label: "Unavailable",      cls: "badge-gray"   },
};

const PAYMENT_STATUS = {
  pending: { label: "Unpaid", cls: "badge-orange" },
  paid:    { label: "Paid",   cls: "badge-green"  },
  voided:  { label: "Voided", cls: "badge-red"    },
};

export default function StatusBadge({ type = "order", status }) {
  const map = { order: ORDER_STATUS, table: TABLE_STATUS, payment: PAYMENT_STATUS }[type];
  const cfg  = map?.[status] || { label: status, cls: "badge-gray" };

  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}