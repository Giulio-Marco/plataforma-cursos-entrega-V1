export type PerfilUsuario = "aluno" | "instrutor";
export type NivelCurso = "Iniciante" | "Intermediario" | "Avancado";
export type TipoConteudo = "Video" | "Texto" | "Quiz";
export type StatusAula = "Concluido";

export interface Usuario {
  id: number;
  nomeCompleto: string;
  email: string;
  senhaHash: string;
  dataCadastro: string;
  tipo: PerfilUsuario;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
}

export interface Curso {
  id: number;
  titulo: string;
  descricao: string;
  instrutorId: number;
  categoriaId: number;
  nivel: NivelCurso;
  dataPublicacao: string;
  totalAulas: number;
  totalHoras: number;
  imagemUrl: string;
}

export interface Modulo {
  id: number;
  cursoId: number;
  titulo: string;
  ordem: number;
}

export interface Aula {
  id: number;
  moduloId: number;
  titulo: string;
  tipoConteudo: TipoConteudo;
  urlConteudo: string;
  duracaoMinutos: number;
  ordem: number;
}

export interface Matricula {
  id: number;
  usuarioId: number;
  cursoId: number;
  dataMatricula: string;
  dataConclusao: string | null;
}

export interface ProgressoAula {
  id: number;
  usuarioId: number;
  aulaId: number;
  dataConclusao: string;
  status: StatusAula;
}

export interface Avaliacao {
  id: number;
  usuarioId: number;
  cursoId: number;
  nota: number;
  comentario: string;
  dataAvaliacao: string;
}

export interface Trilha {
  id: number;
  titulo: string;
  descricao: string;
  categoriaId: number;
}

export interface TrilhaCurso {
  id: number;
  trilhaId: number;
  cursoId: number;
  ordem: number;
}

export interface Certificado {
  id: number;
  usuarioId: number;
  cursoId: number;
  trilhaId: number | null;
  codigoVerificacao: string;
  dataEmissao: string;
}

export interface Plano {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMeses: number;
}

export interface Assinatura {
  id: number;
  usuarioId: number;
  planoId: number;
  dataInicio: string;
  dataFim: string;
}

export interface Pagamento {
  id: number;
  assinaturaId: number;
  valorPago: number;
  dataPagamento: string;
  metodoPagamento: string;
  idTransacaoGateway: string;
  dataFim: string;
}

export interface AcademyData {
  usuarios: Usuario[];
  categorias: Categoria[];
  cursos: Curso[];
  modulos: Modulo[];
  aulas: Aula[];
  matriculas: Matricula[];
  progressoAulas: ProgressoAula[];
  avaliacoes: Avaliacao[];
  trilhas: Trilha[];
  trilhasCursos: TrilhaCurso[];
  certificados: Certificado[];
  planos: Plano[];
  assinaturas: Assinatura[];
  pagamentos: Pagamento[];
}
