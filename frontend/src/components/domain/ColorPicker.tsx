/** Paleta 2026 — alineada con docs/pliego/06-diseno-ui.md */
const PRESET_COLORS = [
  "#7C5CFF",
  "#06B6D4",
  "#22C55E",
  "#F97316",
  "#EC4899",
  "#EAB308",
  "#64748B",
  "#2563EB",
  "#DC2626",
  "#14B8A6",
  "#A855F7",
  "#F43F5E",
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
          className={`h-11 w-11 rounded-full border-2 transition ${
            value === color
              ? "border-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
              : "border-white/20"
          }`}
          style={{ backgroundColor: color }}
          aria-label={`Color ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
