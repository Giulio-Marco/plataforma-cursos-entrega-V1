import { BookOpen, Clock, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Categoria, Curso, Usuario } from "../model";

interface CourseCardProps {
  curso: Curso;
  categoria?: Categoria;
  instrutor?: Usuario;
  totalMatriculas: number;
  mediaAvaliacao: number | null;
  progresso?: number;
}

export function CourseCard({
  curso,
  categoria,
  instrutor,
  totalMatriculas,
  mediaAvaliacao,
  progresso,
}: CourseCardProps) {
  return (
    <article className="card course-card h-100 shadow-sm">
      <img className="card-img-top course-cover" src={curso.imagemUrl} alt={`Capa do curso ${curso.titulo}`} />
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
          <span className="badge text-bg-primary-subtle text-primary-emphasis">{categoria?.nome ?? "Sem categoria"}</span>
          <span className="badge text-bg-light border">{curso.nivel}</span>
        </div>
        <h3 className="h5 card-title">{curso.titulo}</h3>
        <p className="card-text text-secondary flex-grow-1">{curso.descricao}</p>
        <div className="course-facts small text-secondary">
          <span>
            <BookOpen size={16} aria-hidden="true" /> {curso.totalAulas} aulas
          </span>
          <span>
            <Clock size={16} aria-hidden="true" /> {curso.totalHoras} h
          </span>
          <span>
            <Users size={16} aria-hidden="true" /> {totalMatriculas}
          </span>
          <span>
            <Star size={16} aria-hidden="true" /> {mediaAvaliacao ?? "Sem nota"}
          </span>
        </div>
        <p className="small text-secondary mt-3 mb-0">Instrutor: {instrutor?.nomeCompleto ?? "Nao informado"}</p>
        {typeof progresso === "number" ? (
          <div className="mt-3">
            <div className="d-flex justify-content-between small text-secondary mb-1">
              <span>Progresso</span>
              <span>{progresso}%</span>
            </div>
            <div className="progress" role="progressbar" aria-label="Progresso no curso" aria-valuenow={progresso}>
              <div className="progress-bar bg-success" style={{ width: `${progresso}%` }} />
            </div>
          </div>
        ) : null}
        <Link className="btn btn-primary mt-4" to={`/cursos/${curso.id}`}>
          Ver curso
        </Link>
      </div>
    </article>
  );
}
