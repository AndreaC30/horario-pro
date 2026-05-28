import { formatMoney } from "../../utils/money";

export function MoneyDisplay({ value }: { value: string | number | null | undefined }) {
  return <span>{formatMoney(value)}</span>;
}
