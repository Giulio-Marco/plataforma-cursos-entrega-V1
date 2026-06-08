import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../context/AuthContext";
import type { NivelCurso } from "../model";
import { api } from "../services/api";
import { useAcademyData } from "../services/useAcademyData";
import { courseImageForCategory, nowIso } from "../utils/format";

export function CourseFormPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { categorias, loading, error } = useAcademyData();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [nivel, setNivel] = useState<NivelCurso>("Iniciante");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (loading || !currentUser) {
    return <LoadingState />;
  }

  if (error) {
    return <div className="alert alert-danger">Nao foi possivel carregar categorias: {error}</div>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!categoriaId) {
      setMessage("Escolha uma categoria antes de publicar o curso.");
      return;
    }

    setSubmitting(true);

    try {
      const categoria = categorias.find((item) => item.id === Number(categoriaId));
      const created = await api.createCurso({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        instrutorId: currentUser.id,
        categoriaId: Number(categoriaId),
        nivel,
        dataPublicacao: nowIso(),
        totalAulas: 0,
        totalHoras: 0,
        imagemUrl: courseImageForCategory(categoria),
      });
      navigate(`/cursos/${created.id}`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Nao foi possivel criar o curso.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-title">
        <div>
          <p className="eyebrow">Publicacao</p>
          <h1 className="display-5 fw-bold mb-0">Novo curso</h1>
          <p className="lead-copy mt-2 mb-0">Depois de publicar, abra o curso para cadastrar modulos e aulas.</p>
        </div>
        <Link className="btn btn-outline-primary" to="/gestao">
          Gerenciar categorias
        </Link>
      </section>

      <form className="card shadow-sm" onSubmit={handleSubmit}>
        <div className="card-body p-4">
          {message ? <div className="alert alert-warning">{message}</div> : null}
          <div className="row g-3">
            <div className="col-lg-8">
              <label className="form-label fw-semibold" htmlFor="titulo">
                Titulo do curso
              </label>
              <input
                className="form-control"
                id="titulo"
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Ex.: React com JSON Server"
                required
              />
            </div>
            <div className="col-lg-4">
              <label className="form-label fw-semibold" htmlFor="nivel">
                Nivel
              </label>
              <select className="form-select" id="nivel" value={nivel} onChange={(event) => setNivel(event.target.value as NivelCurso)}>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediario">Intermediario</option>
                <option value="Avancado">Avancado</option>
              </select>
            </div>
            <div className="col-lg-6">
              <label className="form-label fw-semibold" htmlFor="categoria">
                Categoria
              </label>
              <select
                className="form-select"
                id="categoria"
                value={categoriaId}
                onChange={(event) => setCategoriaId(event.target.value)}
                required
              >
                <option value="">Selecione</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" htmlFor="descricao">
                Descricao
              </label>
              <textarea
                className="form-control"
                id="descricao"
                rows={6}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Objetivo, publico-alvo e conteudos principais do curso."
                required
              />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link className="btn btn-outline-secondary" to="/painel">
              Cancelar
            </Link>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Publicando..." : "Publicar curso"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
