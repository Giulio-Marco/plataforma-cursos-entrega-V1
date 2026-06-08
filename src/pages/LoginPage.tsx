import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("carlos@cursos.com");
  const [senha, setSenha] = useState("123456");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/painel";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, senha);
      navigate(from, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel entrar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="row justify-content-center align-items-start g-4">
      <div className="col-lg-5">
        <p className="eyebrow">Acesso</p>
        <h1 className="display-6 fw-bold text-balance">Entre para acessar o painel da plataforma.</h1>
        <p className="lead-copy">
          Alunos acompanham progresso e certificados. Instrutores cadastram cursos, modulos, aulas, categorias e trilhas.
        </p>
        <div className="alert alert-info">
          Usuarios demo: <strong>carlos@cursos.com</strong> ou <strong>daniel@cursos.com</strong>. Senha:{" "}
          <strong>123456</strong>.
        </div>
      </div>

      <div className="col-lg-5">
        <form className="card auth-card shadow-sm ms-lg-auto" onSubmit={handleSubmit}>
          <div className="card-body p-4">
            <h2 className="h4 mb-4">Login</h2>
            {error ? <div className="alert alert-danger">{error}</div> : null}
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
            <div className="mb-4">
              <label className="form-label fw-semibold" htmlFor="senha">
                Senha
              </label>
              <input
                className="form-control"
                id="senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </button>
            <p className="text-center text-secondary small mb-0 mt-3">
              Ainda nao tem conta? <Link to="/cadastro">Criar cadastro</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
