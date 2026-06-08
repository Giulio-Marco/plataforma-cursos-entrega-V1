import { useCallback, useEffect, useState } from "react";
import type { AcademyData } from "../model";
import { api } from "./api";

const emptyData: AcademyData = {
  usuarios: [],
  categorias: [],
  cursos: [],
  modulos: [],
  aulas: [],
  matriculas: [],
  progressoAulas: [],
  avaliacoes: [],
  trilhas: [],
  trilhasCursos: [],
  certificados: [],
  planos: [],
  assinaturas: [],
  pagamentos: [],
};

export function useAcademyData() {
  const [data, setData] = useState<AcademyData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        usuarios,
        categorias,
        cursos,
        modulos,
        aulas,
        matriculas,
        progressoAulas,
        avaliacoes,
        trilhas,
        trilhasCursos,
        certificados,
        planos,
        assinaturas,
        pagamentos,
      ] = await Promise.all([
        api.listUsuarios(),
        api.listCategorias(),
        api.listCursos(),
        api.listModulos(),
        api.listAulas(),
        api.listMatriculas(),
        api.listProgressoAulas(),
        api.listAvaliacoes(),
        api.listTrilhas(),
        api.listTrilhasCursos(),
        api.listCertificados(),
        api.listPlanos(),
        api.listAssinaturas(),
        api.listPagamentos(),
      ]);

      setData({
        usuarios: usuarios.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)),
        categorias: categorias.sort((a, b) => a.nome.localeCompare(b.nome)),
        cursos: cursos.sort((a, b) => b.id - a.id),
        modulos: modulos.sort((a, b) => a.ordem - b.ordem),
        aulas: aulas.sort((a, b) => a.ordem - b.ordem),
        matriculas,
        progressoAulas,
        avaliacoes,
        trilhas: trilhas.sort((a, b) => a.titulo.localeCompare(b.titulo)),
        trilhasCursos: trilhasCursos.sort((a, b) => a.ordem - b.ordem),
        certificados,
        planos: planos.sort((a, b) => a.preco - b.preco),
        assinaturas,
        pagamentos,
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Nao foi possivel carregar os dados.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    ...data,
    loading,
    error,
    reload,
  };
}
