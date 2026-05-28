/** UX-C07: paleta limitada (≤12) para elegir rápido en móvil */
const PRESET_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ca8a04",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#64748b",
  "#db2777",
  "#059669",
  "#b45309",
  "#0d9488",
];

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`h-11 w-11 rounded-full border-2 ${value === color ? "border-slate-900 ring-2 ring-primary/30" : "border-white shadow-sm"}`}
          style={{ backgroundColor: color }}
          aria-label={`Color ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
