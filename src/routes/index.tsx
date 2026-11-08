import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftRight, Database, Layers, Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Kanban — quadro de tarefas com IA" },
      { name: "description", content: "Registre tarefas, mova entre colunas, desfaça ações e deixe a IA planejar subtarefas." },
      { property: "og:title", content: "Smart Kanban — quadro de tarefas com IA" },
      { property: "og:description", content: "Registre tarefas, mova entre colunas, desfaça ações e deixe a IA planejar subtarefas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const pilares = [
  { icon: ArrowLeftRight, t: "Lista duplamente encadeada", d: "Colunas ligadas por anterior/próximo" },
  { icon: Undo2, t: "Pilha", d: "Desfazer (Ctrl+Z)" },
  { icon: Layers, t: "POO", d: "Usuario, Tarefa, Quadro, polimorfismo" },
  { icon: Database, t: "Banco + CRUD", d: "PostgreSQL com segurança por usuário" },
  { icon: Sparkles, t: "IA", d: "Auto-Planejamento com estimativa de tempo" },
];

function Index() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-sm uppercase tracking-widest text-primary">Projeto acadêmico · Tema 2</p>
      <h1 className="mt-3 font-display text-6xl font-extrabold leading-[0.95] md:text-8xl">
        Smart<br />Kanban.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Um quadro de tarefas onde a IA quebra o trabalho em partes menores e estima quanto tempo cada uma leva.
      </p>
      <div className="mt-8">
        <Button asChild size="lg">
          <Link to="/quadro">Abrir meu quadro</Link>
        </Button>
      </div>
      <ul className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {pilares.map((p, i) => (
          <li key={p.t} className="rounded-md border-2 border-foreground bg-card p-4 shadow-card" style={{ rotate: `${(i % 2 ? 1 : -1) * 0.8}deg` }}>
            <p.icon className="size-5 text-primary" />
            <p className="mt-3 font-semibold leading-tight">{p.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
