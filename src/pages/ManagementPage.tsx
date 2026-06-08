import { FormEvent, useState } from "react";
import { LoadingState } from "../components/LoadingState";
import { api } from "../services/api";
import { useAcademyData } from "../services/useAcademyData";
import { formatCurrency, formatDateTime } from "../utils/format";

type Tab = "categorias" | "trilhas" | "planos";

export function ManagementPage() {
  const data = useAcademyData();
  const [tab, setTab] = useState<Tab>("categorias");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (data.loading) {
    return <LoadingState />;
  }

  if (data.error) {
    return <div className="alert alert-danger">Nao foi possivel carregar a gestao: {data.error}</div>;
  }

  const runAction = async (action: () => Promise<string>) => {
    setBusy(true);
    setMessage("");
    setErrorMessage("");

    try {
      const feedback = await action();
      setMessage(feedback);
      await data.reload();
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Nao foi possivel salvar.");
    } finally {
      setBusy(false);
    }
  };

  const handleCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nome = String(form.get("nome") ?? "").trim();
    const descricao = String(form.get("descricao") ?? "").trim();

    if (!nome) {
      setErrorMessage("Informe o nome da categoria.");
      return;
    }

    void runAction(async () => {
      await api.createCategoria({ nome, descricao });
      event.currentTarget.reset();
      return "Categoria cadastrada.";
    });
  };

  const handleTrailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const titulo = String(form.get("titulo") ?? "").trim();
    const descricao = String(form.get("descricao") ?? "").trim();
    const categoriaId = Number(form.get("categoriaId") ?? 0);

    if (!titulo || !categoriaId || !selectedCourses.length) {
      setErrorMessage("Preencha titulo, categoria e pelo menos um curso da trilha.");
      return;
    }

    void runAction(async () => {
      const trilha = await api.createTrilha({ titulo, descricao, categoriaId });
      await Promise.all(
        selectedCourses.map((cursoId, index) =>
          api.createTrilhaCurso({
            trilhaId: trilha.id,
            cursoId,
            ordem: index + 1,
          }),
        ),
      );
      setSelectedCourses([]);
      event.currentTarget.reset();
      return "Trilha cadastrada.";
    });
  };

  const handlePlanSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nome = String(form.get("nome") ?? "").trim();
    const descricao = String(form.get("descricao") ?? "").trim();
    const preco = Number(form.get("preco") ?? 0);
    const duracaoMeses = Number(form.get("duracaoMeses") ?? 1);

    if (!nome || preco <= 0 || duracaoMeses <= 0) {
      setErrorMessage("Preencha nome, preco e duracao do plano.");
      return;
    }

    void runAction(async () => {
      await api.createPlano({ nome, descricao, preco, duracaoMeses });
      event.currentTarget.reset();
      return "Plano cadastrado.";
    });
  };

  const toggleCourse = (courseId: number) => {
    setSelectedCourses((current) =>
      current.includes(courseId) ? current.filter((item) => item !== courseId) : [...current, courseId],
    );
  };

  const getCategoria = (categoriaId: number) => data.categorias.find((item) => item.id === categoriaId);
  const coursesForTrail = (trilhaId: number) =>
    data.trilhasCursos
      .filter((item) => item.trilhaId === trilhaId)
      .map((item) => data.cursos.find((curso) => curso.id === item.cursoId))
      .filter(Boolean);

  return (
    <>
      <section className="page-title">
        <div>
          <p className="eyebrow">Gestao academica</p>
          <h1 className="display-5 fw-bold mb-0">Categorias, trilhas e planos</h1>
          <p className="lead-copy mt-2 mb-0">Cadastre dados de apoio consumidos pelas telas da plataforma via JSON Server.</p>
        </div>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

      <div className="d-flex flex-wrap gap-2 management-tabs mb-4" role="tablist">
        <button
          className={`btn ${tab === "categorias" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setTab("categorias")}
          type="button"
        >
          Categorias
        </button>
        <button
          className={`btn ${tab === "trilhas" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setTab("trilhas")}
          type="button"
        >
          Trilhas
        </button>
        <button className={`btn ${tab === "planos" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("planos")} type="button">
          Planos
        </button>
      </div>

      {tab === "categorias" ? (
        <section className="row g-4">
          <div className="col-lg-5">
            <form className="card shadow-sm" onSubmit={handleCategorySubmit}>
              <div className="card-body">
                <h2 className="h4">Nova categoria</h2>
                <div className="mb-3">
                  <label className="form-label" htmlFor="categoria-nome">
                    Nome
                  </label>
                  <input className="form-control" id="categoria-nome" name="nome" placeholder="Ex.: Front-end" required />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="categoria-descricao">
                    Descricao
                  </label>
                  <textarea className="form-control" id="categoria-descricao" name="descricao" rows={4} />
                </div>
                <button className="btn btn-primary" disabled={busy}>
                  Salvar categoria
                </button>
              </div>
            </form>
          </div>
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h4">Categorias cadastradas</h2>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Descricao</th>
                        <th>Cursos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.categorias.map((categoria) => (
                        <tr key={categoria.id}>
                          <td>{categoria.nome}</td>
                          <td>{categoria.descricao}</td>
                          <td>{data.cursos.filter((curso) => curso.categoriaId === categoria.id).length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "trilhas" ? (
        <section className="row g-4">
          <div className="col-lg-5">
            <form className="card shadow-sm" onSubmit={handleTrailSubmit}>
              <div className="card-body">
                <h2 className="h4">Nova trilha</h2>
                <div className="mb-3">
                  <label className="form-label" htmlFor="trilha-titulo">
                    Titulo
                  </label>
                  <input className="form-control" id="trilha-titulo" name="titulo" required />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="trilha-categoria">
                    Categoria
                  </label>
                  <select className="form-select" id="trilha-categoria" name="categoriaId" defaultValue="" required>
                    <option value="" disabled>
                      Selecione
                    </option>
                    {data.categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="trilha-descricao">
                    Descricao
                  </label>
                  <textarea className="form-control" id="trilha-descricao" name="descricao" rows={3} />
                </div>
                <fieldset className="mb-3">
                  <legend className="form-label fs-6">Cursos da trilha</legend>
                  <div className="vstack gap-2">
                    {data.cursos.map((curso) => (
                      <label className="form-check" key={curso.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedCourses.includes(curso.id)}
                          onChange={() => toggleCourse(curso.id)}
                        />
                        <span className="form-check-label">{curso.titulo}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button className="btn btn-primary" disabled={busy}>
                  Salvar trilha
                </button>
              </div>
            </form>
          </div>
          <div className="col-lg-7">
            <div className="vstack gap-3">
              {data.trilhas.map((trilha) => (
                <article className="card shadow-sm" key={trilha.id}>
                  <div className="card-body">
                    <span className="badge text-bg-primary-subtle text-primary-emphasis">{getCategoria(trilha.categoriaId)?.nome}</span>
                    <h3 className="h5 mt-3">{trilha.titulo}</h3>
                    <p className="text-secondary">{trilha.descricao}</p>
                    <ol className="trail-course-list">
                      {coursesForTrail(trilha.id).map((curso) => (
                        <li key={curso!.id}>{curso!.titulo}</li>
                      ))}
                    </ol>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "planos" ? (
        <section className="row g-4">
          <div className="col-lg-5">
            <form className="card shadow-sm" onSubmit={handlePlanSubmit}>
              <div className="card-body">
                <h2 className="h4">Novo plano</h2>
                <div className="mb-3">
                  <label className="form-label" htmlFor="plano-nome">
                    Nome
                  </label>
                  <input className="form-control" id="plano-nome" name="nome" required />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="plano-descricao">
                    Descricao
                  </label>
                  <textarea className="form-control" id="plano-descricao" name="descricao" rows={3} />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="plano-preco">
                      Preco
                    </label>
                    <input className="form-control" id="plano-preco" name="preco" type="number" min="1" step="0.01" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="plano-duracao">
                      Meses
                    </label>
                    <input className="form-control" id="plano-duracao" name="duracaoMeses" type="number" min="1" defaultValue="1" required />
                  </div>
                </div>
                <button className="btn btn-primary mt-3" disabled={busy}>
                  Salvar plano
                </button>
              </div>
            </form>
          </div>
          <div className="col-lg-7">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h4">Planos cadastrados</h2>
                <div className="row g-3">
                  {data.planos.map((plano) => (
                    <div className="col-md-6" key={plano.id}>
                      <div className="border rounded-3 p-3 h-100">
                        <span className="badge text-bg-warning">{plano.duracaoMeses} mes(es)</span>
                        <h3 className="h5 mt-2">{plano.nome}</h3>
                        <p className="text-secondary small">{plano.descricao}</p>
                        <strong>{formatCurrency(plano.preco)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h4">Pagamentos registrados</h2>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Metodo</th>
                        <th>Valor</th>
                        <th>Transacao</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pagamentos.map((pagamento) => (
                        <tr key={pagamento.id}>
                          <td>{pagamento.metodoPagamento}</td>
                          <td>{formatCurrency(pagamento.valorPago)}</td>
                          <td>{pagamento.idTransacaoGateway}</td>
                          <td>{formatDateTime(pagamento.dataPagamento)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
