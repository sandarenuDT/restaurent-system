interface BillItem { price: number; quantity: number; }
interface BillResult { subtotal: number; taxAmount: number; discount: number; total: number; }

export const calculateBill = (items: BillItem[], taxRate = 0.1, discountPercent = 0): BillResult => {
  const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount    = +(subtotal * (discountPercent / 100)).toFixed(2);
  const taxAmount   = +((subtotal - discount) * taxRate).toFixed(2);
  const total       = +(subtotal - discount + taxAmount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), taxAmount, discount, total };
};