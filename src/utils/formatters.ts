export function formatDate(date: Date, locale = 'en-GB') {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatCurrency(value: number, locale = 'en-IE', currency = 'EUR') {
  const formattedValue = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  if (currency === 'USD') {
    return formattedValue.replace(/US\$/g, '$');
  }

  return formattedValue;
}
