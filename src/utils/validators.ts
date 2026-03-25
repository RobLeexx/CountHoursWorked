export function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function parseDecimalInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalizedValue = value.replace(',', '.');
  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return Number(parsedValue.toFixed(2));
}

export function isIsoDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}
