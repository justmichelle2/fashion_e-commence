export function formatCurrency(cents = 0, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return formatter.format((cents || 0) / 100);
}
