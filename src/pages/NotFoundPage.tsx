import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";

export function NotFoundPage() {
  return (
    <div className="mx-auto" style={{ maxWidth: 620 }}>
      <EmptyState title="Pagina nao encontrada" description="A rota informada nao existe nesta aplicacao." />
      <div className="text-center mt-3">
        <Link className="btn btn-primary" to="/">
          Voltar ao catalogo
        </Link>
      </div>
    </div>
  );
}
