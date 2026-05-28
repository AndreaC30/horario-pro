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
