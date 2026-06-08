import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail?: string;
}

export function StatCard({ icon: Icon, label, value, detail }: StatCardProps) {
  return (
    <article className="card stat-card h-100 border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div>
            <p className="text-secondary small text-uppercase fw-semibold mb-1">{label}</p>
            <strong className="fs-3 text-dark">{value}</strong>
          </div>
          <span className="icon-badge">
            <Icon size={22} aria-hidden="true" />
          </span>
        </div>
        {detail ? <p className="text-secondary small mb-0 mt-3">{detail}</p> : null}
      </div>
    </article>
  );
}
