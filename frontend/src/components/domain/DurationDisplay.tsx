import { formatHours } from "../../utils/time";

export function DurationDisplay({ value }: { value: string | number }) {
  return <span>{formatHours(value)}</span>;
}
