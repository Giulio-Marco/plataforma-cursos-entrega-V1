import { BookOpen, CheckCircle2, Clock, LinkIcon, Star, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../context/AuthContext";
import type { TipoConteudo } from "../model";
import { api } from "../services/api";
import { useAcademyData } from "../services/useAcademyData";
import {
  averageRating,
  formatDate,
  formatDateTime,
  generateCertificateCode,
  nowIso,
  sumHours,
} from "../utils/format";

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const data = useAcademyData();
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const courseId = Number(id);

  if (data.loading) {
    return <LoadingState />;
  }

  if (data.error) {
    return <div className="alert alert-danger">Nao foi possivel carregar o curso: {data.error}</div>;
  }

  const curso = data.cursos.find((item) => item.id === courseId);

  if (!curso) {
    return (
      <div className="mx-auto" style={{ maxWidth: 620 }}>
        <EmptyState title="Curso nao encontrado" description="Confira se o curso ainda existe no JSON Server." />
      </div>
    );
  }

  const categoria = data.categorias.find((item) => item.id === curso.categoriaId);
  const instrutor = data.usuarios.find((item) => item.id === curso.instrutorId);
  const courseModules = data.modulos.filter((item) => item.cursoId === curso.id).sort((a, b) => a.ordem - b.ordem);
  const moduleIds = new Set(courseModules.map((item) => item.id));
  const courseLessons = data.aulas.filter((item) => moduleIds.has(item.moduloId));
  const matricula = currentUser
    ? data.matriculas.find((item) => item.usuarioId === currentUser.id && item.cursoId === curso.id)
    : undefined;
  const isOwner = currentUser?.id === curso.instrutorId;
  const isEnrolled = Boolean(matricula);
  const cursoAvaliacoes = data.avaliacoes.filter((item) => item.cursoId === curso.id);
  const mediaAvaliacao = averageRating(cursoAvaliacoes);
  const userReview = currentUser
    ? data.avaliacoes.find((item) => item.usuarioId === currentUser.id && item.cursoId === curso.id)
    : undefined;
  const concludedLessonIds = new Set(
    data.progressoAulas
      .filter((item) => item.usuarioId === currentUser?.id && item.status === "Concluido")
      .map((item) => item.aulaId),
  );
  const concludedCount = courseLessons.filter((aula) => concludedLessonIds.has(aula.id)).length;
  const progressPercent = courseLessons.length ? Math.round((concludedCount / courseLessons.length) * 100) : 0;
  const certificate = currentUser
    ? data.certificados.find((item) => item.usuarioId === currentUser.id && item.cursoId === curso.id)
    : undefined;

  const withFeedback = async (action: () => Promise<string>) => {
    setBusy(true);
    setMessage("");
    setErrorMessage("");

    try {
      const feedback = await action();
      setMessage(feedback);
      await data.reload();
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Nao foi possivel concluir a acao.");
    } finally {
      setBusy(false);
    }
  };

  const handleEnroll = () => {
    if (!currentUser) {
      navigate("/login", { state: { from: { pathname: `/cursos/${curso.id}` } } });
      return;
    }

    if (currentUser.tipo !== "aluno") {
      setErrorMessage("Apenas alunos podem se matricular em cursos.");
      return;
    }

    if (isEnrolled) {
      setMessage("Voce ja esta matriculado neste curso.");
      return;
    }

    void withFeedback(async () => {
      await api.createMatricula({
        usuarioId: currentUser.id,
        cursoId: curso.id,
        dataMatricula: nowIso(),
        dataConclusao: null,
      });
      return "Matricula criada com sucesso.";
    });
  };

  const handleAddModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const titulo = String(form.get("titulo") ?? "").trim();
    const ordem = Number(form.get("ordem") ?? courseModules.length + 1);

    if (!titulo) {
      setErrorMessage("Informe o titulo do modulo.");
      return;
    }

    void withFeedback(async () => {
      await api.createModulo({ cursoId: curso.id, titulo, ordem });
      event.currentTarget.reset();
      return "Modulo cadastrado.";
    });
  };

  const handleAddLesson = (moduloId: number, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const titulo = String(form.get("titulo") ?? "").trim();
    const tipoConteudo = String(form.get("tipoConteudo") ?? "Video") as TipoConteudo;
    const urlConteudo = String(form.get("urlConteudo") ?? "").trim();
    const duracaoMinutos = Number(form.get("duracaoMinutos") ?? 0);
    const ordem = Number(form.get("ordem") ?? 1);

    if (!titulo || !urlConteudo || duracaoMinutos <= 0) {
      setErrorMessage("Preencha titulo, URL e duracao da aula.");
      return;
    }

    void withFeedback(async () => {
      const aulaCriada = await api.createAula({
        moduloId,
        titulo,
        tipoConteudo,
        urlConteudo,
        duracaoMinutos,
        ordem,
      });
      const nextLessons = [...courseLessons, aulaCriada];
      await api.patchCurso(curso.id, {
        totalAulas: nextLessons.length,
        totalHoras: sumHours(nextLessons),
      });
      event.currentTarget.reset();
      return "Aula cadastrada e estatisticas atualizadas.";
    });
  };

  const handleCompleteLesson = (aulaId: number) => {
    if (!currentUser || currentUser.tipo !== "aluno" || !matricula) {
      setErrorMessage("Voce precisa estar matriculado como aluno para concluir aulas.");
      return;
    }

    if (concludedLessonIds.has(aulaId)) {
      return;
    }

    void withFeedback(async () => {
      const completionDate = nowIso();
      await api.createProgressoAula({
        usuarioId: currentUser.id,
        aulaId,
        dataConclusao: completionDate,
        status: "Concluido",
      });

      const nextConcluded = new Set(concludedLessonIds);
      nextConcluded.add(aulaId);

      if (courseLessons.length > 0 && courseLessons.every((aula) => nextConcluded.has(aula.id))) {
        await api.patchMatricula(matricula.id, { dataConclusao: completionDate });

        if (!certificate) {
          await api.createCertificado({
            usuarioId: currentUser.id,
            cursoId: curso.id,
            trilhaId: null,
            codigoVerificacao: generateCertificateCode(),
            dataEmissao: completionDate,
          });
        }

        return "Curso concluido. Certificado emitido.";
      }

      return "Aula marcada como concluida.";
    });
  };

  const handleReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser || currentUser.tipo !== "aluno" || !matricula) {
      setErrorMessage("Apenas alunos matriculados podem avaliar o curso.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const nota = Number(form.get("nota") ?? 5);
    const comentario = String(form.get("comentario") ?? "").trim();

    void withFeedback(async () => {
      if (userReview) {
        await api.patchAvaliacao(userReview.id, {
          nota,
          comentario,
          dataAvaliacao: nowIso(),
        });
      } else {
        await api.createAvaliacao({
          usuarioId: currentUser.id,
          cursoId: curso.id,
          nota,
          comentario,
          dataAvaliacao: nowIso(),
        });
      }

      return "Avaliacao salva.";
    });
  };

  return (
    <>
      <section className="row g-4 align-items-start">
        <div className="col-lg-8">
          <img className="course-hero-cover shadow-sm" src={curso.imagemUrl} alt={`Capa do curso ${curso.titulo}`} />
          <div className="mt-4">
            <span className="badge text-bg-primary-subtle text-primary-emphasis">{categoria?.nome}</span>
            <h1 className="display-5 fw-bold mt-3 text-balance">{curso.titulo}</h1>
            <p className="lead-copy">{curso.descricao}</p>
            <div className="lesson-meta text-secondary">
              <span>
                <Users size={18} aria-hidden="true" /> Instrutor: {instrutor?.nomeCompleto}
              </span>
              <span>
                <BookOpen size={18} aria-hidden="true" /> {curso.totalAulas} aulas
              </span>
              <span>
                <Clock size={18} aria-hidden="true" /> {curso.totalHoras} h
              </span>
              <span>
                <Star size={18} aria-hidden="true" /> {mediaAvaliacao ?? "Sem nota"}
              </span>
            </div>
            <p className="small text-secondary mt-2 mb-0">Publicado em {formatDate(curso.dataPublicacao)}</p>
          </div>
        </div>

        <aside className="col-lg-4">
          <div className="card shadow-sm action-panel">
            <div className="card-body">
              <h2 className="h5">Status do acesso</h2>
              {message ? <div className="alert alert-success py-2">{message}</div> : null}
              {errorMessage ? <div className="alert alert-danger py-2">{errorMessage}</div> : null}

              {!currentUser ? (
                <>
                  <p className="text-secondary">Entre para se matricular e acompanhar seu progresso.</p>
                  <Link className="btn btn-primary w-100" to="/login">
                    Entrar
                  </Link>
                </>
              ) : currentUser.tipo === "aluno" ? (
                <>
                  {isEnrolled ? (
                    <>
                      <span className="badge text-bg-success mb-3">Matricula ativa</span>
                      <div className="d-flex justify-content-between small text-secondary mb-1">
                        <span>Progresso</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="progress mb-3" role="progressbar" aria-valuenow={progressPercent}>
                        <div className="progress-bar bg-success" style={{ width: `${progressPercent}%` }} />
                      </div>
                      {certificate ? (
                        <div className="alert alert-warning py-2">
                          Certificado: <strong>{certificate.codigoVerificacao}</strong>
                        </div>
                      ) : null}
                      <Link className="btn btn-outline-primary w-100" to="/painel">
                        Ver painel
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-secondary">Matricule-se para liberar controle de aulas e avaliacao.</p>
                      <button className="btn btn-primary w-100" onClick={handleEnroll} disabled={busy}>
                        Matricular-se
                      </button>
                    </>
                  )}
                </>
              ) : isOwner ? (
                <p className="text-secondary mb-0">Voce e o instrutor deste curso. Use os formularios abaixo para editar a estrutura.</p>
              ) : (
                <p className="text-secondary mb-0">Contas de instrutor nao realizam matricula em cursos de outros instrutores.</p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="section-block">
        <div className="page-title mb-3">
          <div>
            <p className="eyebrow">Conteudo</p>
            <h2 className="h3 mb-0">Modulos e aulas</h2>
          </div>
        </div>

        <div className="vstack gap-3">
          {courseModules.map((modulo) => {
            const moduleLessons = data.aulas
              .filter((aula) => aula.moduloId === modulo.id)
              .sort((a, b) => a.ordem - b.ordem);

            return (
              <article className="card shadow-sm" key={modulo.id}>
                <div className="card-header bg-white">
                  <span className="badge text-bg-light border me-2">Modulo {modulo.ordem}</span>
                  <strong>{modulo.titulo}</strong>
                </div>

                <div className="list-group list-group-flush">
                  {moduleLessons.map((aula) => {
                    const done = concludedLessonIds.has(aula.id);

                    return (
                      <div className="list-group-item py-3" key={aula.id}>
                        <div className="d-flex flex-wrap justify-content-between gap-3">
                          <div>
                            <div className="lesson-meta small text-secondary mb-2">
                              <span>Aula {aula.ordem}</span>
                              <span>{aula.tipoConteudo}</span>
                              <span>{aula.duracaoMinutos} min</span>
                            </div>
                            <h3 className="h6 mb-1">{aula.titulo}</h3>
                            <a className="small" href={aula.urlConteudo} target="_blank" rel="noreferrer">
                              <LinkIcon size={14} aria-hidden="true" /> {aula.urlConteudo}
                            </a>
                          </div>

                          {currentUser?.tipo === "aluno" && isEnrolled ? (
                            done ? (
                              <span className="badge text-bg-success align-self-start">
                                <CheckCircle2 size={14} aria-hidden="true" /> Concluido
                              </span>
                            ) : (
                              <button className="btn btn-outline-success btn-sm align-self-start" onClick={() => handleCompleteLesson(aula.id)} disabled={busy}>
                                Marcar concluida
                              </button>
                            )
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isOwner ? (
                  <form className="card-body border-top" onSubmit={(event) => handleAddLesson(modulo.id, event)}>
                    <h4 className="h6 mb-3">Adicionar aula</h4>
                    <div className="row g-3">
                      <div className="col-lg-4">
                        <label className="form-label" htmlFor={`titulo-${modulo.id}`}>
                          Titulo
                        </label>
                        <input className="form-control" id={`titulo-${modulo.id}`} name="titulo" required />
                      </div>
                      <div className="col-lg-2">
                        <label className="form-label" htmlFor={`tipo-${modulo.id}`}>
                          Tipo
                        </label>
                        <select className="form-select" id={`tipo-${modulo.id}`} name="tipoConteudo" defaultValue="Video">
                          <option value="Video">Video</option>
                          <option value="Texto">Texto</option>
                          <option value="Quiz">Quiz</option>
                        </select>
                      </div>
                      <div className="col-lg-3">
                        <label className="form-label" htmlFor={`url-${modulo.id}`}>
                          URL
                        </label>
                        <input className="form-control" id={`url-${modulo.id}`} name="urlConteudo" placeholder="https://..." required />
                      </div>
                      <div className="col-lg-1">
                        <label className="form-label" htmlFor={`duracao-${modulo.id}`}>
                          Min
                        </label>
                        <input
                          className="form-control"
                          id={`duracao-${modulo.id}`}
                          name="duracaoMinutos"
                          type="number"
                          min="1"
                          defaultValue="20"
                          required
                        />
                      </div>
                      <div className="col-lg-1">
                        <label className="form-label" htmlFor={`ordem-${modulo.id}`}>
                          Ordem
                        </label>
                        <input
                          className="form-control"
                          id={`ordem-${modulo.id}`}
                          name="ordem"
                          type="number"
                          min="1"
                          defaultValue={moduleLessons.length + 1}
                          required
                        />
                      </div>
                      <div className="col-lg-1 d-flex align-items-end">
                        <button className="btn btn-primary w-100" disabled={busy}>
                          Salvar
                        </button>
                      </div>
                    </div>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>

        {!courseModules.length ? (
          <EmptyState title="Curso sem modulos" description="O instrutor ainda nao cadastrou a estrutura deste curso." />
        ) : null}
      </section>

      {isOwner ? (
        <section className="section-block">
          <form className="card shadow-sm" onSubmit={handleAddModule}>
            <div className="card-body">
              <h2 className="h4">Adicionar modulo</h2>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <label className="form-label" htmlFor="module-title">
                    Titulo do modulo
                  </label>
                  <input className="form-control" id="module-title" name="titulo" required />
                </div>
                <div className="col-md-2">
                  <label className="form-label" htmlFor="module-order">
                    Ordem
                  </label>
                  <input
                    className="form-control"
                    id="module-order"
                    name="ordem"
                    type="number"
                    min="1"
                    defaultValue={courseModules.length + 1}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100" disabled={busy}>
                    Salvar modulo
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      ) : null}

      {currentUser?.tipo === "aluno" && isEnrolled ? (
        <section className="section-block">
          <form className="card shadow-sm" onSubmit={handleReview}>
            <div className="card-body">
              <h2 className="h4">Sua avaliacao</h2>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label" htmlFor="nota">
                    Nota
                  </label>
                  <select className="form-select" id="nota" name="nota" defaultValue={userReview?.nota ?? 5}>
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <option key={nota} value={nota}>
                        {nota}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label" htmlFor="comentario">
                    Comentario
                  </label>
                  <input className="form-control" id="comentario" name="comentario" defaultValue={userReview?.comentario ?? ""} />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-primary w-100" disabled={busy}>
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      ) : null}

      <section className="section-block">
        <h2 className="h4 mb-3">Avaliacoes</h2>
        <div className="row g-3">
          {cursoAvaliacoes.map((avaliacao) => {
            const usuario = data.usuarios.find((item) => item.id === avaliacao.usuarioId);

            return (
              <div className="col-md-6" key={avaliacao.id}>
                <article className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between gap-2">
                      <strong>{usuario?.nomeCompleto}</strong>
                      <span className="badge text-bg-warning">{avaliacao.nota}/5</span>
                    </div>
                    <p className="text-secondary mt-3 mb-2">{avaliacao.comentario || "Sem comentario."}</p>
                    <p className="small text-secondary mb-0">{formatDateTime(avaliacao.dataAvaliacao)}</p>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
