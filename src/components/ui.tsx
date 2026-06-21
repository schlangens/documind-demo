import type { DocStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: DocStatus }) {
  const map: Record<DocStatus, string> = {
    processing: "bg-slate-100 text-slate-600",
    ready: "bg-emerald-100 text-emerald-700",
    needs_review: "bg-amber-100 text-amber-700",
  };
  const label: Record<DocStatus, string> = { processing: "Processing", ready: "Ready", needs_review: "Needs review" };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status]}`}>{label[status]}</span>;
}

export function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.8 ? "bg-emerald-500" : value >= 0.6 ? "bg-amber-500" : "bg-rose-500";
  const text = value >= 0.8 ? "text-emerald-700" : value >= 0.6 ? "text-amber-700" : "text-rose-700";
  return (
    <span className="inline-flex items-center gap-1.5" title={`${pct}% confidence`}>
      <span className="w-14 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <span className={`block h-full ${color}`} style={{ width: `${pct}%` }} />
      </span>
      <span className={`text-xs tabular-nums ${text}`}>{pct}%</span>
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-xl ${className}`}>{children}</div>;
}
