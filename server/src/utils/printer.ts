interface PrintItem  { name: string; quantity: number; price: number; }
interface PrintBill  { tableNumber: number; items: PrintItem[]; subtotal: number; taxAmount: number; discount: number; total: number; paymentMethod?: string; }

export const formatThermalReceipt = (bill: PrintBill): string => {
  const L = '='.repeat(32), D = '-'.repeat(32);
  const row = (label: string, value: string) => `${label.padEnd(32 - value.length)}${value}`;
  const items = bill.items.map(i => row(`${i.quantity}x ${i.name}`, `$${(i.price * i.quantity).toFixed(2)}`)).join('\n');
  return [
    L, 'RESTAURANT'.padStart(21), L,
    `Table: ${bill.tableNumber}`,
    `Date:  ${new Date().toLocaleString()}`, D,
    items, D,
    row('Subtotal:', `$${bill.subtotal.toFixed(2)}`),
    ...(bill.discount > 0 ? [row('Discount:', `-$${bill.discount.toFixed(2)}`)] : []),
    row('Tax:', `$${bill.taxAmount.toFixed(2)}`), L,
    row('TOTAL:', `$${bill.total.toFixed(2)}`),
    ...(bill.paymentMethod ? [row('Payment:', bill.paymentMethod.toUpperCase())] : []),
    L, 'Thank you for dining with us!'.padStart(30), L,
  ].join('\n');
};