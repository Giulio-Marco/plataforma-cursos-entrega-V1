import { CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import type { Plano } from "../model";
import { formatCurrency } from "../utils/format";

interface PlanCardProps {
  plano: Plano;
  authenticated: boolean;
}

export function PlanCard({ plano, authenticated }: PlanCardProps) {
  return (
    <article className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <span className="icon-badge">
            <CreditCard size={20} aria-hidden="true" />
          </span>
          <span className="badge text-bg-warning">{plano.duracaoMeses} mes(es)</span>
        </div>
        <h3 className="h5 mt-3">{plano.nome}</h3>
        <p className="text-secondary flex-grow-1">{plano.descricao}</p>
        <strong className="fs-4">{formatCurrency(plano.preco)}</strong>
        <Link className="btn btn-outline-primary mt-3" to={authenticated ? `/checkout/${plano.id}` : "/login"}>
          {authenticated ? "Assinar plano" : "Entrar para assinar"}
        </Link>
      </div>
    </article>
  );
}
