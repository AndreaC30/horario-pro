export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) {
    return "—";
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** UX-C05: sin tarifa cuando el cliente no tiene hourly_rate y no hay importe. */
export function formatEstimatedPay(
  value: string | number | null | undefined,
  hourlyRate: string | null | undefined,
): string {
  const hasRate = hourlyRate !== null && hourlyRate !== undefined && hourlyRate !== "";
  const amount = value === null || value === undefined || value === "" ? 0 : Number(value);

  if (!hasRate && (Number.isNaN(amount) || amount === 0)) {
    return "sin tarifa";
  }
  if (Number.isNaN(amount)) {
    return "—";
  }
  return formatMoney(amount);
}
