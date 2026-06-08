import type {
  Assinatura,
  Aula,
  Avaliacao,
  Categoria,
  Certificado,
  Curso,
  Matricula,
  Modulo,
  Pagamento,
  Plano,
  ProgressoAula,
  Trilha,
  TrilhaCurso,
  Usuario,
} from "../model";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Erro na API (${response.status}) em ${path}`);
  }

  return response.json() as Promise<T>;
}

function list<T>(resource: string): Promise<T[]> {
  return request<T[]>(`/${resource}`);
}

function getById<T>(resource: string, id: number): Promise<T> {
  return request<T>(`/${resource}/${id}`);
}

function create<T, TPayload>(resource: string, payload: TPayload): Promise<T> {
  return request<T>(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function patch<T, TPayload>(resource: string, id: number, payload: TPayload): Promise<T> {
  return request<T>(`/${resource}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export const api = {
  listUsuarios: () => list<Usuario>("usuarios"),
  getUsuario: (id: number) => getById<Usuario>("usuarios", id),
  createUsuario: (payload: Omit<Usuario, "id">) => create<Usuario, Omit<Usuario, "id">>("usuarios", payload),
  listCategorias: () => list<Categoria>("categorias"),
  createCategoria: (payload: Omit<Categoria, "id">) =>
    create<Categoria, Omit<Categoria, "id">>("categorias", payload),
  listCursos: () => list<Curso>("cursos"),
  createCurso: (payload: Omit<Curso, "id">) => create<Curso, Omit<Curso, "id">>("cursos", payload),
  patchCurso: (id: number, payload: Partial<Curso>) => patch<Curso, Partial<Curso>>("cursos", id, payload),
  listModulos: () => list<Modulo>("modulos"),
  createModulo: (payload: Omit<Modulo, "id">) => create<Modulo, Omit<Modulo, "id">>("modulos", payload),
  listAulas: () => list<Aula>("aulas"),
  createAula: (payload: Omit<Aula, "id">) => create<Aula, Omit<Aula, "id">>("aulas", payload),
  listMatriculas: () => list<Matricula>("matriculas"),
  createMatricula: (payload: Omit<Matricula, "id">) =>
    create<Matricula, Omit<Matricula, "id">>("matriculas", payload),
  patchMatricula: (id: number, payload: Partial<Matricula>) =>
    patch<Matricula, Partial<Matricula>>("matriculas", id, payload),
  listProgressoAulas: () => list<ProgressoAula>("progressoAulas"),
  createProgressoAula: (payload: Omit<ProgressoAula, "id">) =>
    create<ProgressoAula, Omit<ProgressoAula, "id">>("progressoAulas", payload),
  listAvaliacoes: () => list<Avaliacao>("avaliacoes"),
  createAvaliacao: (payload: Omit<Avaliacao, "id">) =>
    create<Avaliacao, Omit<Avaliacao, "id">>("avaliacoes", payload),
  patchAvaliacao: (id: number, payload: Partial<Avaliacao>) =>
    patch<Avaliacao, Partial<Avaliacao>>("avaliacoes", id, payload),
  listTrilhas: () => list<Trilha>("trilhas"),
  createTrilha: (payload: Omit<Trilha, "id">) => create<Trilha, Omit<Trilha, "id">>("trilhas", payload),
  listTrilhasCursos: () => list<TrilhaCurso>("trilhasCursos"),
  createTrilhaCurso: (payload: Omit<TrilhaCurso, "id">) =>
    create<TrilhaCurso, Omit<TrilhaCurso, "id">>("trilhasCursos", payload),
  listCertificados: () => list<Certificado>("certificados"),
  createCertificado: (payload: Omit<Certificado, "id">) =>
    create<Certificado, Omit<Certificado, "id">>("certificados", payload),
  listPlanos: () => list<Plano>("planos"),
  getPlano: (id: number) => getById<Plano>("planos", id),
  createPlano: (payload: Omit<Plano, "id">) => create<Plano, Omit<Plano, "id">>("planos", payload),
  listAssinaturas: () => list<Assinatura>("assinaturas"),
  createAssinatura: (payload: Omit<Assinatura, "id">) =>
    create<Assinatura, Omit<Assinatura, "id">>("assinaturas", payload),
  listPagamentos: () => list<Pagamento>("pagamentos"),
  createPagamento: (payload: Omit<Pagamento, "id">) =>
    create<Pagamento, Omit<Pagamento, "id">>("pagamentos", payload),
};
