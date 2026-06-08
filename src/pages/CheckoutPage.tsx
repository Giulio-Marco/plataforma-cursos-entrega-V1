import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { useAcademyData } from "../services/useAcademyData";
import { addMonthsIso, formatCurrency, formatDate, generateTransactionId, nowIso } from "../utils/format";

export function CheckoutPage() {
  const { planoId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { planos, loading, error } = useAcademyData();
  const [metodoPagamento, setMetodoPagamento] = useState("Cartao de Credito");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const plano = planos.find((item) => item.id === Number(planoId));

  if (loading || !currentUser) {
    return <LoadingState />;
  }

  if (error) {
    return <div className="alert alert-danger">Nao foi possivel carregar o checkout: {error}</div>;
  }

  if (!plano) {
    return (
      <div className="alert alert-warning">
        Plano nao encontrado. <Link to="/">Voltar ao catalogo</Link>
      </div>
    );
  }

  const dataInicio = new Date();
  const dataFim = addMonthsIso(dataInicio, plano.duracaoMeses);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const assinatura = await api.createAssinatura({
        usuarioId: currentUser.id,
        planoId: plano.id,
        dataInicio: dataInicio.toISOString(),
        dataFim,
      });
      await api.createPagamento({
        assinaturaId: assinatura.id,
        valorPago: plano.preco,
        dataPagamento: nowIso(),
        metodoPagamento,
        idTransacaoGateway: generateTransactionId(),
        dataFim,
      });
      navigate("/painel");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Nao foi possivel concluir o pagamento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-title">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 className="display-5 fw-bold mb-0">Assinar {plano.nome}</h1>
          <p className="lead-copy mt-2 mb-0">O pagamento cria registros de assinatura e transacao no JSON Server.</p>
        </div>
      </section>

      <section className="row g-4">
        <div className="col-lg-5">
          <article className="card shadow-sm">
            <div className="card-body p-4">
              <span className="badge text-bg-warning">{plano.duracaoMeses} mes(es)</span>
              <h2 className="h3 mt-3">{plano.nome}</h2>
              <p className="text-secondary">{plano.descricao}</p>
              <p className="display-6 fw-bold">{formatCurrency(plano.preco)}</p>
              <div className="border-top pt-3 text-secondary">
                <p className="mb-1">Inicio: {formatDate(dataInicio.toISOString())}</p>
                <p className="mb-0">Fim: {formatDate(dataFim)}</p>
              </div>
            </div>
          </article>
        </div>

        <div className="col-lg-7">
          <form className="card shadow-sm" onSubmit={handleSubmit}>
            <div className="card-body p-4">
              <h2 className="h4">Dados do pagamento</h2>
              {message ? <div className="alert alert-danger">{message}</div> : null}
              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="metodoPagamento">
                  Metodo de pagamento
                </label>
                <select
                  className="form-select"
                  id="metodoPagamento"
                  value={metodoPagamento}
                  onChange={(event) => setMetodoPagamento(event.target.value)}
                >
                  <option value="Cartao de Credito">Cartao de Credito</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>
              <div className="alert alert-light border">
                <strong>Aluno/usuario:</strong> {currentUser.nomeCompleto}
                <br />
                <strong>Total:</strong> {formatCurrency(plano.preco)}
              </div>
              <div className="d-flex justify-content-end gap-2">
                <Link className="btn btn-outline-secondary" to="/">
                  Cancelar
                </Link>
                <button className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Processando..." : "Confirmar pagamento"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
