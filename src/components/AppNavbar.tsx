import { BookOpen, Layers, LogIn, LogOut, PlusCircle, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AppNavbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar navbar-expand-lg bg-white border-bottom sticky-top app-navbar">
      <div className="container py-2">
        <NavLink className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <span className="brand-mark">LAB</span>
          Cursos Online
        </NavLink>
        <nav className="ms-lg-auto d-flex flex-wrap align-items-center gap-2">
          <NavLink className="nav-link app-nav-link" to="/">
            <BookOpen size={18} aria-hidden="true" /> Catalogo
          </NavLink>
          {currentUser ? (
            <>
              <NavLink className="nav-link app-nav-link" to="/painel">
                <UserRound size={18} aria-hidden="true" /> Painel
              </NavLink>
              {currentUser.tipo === "instrutor" ? (
                <>
                  <NavLink className="nav-link app-nav-link" to="/cursos/novo">
                    <PlusCircle size={18} aria-hidden="true" /> Novo curso
                  </NavLink>
                  <NavLink className="nav-link app-nav-link" to="/gestao">
                    <Layers size={18} aria-hidden="true" /> Gestao
                  </NavLink>
                </>
              ) : null}
              <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2" onClick={handleLogout}>
                <LogOut size={16} aria-hidden="true" /> Sair
              </button>
            </>
          ) : (
            <>
              <NavLink className="nav-link app-nav-link" to="/login">
                <LogIn size={18} aria-hidden="true" /> Entrar
              </NavLink>
              <NavLink className="btn btn-primary btn-sm" to="/cadastro">
                Criar conta
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
