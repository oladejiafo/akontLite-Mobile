import { InvoiceItem } from '../types';

export function calcItemTotal(item: Partial<InvoiceItem>): number {
  const qty   = Number(item.quantity ?? 1);
  const price = Number(item.unit_price ?? item.rate ?? 0);
  const tax   = Number(item.tax_rate ?? 0);
  const sub   = qty * price;
  return sub + (sub * tax / 100);
}

export function calcTotals(items: Partial<InvoiceItem>[], discount = 0) {
  const subtotal  = items.reduce((s, i) => {
    const qty   = Number(i.quantity ?? 1);
    const price = Number(i.unit_price ?? i.rate ?? 0);
    return s + qty * price;
  }, 0);

  const taxAmount = items.reduce((s, i) => {
    const qty   = Number(i.quantity ?? 1);
    const price = Number(i.unit_price ?? i.rate ?? 0);
    const tax   = Number(i.tax_rate ?? 0);
    return s + (qty * price * tax / 100);
  }, 0);

  return {
    subtotal,
    taxAmount,
    discount,
    total: subtotal + taxAmount - discount,
  };
}