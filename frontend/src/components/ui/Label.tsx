type LabelProps = {
  htmlFor?: string;
  children: React.ReactNode;
};

export function Label({ htmlFor, children }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-text-secondary">
      {children}
    </label>
  );
}
