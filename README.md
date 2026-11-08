# Clever Kanban Compass

ATIVIDADE

Desenvolver um protótipo funcional de um mini-sistema que integre obrigatoriamente cinco pilares fundamentais da Ciência da Computação: Estruturas de Dados Básicas, Banco de Dados (Modelagem e Persistência), Database Application (Conexão e CRUD), Programação Orientada a Objetos (POO) e Inteligência Artificial (IA).




O foco é avaliar o domínio nivelado da equipe sobre o ciclo completo de desenvolvimento de software e a capacidade de integrar diferentes tecnologias.




Regras de Formação e Execução

Grupos: As equipes devem ser formadas hoje e conter no máximo 5 alunos. Diferentes grupos podem escolher o mesmo tema.

Liderança: Cada equipe deve eleger um(a) Líder de Projeto, responsável por organizar as entregas, o repositório de código e garantir a comunicação.

Requisito de Código: O sistema deve ser um protótipo funcional. Não precisa de uma interface gráfica complexa (pode ser terminal ou uma interface web simples), mas deve conectar com um banco de dados real e consumir uma API.

Trabalho Full-Stack: Não é permitido dividir o trabalho de forma que um aluno faça apenas o banco de dados e outro apenas a interface. Todos os membros da equipe devem conhecer a arquitetura e o código por completo.

Metodologia de Avaliação (Sistema Regressivo)

O formato de avaliação será focado em defesa técnica.




Nota Inicial: Todos os membros da equipe iniciam a apresentação com 20 pontos.

Sabatina Aleatória: Durante a apresentação, o professor sorteará membros específicos da equipe para explicar partes do código, detalhar como a estrutura de dados foi implementada ou como a persistência no banco foi feita.

Penalidade: O líder ou os colegas não poderão responder pelo membro sorteado. Cada pergunta técnica não respondida corretamente ou respondida de forma insatisfatória acarretará a perda de 2 a 4 pontos na nota final da equipe inteira (ou do indivíduo, a critério do professor na hora).

O TEMA QUE EU ESCOLHI FOI ESSE: 


Tema 2: Gerenciador de Tarefas Dinâmico (Smart Kanban)

Cenário: Um mini-CRM ou quadro de tarefas onde usuários podem registrar atividades, movê-las de status e analisar a produtividade.

Estrutura de Dados: Listas Duplamente Encadeadas (Doubly Linked Lists) para permitir o avanço e retrocesso rápido de tarefas entre as colunas do quadro (ex: To Do ↔ Doing ↔ Done), ou Pilhas (Stacks) para um recurso de "Desfazer última ação" (Ctrl+Z).

POO: Classes Usuario, Tarefa, Quadro, utilizando composição e polimorfismo.

Banco de Dados & DB App: Persistência das tarefas, status atual e datas de criação/conclusão.

Inteligência Artificial: O sistema deve ter um botão de "Auto-Planejamento". A IA recebe o título e a descrição da tarefa, quebra em subtarefas menores e estima o tempo necessário para conclusão.


Só que vou precisar disso e fazer uma apresentação sobre isso, da pra você fazer a tarefa o projeto e depois gerar um PDF explicando tudo e até fazendo a fala de 2 pessoas?

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://clever-kanban-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7de3bff7-1636-4a64-8c82-234acf399f05).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
