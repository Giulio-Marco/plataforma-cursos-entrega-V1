import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state text-center p-4">
      <FileQuestion className="mb-3 text-primary" size={34} aria-hidden="true" />
      <h3 className="h5">{title}</h3>
      <p className="mb-0 text-secondary">{description}</p>
    </div>
  );
}
