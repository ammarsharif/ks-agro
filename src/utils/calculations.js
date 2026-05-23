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
