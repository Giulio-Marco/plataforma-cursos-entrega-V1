import { Award, BookOpen, CreditCard, Layers, PlusCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { CourseCard } from "../components/CourseCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import type { Curso } from "../model";
import { useAcademyData } from "../services/useAcademyData";
import { averageRating, formatCurrency, formatDate, formatDateTime } from "../utils/format";

export function DashboardPage() {
  const { currentUser } = useAuth();
  const data = useAcademyData();

  if (data.loading || !currentUser) {
    return <LoadingState />;
  }

  if (data.error) {
    return <div className="alert alert-danger">Nao foi possivel carregar o painel: {data.error}</div>;
  }

  const courseLessons = (curso: Curso) => {
    const moduleIds = new Set(data.modulos.filter((modulo) => modulo.cursoId === curso.id).map((modulo) => modulo.id));
    return data.aulas.filter((aula) => moduleIds.has(aula.moduloId));
  };

  const courseProgress = (curso: Curso) => {
    const lessons = courseLessons(curso);
    if (!lessons.length) {
      return 0;
    }

    const lessonIds = new Set(lessons.map((aula) => aula.id));
    const done = data.progressoAulas.filter(
      (item) => item.usuarioId === currentUser.id && lessonIds.has(item.aulaId) && item.status === "Concluido",
    );
    return Math.round((done.length / lessons.length) * 100);
  };

  const getCategoria = (curso: Curso) => data.categorias.find((item) => item.id === curso.categoriaId);
  const getInstrutor = (curso: Curso) => data.usuarios.find((item) => item.id === curso.instrutorId);
  const getMedia = (curso: Curso) => averageRating(data.avaliacoes.filter((item) => item.cursoId === curso.id));
  const getTotalMatriculas = (curso: Curso) => data.matriculas.filter((item) => item.cursoId === curso.id).length;
  const myCourses = data.cursos.filter((curso) => curso.instrutorId === currentUser.id);
  const myEnrollments = data.matriculas.filter((item) => item.usuarioId === currentUser.id);
  const enrolledCourses = myEnrollments
    .map((matricula) => data.cursos.find((curso) => curso.id === matricula.cursoId))
    .filter((curso): curso is Curso => Boolean(curso));
  const myCertificates = data.certificados.filter((item) => item.usuarioId === currentUser.id);
  const mySubscriptions = data.assinaturas
    .filter((item) => item.usuarioId === currentUser.id)
    .sort((a, b) => new Date(b.dataFim).getTime() - new Date(a.dataFim).getTime());
  const activeSubscription = mySubscriptions[0];
  const activePlan = activeSubscription ? data.planos.find((item) => item.id === activeSubscription.planoId) : undefined;
  const subscriptionPayments = activeSubscription ? data.pagamentos.filter((item) => item.assinaturaId === activeSubscription.id) : [];
  const instructorCourseIds = new Set(myCourses.map((curso) => curso.id));
  const instructorReviews = data.avaliacoes.filter((item) => instructorCourseIds.has(item.cursoId));

  return (
    <>
      <section className="page-title">
        <div>
          <p className="eyebrow">Painel</p>
          <h1 className="display-5 fw-bold mb-0">{currentUser.nomeCompleto}</h1>
          <p className="lead-copy mt-2 mb-0">Perfil: {currentUser.tipo}</p>
        </div>
        {currentUser.tipo === "instrutor" ? (
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/cursos/novo">
              <PlusCircle size={18} aria-hidden="true" /> Novo curso
            </Link>
            <Link className="btn btn-outline-primary" to="/gestao">
              <Layers size={18} aria-hidden="true" /> Gestao academica
            </Link>
          </div>
        ) : (
          <Link className="btn btn-primary" to="/">
            Explorar catalogo
          </Link>
        )}
      </section>

      {currentUser.tipo === "instrutor" ? (
        <>
          <section className="row g-3 mb-4">
            <div className="col-md-4">
              <StatCard icon={BookOpen} label="Cursos publicados" value={myCourses.length} />
            </div>
            <div className="col-md-4">
              <StatCard
                icon={Users}
                label="Matriculas recebidas"
                value={data.matriculas.filter((item) => instructorCourseIds.has(item.cursoId)).length}
              />
            </div>
            <div className="col-md-4">
              <StatCard icon={Award} label="Media das avaliacoes" value={averageRating(instructorReviews) ?? "Sem nota"} />
            </div>
          </section>
          <section className="section-block mt-0">
            <div className="page-title mb-3">
              <div>
                <p className="eyebrow">Instrutor</p>
                <h2 className="h3 mb-0">Seus cursos</h2>
              </div>
            </div>
            <div className="row g-4">
              {myCourses.map((curso) => (
                <div className="col-md-6 col-xl-4" key={curso.id}>
                  <CourseCard
                    curso={curso}
                    categoria={getCategoria(curso)}
                    instrutor={getInstrutor(curso)}
                    totalMatriculas={getTotalMatriculas(curso)}
                    mediaAvaliacao={getMedia(curso)}
                  />
                </div>
              ))}
            </div>
            {!myCourses.length ? (
              <div className="mt-4">
                <EmptyState title="Nenhum curso publicado" description="Crie seu primeiro curso para cadastrar modulos e aulas." />
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <>
          <section className="row g-3 mb-4">
            <div className="col-md-4">
              <StatCard icon={BookOpen} label="Cursos matriculados" value={enrolledCourses.length} />
            </div>
            <div className="col-md-4">
              <StatCard icon={Award} label="Certificados" value={myCertificates.length} />
            </div>
            <div className="col-md-4">
              <StatCard icon={CreditCard} label="Assinaturas" value={mySubscriptions.length} />
            </div>
          </section>

          <section className="row g-4">
            <div className="col-lg-5">
              <article className="card h-100 shadow-sm">
                <div className="card-body">
                  <h2 className="h4">Assinatura ativa</h2>
                  {activeSubscription && activePlan ? (
                    <>
                      <p className="text-secondary mb-2">
                        Plano <strong>{activePlan.nome}</strong> ate {formatDate(activeSubscription.dataFim)}.
                      </p>
                      <p className="fs-5 fw-bold">{formatCurrency(activePlan.preco)}</p>
                      {subscriptionPayments.map((pagamento) => (
                        <div className="border-top pt-3 mt-3" key={pagamento.id}>
                          <p className="small text-secondary mb-1">Pagamento: {pagamento.metodoPagamento}</p>
                          <p className="small text-secondary mb-0">Transacao: {pagamento.idTransacaoGateway}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <p className="text-secondary">Voce ainda nao possui assinatura registrada.</p>
                      <Link className="btn btn-outline-primary" to="/">
                        Ver planos
                      </Link>
                    </>
                  )}
                </div>
              </article>
            </div>
            <div className="col-lg-7">
              <article className="card h-100 shadow-sm">
                <div className="card-body">
                  <h2 className="h4">Certificados emitidos</h2>
                  {myCertificates.length ? (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Curso</th>
                            <th>Codigo</th>
                            <th>Emissao</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myCertificates.map((certificado) => {
                            const curso = data.cursos.find((item) => item.id === certificado.cursoId);
                            return (
                              <tr key={certificado.id}>
                                <td>{curso?.titulo}</td>
                                <td>
                                  <span className="badge text-bg-warning">{certificado.codigoVerificacao}</span>
                                </td>
                                <td>{formatDateTime(certificado.dataEmissao)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-secondary mb-0">Conclua todas as aulas de um curso para emitir certificado.</p>
                  )}
                </div>
              </article>
            </div>
          </section>

          <section className="section-block">
            <div className="page-title mb-3">
              <div>
                <p className="eyebrow">Aprendizado</p>
                <h2 className="h3 mb-0">Cursos matriculados</h2>
              </div>
            </div>
            <div className="row g-4">
              {enrolledCourses.map((curso) => (
                <div className="col-md-6 col-xl-4" key={curso.id}>
                  <CourseCard
                    curso={curso}
                    categoria={getCategoria(curso)}
                    instrutor={getInstrutor(curso)}
                    totalMatriculas={getTotalMatriculas(curso)}
                    mediaAvaliacao={getMedia(curso)}
                    progresso={courseProgress(curso)}
                  />
                </div>
              ))}
            </div>
            {!enrolledCourses.length ? (
              <div className="mt-4">
                <EmptyState title="Nenhuma matricula" description="Entre no catalogo para se matricular no primeiro curso." />
              </div>
            ) : null}
          </section>
        </>
      )}
    </>
  );
}
