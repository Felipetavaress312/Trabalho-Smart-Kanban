import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, LogOut, Pencil, Plus, Sparkles, Trash2, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Usuario, type Tarefa, type TipoTarefa, type Status } from "@/domain/modelos";
import { Pilha } from "@/domain/estruturas";
import { TarefaRepositorio } from "@/domain/repositorio";
import { Acao, CriarAcao, EditarAcao, ExcluirAcao, MoverAcao } from "@/domain/acoes";
import { autoPlanejar } from "@/lib/ia.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/quadro")({
  head: () => ({
    meta: [
      { title: "Meu quadro — Smart Kanban" },
      { name: "description", content: "Seu quadro de tarefas com colunas, desfazer e auto-planejamento por IA." },
      { property: "og:title", content: "Meu quadro — Smart Kanban" },
      { property: "og:description", content: "Seu quadro de tarefas com colunas, desfazer e auto-planejamento por IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuadroPage,
});

const corColuna: Record<Status, string> = { todo: "bg-col-todo", doing: "bg-col-doing", done: "bg-col-done" };
const corTag: Record<TipoTarefa, string> = { simples: "bg-tag-simples", urgente: "bg-tag-urgente", bug: "bg-tag-bug" };

function QuadroPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const planejar = useServerFn(autoPlanejar);

  const usuario = useRef(new Usuario(user.id, user.email ?? ""));
  const repo = useRef(new TarefaRepositorio());
  const historico = useRef(new Pilha<Acao>());
  const [, setVersao] = useState(0);
  const redesenhar = () => setVersao((v) => v + 1);
  const quadro = usuario.current.quadro;

  const [carregando, setCarregando] = useState(true);
  const [planejando, setPlanejando] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<TipoTarefa>("simples");
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [edTitulo, setEdTitulo] = useState("");
  const [edDescricao, setEdDescricao] = useState("");

  function abrirEdicao(t: Tarefa) {
    setEditando(t);
    setEdTitulo(t.titulo);
    setEdDescricao(t.descricao);
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    const t = editando;
    if (!t) return;
    if (!edTitulo.trim()) {
      toast.error("O título não pode ficar vazio.");
      return;
    }
    const antigo = { titulo: t.titulo, descricao: t.descricao };
    t.titulo = edTitulo.trim();
    t.descricao = edDescricao.trim();
    try {
      await repo.current.atualizarTexto(t);
      historico.current.empilhar(new EditarAcao(t.id, antigo.titulo, antigo.descricao));
      setEditando(null);
      toast.success("Tarefa atualizada");
    } catch (err) {
      t.titulo = antigo.titulo;
      t.descricao = antigo.descricao;
      toast.error((err as Error).message);
    }
    redesenhar();
  }

  useEffect(() => {
    let cancelado = false;
    repo.current
      .listar()
      .then((ts) => {
        if (cancelado) return;
        quadro.limpar();
        ts.forEach((t) => quadro.adicionar(t));
        redesenhar();
      })
      .catch((e) => toast.error(e.message))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const desfazer = useCallback(async () => {
    const acao = historico.current.desempilhar();
    if (!acao) {
      toast("Nada para desfazer");
      return;
    }
    try {
      await acao.desfazer(quadro, repo.current);
      toast.success(`Desfeito: ${acao.descricao()}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
    redesenhar();
  }, [quadro]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        desfazer();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [desfazer]);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("Digite um título para a tarefa antes de adicionar.");
      return;
    }
    try {
      const t = await repo.current.criar({ titulo: titulo.trim(), descricao: descricao.trim(), tipo });
      quadro.adicionar(t);
      historico.current.empilhar(new CriarAcao(t));
      setTitulo("");
      setDescricao("");
      redesenhar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function mover(t: Tarefa, dir: "avancar" | "retroceder") {
    const r = quadro.mover(t.id, dir);
    if (!r) return;
    redesenhar();
    try {
      await repo.current.atualizarStatus(t);
      historico.current.empilhar(new MoverAcao(t.id, t.titulo, r.de));
    } catch (err) {
      quadro.moverPara(t.id, r.de);
      redesenhar();
      toast.error((err as Error).message);
    }
  }

  async function excluir(t: Tarefa) {
    try {
      await repo.current.excluir(t.id);
      quadro.remover(t.id);
      historico.current.empilhar(new ExcluirAcao(t));
      redesenhar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function autoPlano(t: Tarefa) {
    setPlanejando(t.id);
    try {
      const r = await planejar({ data: { titulo: t.titulo, descricao: t.descricao } });
      t.subtarefas = await repo.current.salvarSubtarefas(t.id, r.subtarefas);
      if ("aviso" in r && r.aviso) toast.warning(r.aviso, { duration: 15000 });
      else toast.success(`${t.subtarefas.length} subtarefas planejadas pela IA`);
      redesenhar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPlanejando(null);
    }
  }

  async function marcar(t: Tarefa, id: string, feita: boolean) {
    const st = t.subtarefas.find((s) => s.id === id);
    if (!st) return;
    st.feita = feita;
    redesenhar();
    await repo.current.marcarSubtarefa(id, feita).catch((e) => toast.error(e.message));
  }

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const est = quadro.estatisticas();
  const colunas = quadro.colunas.paraArray();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold">Smart Kanban</h1>
          <p className="text-sm text-muted-foreground">{usuario.current.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={desfazer} disabled={historico.current.estaVazia()}>
            <Undo2 /> Desfazer <kbd className="font-mono text-xs opacity-60">Ctrl+Z</kbd>
            {!historico.current.estaVazia() && <span className="font-mono text-xs">({historico.current.tamanho})</span>}
          </Button>
          <Button variant="ghost" onClick={sair}><LogOut /> Sair</Button>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {est.porColuna.map((c) => <Stat key={c.nome} rotulo={c.nome} valor={c.total} />)}
        <Stat rotulo="Tempo médio até concluir" valor={est.mediaHorasConclusao === null ? "—" : formatarHoras(est.mediaHorasConclusao)} />
        <Stat rotulo="Tempo planejado pela IA" valor={formatarHoras(est.minutosPlanejados / 60)} />
      </section>

      <form onSubmit={criar} className="mt-6 grid gap-3 rounded-md border-2 border-foreground bg-card p-4 shadow-card md:grid-cols-[1fr_1.5fr_auto_auto]">
        <Input placeholder="Título da tarefa" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={200} />
        <Textarea placeholder="Descrição (ajuda a IA a planejar)" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={1} className="min-h-9" />
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoTarefa)} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Tipo">
          <option value="simples">Tarefa</option>
          <option value="urgente">Urgente</option>
          <option value="bug">Bug</option>
        </select>
        <Button type="submit"><Plus /> Adicionar</Button>
      </form>

      {carregando ? (
        <div className="mt-16 flex justify-center"><Loader2 className="size-6 animate-spin" /></div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {colunas.map((col) => (
            <section key={col.status} className={cn("min-h-64 rounded-md border-2 border-foreground p-3", corColuna[col.status])}>
              <h2 className="mb-3 flex items-center justify-between font-display text-lg font-bold">
                {col.nome}<span className="font-mono text-sm">{col.tarefas.length}</span>
              </h2>
              <div className="space-y-3">
                {col.tarefas.map((t) => (
                  <article key={t.id} className="rounded-md border-2 border-foreground bg-card p-3 shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-primary-foreground", corTag[t.tipo])}>
                        {t.rotulo()} · P{t.calcularPrioridade()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => abrirEdicao(t)} aria-label="Editar" className="text-muted-foreground hover:text-foreground"><Pencil className="size-4" /></button>
                        <button onClick={() => excluir(t)} aria-label="Excluir" className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                    <h3 className="mt-2 font-semibold leading-snug">{t.titulo}</h3>
                    {t.descricao && <p className="mt-1 text-sm text-muted-foreground">{t.descricao}</p>}

                    {t.subtarefas.length > 0 && (
                      <ul className="mt-3 space-y-1.5 border-t border-border pt-2">
                        {t.subtarefas.map((s) => (
                          <li key={s.id} className="flex items-start gap-2 text-sm">
                            <Checkbox checked={s.feita} onCheckedChange={(v) => marcar(t, s.id, v === true)} className="mt-0.5" />
                            <span className={cn("flex-1", s.feita && "text-muted-foreground line-through")}>{s.titulo}</span>
                            <span className="font-mono text-xs text-muted-foreground">{s.minutosEstimados}min</span>
                          </li>
                        ))}
                        <li className="pt-1 text-right font-mono text-xs">
                          Total ≈ {formatarHoras(t.minutosEstimadosTotal() / 60)} · {Math.round(t.progresso() * 100)}%
                        </li>
                      </ul>
                    )}

                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      criada {t.criadoEm.toLocaleDateString("pt-BR")}
                      {t.concluidoEm && ` · concluída ${t.concluidoEm.toLocaleDateString("pt-BR")}`}
                    </p>

                    <div className="mt-3 flex items-center gap-1">
                      <Button size="icon" variant="outline" className="size-8" disabled={col.status === "todo"} onClick={() => mover(t, "retroceder")} aria-label="Voltar coluna"><ChevronLeft /></Button>
                      <Button size="sm" variant="secondary" className="flex-1" disabled={planejando === t.id} onClick={() => autoPlano(t)}>
                        {planejando === t.id ? <Loader2 className="animate-spin" /> : <Sparkles />} Auto-Planejamento
                      </Button>
                      <Button size="icon" variant="outline" className="size-8" disabled={col.status === "done"} onClick={() => mover(t, "avancar")} aria-label="Avançar coluna"><ChevronRight /></Button>
                    </div>
                  </article>
                ))}
                {col.tarefas.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Vazio</p>}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={editando !== null} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={salvarEdicao} className="space-y-3">
            <Input aria-label="Título" value={edTitulo} onChange={(e) => setEdTitulo(e.target.value)} maxLength={200} />
            <Textarea aria-label="Descrição" value={edDescricao} onChange={(e) => setEdDescricao(e.target.value)} rows={4} placeholder="Descrição" />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Stat({ rotulo, valor }: { rotulo: string; valor: string | number }) {
  return (
    <div className="rounded-md border-2 border-foreground bg-card p-3">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className="font-display text-2xl font-extrabold">{valor}</p>
    </div>
  );
}

function formatarHoras(h: number) {
  if (h < 1) return `${Math.round(h * 60)}min`;
  return `${h.toFixed(1).replace(".", ",")}h`;
}
