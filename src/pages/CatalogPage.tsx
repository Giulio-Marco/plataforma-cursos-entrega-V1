import { Award, BookOpen, GraduationCap, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CourseCard } from "../components/CourseCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PlanCard } from "../components/PlanCard";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useAcademyData } from "../services/useAcademyData";
import { averageRating } from "../utils/format";

export function CatalogPage() {
  const { currentUser } = useAuth();
  const {
    usuarios,
    categorias,
    cursos,
    matriculas,
    avaliacoes,
    trilhas,
    trilhasCursos,
    planos,
    loading,
    error,
  } = useAcademyData();
  const [busca, setBusca] = useState("");
  const [categoriaId, setCategoriaId] = useState("todos");

  const cursosFiltrados = useMemo(() => {
    const term = busca.trim().toLowerCase();

    return cursos.filter((curso) => {
      const categoria = categorias.find((item) => item.id === curso.categoriaId);
      const instrutor = usuarios.find((item) => item.id === curso.instrutorId);
      const matchCategoria = categoriaId === "todos" || curso.categoriaId === Number(categoriaId);
      const matchTerm =
        !term ||
        [curso.titulo, curso.descricao, curso.nivel, categoria?.nome, instrutor?.nomeCompleto]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));

      return matchCategoria && matchTerm;
    });
  }, [busca, categoriaId, categorias, cursos, usuarios]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <div className="alert alert-danger">Nao foi possivel carregar o JSON Server: {error}</div>;
  }

  return (
    <>
      <section className="page-title">
        <div>
          <p className="eyebrow">Plataforma de Cursos Online</p>
          <h1 className="display-5 fw-bold text-balance">Catalogo, trilhas e planos em uma interface React.</h1>
          <p className="lead-copy mb-0">
            Escolha cursos por categoria, acompanhe matriculas e simule o fluxo academico e financeiro da plataforma.
          </p>
        </div>
        {currentUser?.tipo === "instrutor" ? (
          <Link className="btn btn-primary" to="/cursos/novo">
            Novo curso
          </Link>
        ) : null}
      </section>

      <section className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon={BookOpen} label="Cursos" value={cursos.length} detail="Com modulos e aulas" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={GraduationCap} label="Instrutores" value={usuarios.filter((u) => u.tipo === "instrutor").length} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={Users} label="Matriculas" value={matriculas.length} detail="Registros via API" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={Award} label="Trilhas" value={trilhas.length} detail="Sequencias de cursos" />
        </div>
      </section>

      <section className="card filter-card shadow-sm mb-4">
        <div className="card-body">
          <form className="row g-3 align-items-end">
            <div className="col-lg-7">
              <label className="form-label fw-semibold" htmlFor="busca">
                Buscar curso
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={18} aria-hidden="true" />
                </span>
                <input
                  className="form-control"
                  id="busca"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Python, SQL, arquitetura, instrutor..."
                />
              </div>
            </div>
            <div className="col-lg-4">
              <label className="form-label fw-semibold" htmlFor="categoria">
                Categoria
              </label>
              <select
                className="form-select"
                id="categoria"
                value={categoriaId}
                onChange={(event) => setCategoriaId(event.target.value)}
              >
                <option value="todos">Todas as categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-1">
              <span className="badge text-bg-secondary w-100 py-2">{cursosFiltrados.length}</span>
            </div>
          </form>
        </div>
      </section>

      <section className="row g-4">
        {cursosFiltrados.map((curso) => {
          const categoria = categorias.find((item) => item.id === curso.categoriaId);
          const instrutor = usuarios.find((item) => item.id === curso.instrutorId);
          const cursoAvaliacoes = avaliacoes.filter((item) => item.cursoId === curso.id);

          return (
            <div className="col-md-6 col-xl-4" key={curso.id}>
              <CourseCard
                curso={curso}
                categoria={categoria}
                instrutor={instrutor}
                totalMatriculas={matriculas.filter((item) => item.cursoId === curso.id).length}
                mediaAvaliacao={averageRating(cursoAvaliacoes)}
              />
            </div>
          );
        })}
      </section>

      {!cursosFiltrados.length ? (
        <div className="mt-4">
          <EmptyState title="Nenhum curso encontrado" description="Altere a busca ou cadastre um novo curso como instrutor." />
        </div>
      ) : null}

      <section className="section-block">
        <div className="page-title mb-3">
          <div>
            <p className="eyebrow">Curadoria</p>
            <h2 className="h3 mb-0">Trilhas cadastradas</h2>
          </div>
          {currentUser?.tipo === "instrutor" ? (
            <Link className="btn btn-outline-primary btn-sm" to="/gestao">
              Gerenciar trilhas
            </Link>
          ) : null}
        </div>

        <div className="row g-4">
          {trilhas.map((trilha) => {
            const categoria = categorias.find((item) => item.id === trilha.categoriaId);
            const cursosDaTrilha = trilhasCursos
              .filter((item) => item.trilhaId === trilha.id)
              .map((item) => cursos.find((curso) => curso.id === item.cursoId))
              .filter(Boolean);

            return (
              <div className="col-md-6" key={trilha.id}>
                <article className="card h-100 shadow-sm">
                  <div className="card-body">
                    <span className="badge text-bg-primary-subtle text-primary-emphasis">{categoria?.nome}</span>
                    <h3 className="h5 mt-3">{trilha.titulo}</h3>
                    <p className="text-secondary">{trilha.descricao}</p>
                    <ol className="trail-course-list">
                      {cursosDaTrilha.map((curso) => (
                        <li key={curso!.id}>{curso!.titulo}</li>
                      ))}
                    </ol>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="page-title mb-3">
          <div>
            <p className="eyebrow">Financeiro</p>
            <h2 className="h3 mb-0">Planos de assinatura</h2>
          </div>
        </div>
        <div className="row g-4">
          {planos.map((plano) => (
            <div className="col-md-4" key={plano.id}>
              <PlanCard plano={plano} authenticated={Boolean(currentUser)} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
