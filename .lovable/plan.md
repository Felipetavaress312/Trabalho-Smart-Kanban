# Smart Kanban — Protótipo + PDF de apresentação

## O que será entregue
1. **App web funcional (Smart Kanban)** em português, cobrindo os 5 pilares.
2. **PDF explicativo** com arquitetura, código-chave de cada pilar e **roteiro de fala para 2 pessoas** (Pessoa A e Pessoa B), incluindo perguntas prováveis da sabatina com respostas.

## Funcionalidades do app
- Login simples (cadastro com e-mail/senha) — cada usuário vê seu quadro.
- Quadro com 3 colunas: **A Fazer ↔ Fazendo ↔ Concluído**.
- Criar, editar, excluir tarefas (título, descrição, prioridade, tipo).
- Botões ◀ ▶ para mover a tarefa entre colunas.
- **Desfazer (Ctrl+Z)** a última ação.
- Datas de criação e conclusão salvas automaticamente.
- Botão **"Auto-Planejamento (IA)"**: gera subtarefas com tempo estimado, salvas no banco e exibidas como checklist.
- Painel de produtividade: total por coluna, concluídas, tempo médio até conclusão.

## Como cada pilar aparece
- **Estruturas de Dados**: classe `ListaDuplamenteEncadeada` própria (nós com `anterior`/`proximo`) representando as colunas — avançar/retroceder = navegar `proximo`/`anterior`. Classe `Pilha` própria (push/pop) para o Desfazer.
- **POO**: classes `Usuario`, `Tarefa`, `Quadro` (composição: Quadro contém colunas, que contêm Tarefas; Usuario possui Quadro). Polimorfismo: `Tarefa` base com subclasses `TarefaSimples`, `TarefaUrgente`, `Bug`, sobrescrevendo métodos como `calcularPrioridade()` e `rotulo()`. Ações do Desfazer como classes `Acao` (MoverAcao, CriarAcao, ExcluirAcao) com método polimórfico `desfazer()`.
- **Banco de Dados**: Lovable Cloud (PostgreSQL real). Tabelas `tarefas` e `subtarefas` com chaves, status, `criado_em`, `concluido_em`, e segurança por usuário. Diagrama ER no PDF.
- **DB App (CRUD)**: camada `TarefaRepositorio` com criar/listar/atualizar/excluir via conexão ao banco.
- **IA (consome API)**: função no servidor chama a API de IA do Lovable, recebendo título+descrição e devolvendo JSON estruturado (subtarefas + minutos estimados).

## PDF
- Capa, visão geral, arquitetura (diagrama), um capítulo por pilar com trechos do código explicados linha a linha, diagrama de classes, modelo do banco, fluxo da IA.
- Roteiro de apresentação (~10 min) dividido entre Pessoa A e Pessoa B, com falas prontas.
- Seção "Perguntas da sabatina" com ~15 perguntas e respostas curtas (ex.: "Por que lista duplamente encadeada e não array?", "O que é composição?", "Como a tarefa é salva no banco?").
- Visual conferido página a página antes da entrega.

## Detalhes técnicos
- Stack: TanStack Start + React, Tailwind; Lovable Cloud (auth + Postgres); Lovable AI Gateway com saída JSON por schema.
- Código de domínio em `src/domain/` (estruturas, classes) separado da UI, para facilitar a explicação.
- Testes unitários da lista encadeada, da pilha e do polimorfismo.
- Visual: estilo "quadro de cortiça/post-it" discreto, tipografia distinta.
