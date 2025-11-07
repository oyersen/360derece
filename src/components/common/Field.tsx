export function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
