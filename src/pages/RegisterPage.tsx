import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { PerfilUsuario } from "../model";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipo, setTipo] = useState<PerfilUsuario>("aluno");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (senha !== confirmarSenha) {
      setError("As senhas nao coincidem.");
      return;
    }

    setSubmitting(true);

    try {
      await register({ nomeCompleto, email, senha, tipo });
      navigate("/painel");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel cadastrar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="row justify-content-center align-items-start g-4">
      <div className="col-lg-5">
        <p className="eyebrow">Cadastro</p>
        <h1 className="display-6 fw-bold text-balance">Crie uma conta e escolha seu perfil.</h1>
        <p className="lead-copy">O cadastro grava um novo usuario no JSON Server e ja deixa a sessao simulada ativa no navegador.</p>
      </div>

      <div className="col-lg-5">
        <form className="card auth-card shadow-sm ms-lg-auto" onSubmit={handleSubmit}>
          <div className="card-body p-4">
            <h2 className="h4 mb-4">Criar conta</h2>
            {error ? <div className="alert alert-danger">{error}</div> : null}
            <div className="mb-3">
              <label className="form-label fw-semibold" htmlFor="nomeCompleto">
                Nome completo
              </label>
              <input
                className="form-control"
                id="nomeCompleto"
                value={nomeCompleto}
                onChange={(event) => setNomeCompleto(event.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" htmlFor="email">
                E-mail
              </label>
              <input
                className="form-control"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" htmlFor="tipo">
                Perfil
              </label>
              <select className="form-select" id="tipo" value={tipo} onChange={(event) => setTipo(event.target.value as PerfilUsuario)}>
                <option value="aluno">Aluno</option>
                <option value="instrutor">Instrutor</option>
              </select>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="senha">
                  Senha
                </label>
                <input
                  className="form-control"
                  id="senha"
                  type="password"
                  value={senha}
                  minLength={6}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="confirmarSenha">
                  Confirmar senha
                </label>
                <input
                  className="form-control"
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  minLength={6}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  required
                />
              </div>
            </div>
            <button className="btn btn-primary w-100 mt-4" disabled={submitting}>
              {submitting ? "Salvando..." : "Criar conta"}
            </button>
            <p className="text-center text-secondary small mb-0 mt-3">
              Ja tem cadastro? <Link to="/login">Entrar</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
