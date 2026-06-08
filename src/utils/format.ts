import type { Aula, Avaliacao, Categoria } from "../model";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "Pendente";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function averageRating(avaliacoes: Avaliacao[]): number | null {
  if (!avaliacoes.length) {
    return null;
  }

  const total = avaliacoes.reduce((sum, item) => sum + item.nota, 0);
  return Number((total / avaliacoes.length).toFixed(1));
}

export function sumHours(aulas: Aula[]): number {
  const minutes = aulas.reduce((sum, aula) => sum + aula.duracaoMinutos, 0);
  return Number((minutes / 60).toFixed(1));
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function addMonthsIso(base: Date, months: number): string {
  const copy = new Date(base);
  copy.setMonth(copy.getMonth() + months);
  return copy.toISOString();
}

export function generateTransactionId(): string {
  return `TRX-${Math.random().toString(16).slice(2, 10).toUpperCase()}${Date.now()
    .toString()
    .slice(-4)}`;
}

export function generateCertificateCode(): string {
  return `CERT-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now()
    .toString()
    .slice(-5)}`;
}

export function courseImageForCategory(categoria?: Categoria): string {
  const name = categoria?.nome.toLowerCase() ?? "";

  if (name.includes("banco") || name.includes("dados")) {
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80";
  }

  if (name.includes("arquitetura") || name.includes("software")) {
    return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80";
  }

  return "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80";
}
