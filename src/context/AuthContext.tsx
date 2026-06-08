import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PerfilUsuario, Usuario } from "../model";
import { api } from "../services/api";
import { nowIso } from "../utils/format";

interface RegisterInput {
  nomeCompleto: string;
  email: string;
  senha: string;
  tipo: PerfilUsuario;
}

interface AuthContextValue {
  currentUser: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  register: (payload: RegisterInput) => Promise<Usuario>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const STORAGE_KEY = "labCursos.currentUserId";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const storedId = Number(localStorage.getItem(STORAGE_KEY));

    if (!storedId) {
      setCurrentUser(null);
      return;
    }

    try {
      const user = await api.getUsuario(storedId);
      setCurrentUser(user);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, senha: string) => {
    const usuarios = await api.listUsuarios();
    const user = usuarios.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.senhaHash === senha,
    );

    if (!user) {
      throw new Error("E-mail ou senha invalidos.");
    }

    localStorage.setItem(STORAGE_KEY, String(user.id));
    setCurrentUser(user);
    return user;
  };

  const register = async (payload: RegisterInput) => {
    const usuarios = await api.listUsuarios();
    const email = payload.email.trim().toLowerCase();

    if (usuarios.some((item) => item.email.toLowerCase() === email)) {
      throw new Error("Ja existe uma conta com esse e-mail.");
    }

    if (payload.senha.length < 6) {
      throw new Error("A senha precisa ter pelo menos 6 caracteres.");
    }

    const created = await api.createUsuario({
      nomeCompleto: payload.nomeCompleto.trim(),
      email,
      senhaHash: payload.senha,
      tipo: payload.tipo,
      dataCadastro: nowIso(),
    });

    localStorage.setItem(STORAGE_KEY, String(created.id));
    setCurrentUser(created);
    return created;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({ currentUser, loading, login, register, logout, refreshUser }),
    [currentUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
