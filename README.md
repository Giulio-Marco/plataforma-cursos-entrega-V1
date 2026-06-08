# Plataforma de Cursos Online - React

Continuidade do projeto de plataforma de cursos, agora implementada em React com TypeScript, Bootstrap 5, React Router e consumo de API com JSON Server.

O projeto Flask original foi mantido no repositorio, mas a entrega principal desta etapa esta na aplicacao React em `src/` e na base `db.json`.

## Funcionalidades

- Catalogo de cursos com busca e filtro por categoria.
- Cadastro e login simulado de usuarios.
- Painel de aluno com matriculas, progresso, assinatura e certificados.
- Painel de instrutor com cursos publicados.
- Cadastro de categorias, cursos, trilhas e planos.
- Cadastro de modulos e aulas dentro do detalhe do curso.
- Matricula em curso, conclusao de aulas e emissao visual de certificado.
- Avaliacao de cursos por alunos matriculados.
- Checkout simples com assinatura e pagamento gravados no JSON Server.

## Estrutura

- `src/components`: componentes reutilizaveis com Bootstrap.
- `src/pages`: telas roteadas da aplicacao.
- `src/model`: interfaces TypeScript do modelo de dados.
- `src/services`: consumo da API e hook de carregamento.
- `src/context`: contexto de autenticacao simulada.
- `src/utils`: formatacao, datas e geradores de codigos.
- `db.json`: dados da API usada pelo JSON Server.

## Requisitos

- Node.js 20 ou superior.
- npm 10 ou superior.

## Como instalar

```bash
npm install
```

## Como rodar

Em um unico comando:

```bash
npm start
```

Ou em dois terminais:

```bash
npm run api
npm run dev
```

Depois acesse:

- Aplicacao React: `http://127.0.0.1:5173`
- JSON Server: `http://localhost:3001`

## Build

```bash
npm run build
```

## Usuarios de exemplo

- Instrutor: `daniel@cursos.com` / `123456`
- Aluno: `carlos@cursos.com` / `123456`
- Aluno com certificado: `joao@cursos.com` / `123456`

## Entrega no GitHub

Suba o repositorio com os arquivos React e o `db.json`:

```bash
git add .
git commit -m "Implementa plataforma de cursos em React"
git push
```
