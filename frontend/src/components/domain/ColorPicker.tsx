const PRESET_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#7c3aed", "#0891b2", "#ea580c"];

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`h-10 w-10 rounded-full border-2 ${value === color ? "border-slate-900" : "border-transparent"}`}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-touch w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
        placeholder="#2563eb"
        pattern="^#[0-9A-Fa-f]{6}$"
      />
    </div>
  );
}
