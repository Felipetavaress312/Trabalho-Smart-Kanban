  Smart Kanban

Projeto desenvolvido para a disciplina de Projeto Integrador da faculdade.

O Smart Kanban é um gerenciador de tarefas que permite criar, organizar e acompanhar atividades em um quadro Kanban. Além das funções tradicionais, o sistema utiliza Inteligência Artificial para gerar automaticamente um planejamento da tarefa, dividindo-a em subtarefas e estimando o tempo necessário para cada etapa.

---

  Funcionalidades

- Cadastro e login de usuários
- Criar tarefas
- Editar tarefas
- Excluir tarefas
- Mover tarefas entre as colunas:
  - A Fazer
  - Fazendo
  - Concluído
- Sistema de Desfazer (Ctrl + Z)
- Auto-Planejamento utilizando Inteligência Artificial
- Checklist de subtarefas
- Painel com indicadores de produtividade

---

 Tecnologias utilizadas

- TypeScript
- React
- TanStack Start
- Tailwind CSS
- PostgreSQL
- Inteligência Artificial (LLM)
- Vitest

---

 Estrutura do projeto

O projeto foi desenvolvido seguindo os cinco pilares propostos pela disciplina:

  Estruturas de Dados

Foram utilizadas duas estruturas principais:

- Lista Duplamente Encadeada
- Pilha (Stack)

A lista encadeada é responsável pela navegação entre as colunas do Kanban, enquanto a pilha é utilizada para implementar o recurso de desfazer ações (Ctrl + Z).

---

  Programação Orientada a Objetos

O sistema foi estruturado utilizando conceitos de POO como:

- Encapsulamento
- Herança
- Polimorfismo
- Composição
- Classes abstratas

Principais classes:

- Usuario
- Quadro
- Coluna
- Tarefa
- Acao

---

 Banco de Dados

Foi utilizado PostgreSQL para armazenar todas as informações do sistema.

Principais tabelas:

- tarefas
- subtarefas

Todos os dados permanecem salvos mesmo após atualizar a página.

---

  CRUD

O sistema possui todas as operações básicas de um banco de dados:

- Create
- Read
- Update
- Delete

Essas operações são utilizadas durante todo o gerenciamento das tarefas.

---

  Inteligência Artificial

O recurso de Auto-Planejamento envia o título e a descrição da tarefa para uma IA.

A resposta retorna:

- Lista de subtarefas
- Ordem de execução
- Tempo estimado para cada subtarefa

Essas informações são automaticamente salvas no banco de dados.

---

 Acesse o projeto

O sistema está disponível online no link abaixo:

🔗 [https://smartkanbanunima.vercel.app](https://smartkanbanunima.vercel.app/)

Não é necessário realizar instalação para utilizar o sistema. Basta acessar o link acima e fazer login para testar as funcionalidades.

---

 Objetivo

Este projeto foi desenvolvido com o objetivo de integrar, em um único sistema, os cinco pilares fundamentais estudados durante a disciplina:

- Estruturas de Dados
- Banco de Dados
- Database Application (CRUD)
- Programação Orientada a Objetos
- Inteligência Artificial

---

 Integrantes

- Felipe Tavares
- Eric Rocha
- Alexandre Cesar
- Gabriel Nolasco
- Guilherme Pereira

---
