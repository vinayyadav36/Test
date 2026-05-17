"use client";

const statusConfig: Record<string, { cls: string; icon: string }> = {
  draft: { cls: "badge-slate", icon: "📝" },
  sent: { cls: "badge-blue", icon: "📤" },
  paid: { cls: "badge-green", icon: "✅" },
  overdue: { cls: "badge-red", icon: "⚠️" },
};

const labelMap: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { cls: "badge-slate", icon: "" };
  return (
    <span className={cfg.cls}>
      <span>{cfg.icon}</span>
      <span>{labelMap[status] ?? status}</span>
    </span>
  );
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatCard({
  label,
  value,
  sub,
  trend,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down";
  icon?: string;
}) {
  return (
    <div className="card-gradient animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        {icon && <span className="text-xl opacity-60">{icon}</span>}
      </div>
      <p className="stat-value text-white">{value}</p>
      {sub && (
        <div className="flex items-center gap-2 mt-1.5">
          {trend && (
            <span className={`text-xs font-semibold ${trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
              {trend === "up" ? "↑" : "↓"}
            </span>
          )}
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-glass text-center py-16 animate-fade-in">
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}
