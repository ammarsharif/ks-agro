export const calculateLineAmount = (rate, qty, discount) => {
  const r = parseFloat(rate) || 0;
  const q = parseFloat(qty) || 0;
  const d = Math.max(0, parseFloat(discount) || 0);
  return Math.max(0, (r * q) - d);
};

export const calculateSubTotal = (items) => {
  return items.reduce((total, item) => {
    return total + calculateLineAmount(item.rate, item.qty, item.discount);
  }, 0);
};


export const formatCurrency = (amount) => {
  const val = parseFloat(amount) || 0;
  return val.toLocaleString('en-PK', {
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

/* ───────── Sale Bill helpers ───────── */

const num = (v) => parseFloat(v) || 0;
const pct = (v) => Math.min(100, Math.max(0, num(v)));
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

// Net rate = Gross rate after Inv Disc %, then after Fur Disc %
export const calcNetRate = (gross, invDisc, furDisc) =>
  round2(num(gross) * (1 - pct(invDisc) / 100) * (1 - pct(furDisc) / 100));

export const calcBillAmount = (item) =>
  round2(calcNetRate(item.grossRate, item.invDisc, item.furDisc) * num(item.qty));

// 59200 -> "59,200.00"
export const formatMoney = (v) =>
  num(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "23/Oct/2026" from "2026-10-23"
export const formatBillDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d}/${months[Number(m) - 1] || m}/${y}`;
};

// "2523" -> "2,523" (non-numeric values are shown as typed)
export const formatDcNo = (v) => {
  const s = String(v ?? '').trim();
  return /^\d+$/.test(s) ? Number(s).toLocaleString('en-US') : s;
};
