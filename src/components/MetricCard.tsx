import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  featured?: boolean;
}

export function MetricCard({ title, value, detail, icon: Icon, featured = false }: MetricCardProps) {
  return (
    <article className={featured ? "metric-card metric-featured" : "metric-card"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={featured ? "text-sm text-teal-100" : "text-sm text-slate-500"}>{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.7rem]">{value}</p>
        </div>
        <span className={featured ? "rounded-xl bg-white/10 p-2.5 text-teal-100" : "rounded-xl bg-teal-50 p-2.5 text-teal-700"}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className={featured ? "mt-4 text-xs text-teal-100/80" : "mt-4 text-xs text-slate-500"}>{detail}</p>
    </article>
  );
}
