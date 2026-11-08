/**
 * PILAR 4 — DATABASE APPLICATION (CRUD)
 * Camada que conversa com o banco PostgreSQL. Converte linhas do banco em objetos (e vice-versa).
 */
import { supabase } from "@/integrations/supabase/client";
import { criarTarefa, type Status, type Subtarefa, type Tarefa, type TipoTarefa } from "./modelos";

type LinhaTarefa = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  status: string;
  criado_em: string;
  concluido_em: string | null;
  subtarefas?: { id: string; titulo: string; minutos_estimados: number; feita: boolean; ordem: number }[];
};

function linhaParaObjeto(l: LinhaTarefa): Tarefa {
  return criarTarefa(l.tipo as TipoTarefa, {
    id: l.id,
    titulo: l.titulo,
    descricao: l.descricao,
    status: l.status as Status,
    criadoEm: new Date(l.criado_em),
    concluidoEm: l.concluido_em ? new Date(l.concluido_em) : null,
    subtarefas: (l.subtarefas ?? [])
      .sort((a, b) => a.ordem - b.ordem)
      .map((s) => ({ id: s.id, titulo: s.titulo, minutosEstimados: s.minutos_estimados, feita: s.feita })),
  });
}

export class TarefaRepositorio {
  /** READ — lista todas as tarefas do usuário logado (RLS filtra por user_id). */
  async listar(): Promise<Tarefa[]> {
    const { data, error } = await supabase
      .from("tarefas")
      .select("*, subtarefas(*)")
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return (data as LinhaTarefa[]).map(linhaParaObjeto);
  }

  /** CREATE — insere uma tarefa nova e devolve o objeto. */
  async criar(dados: { titulo: string; descricao: string; tipo: TipoTarefa; id?: string; status?: Status; criadoEm?: Date }): Promise<Tarefa> {
    const { data, error } = await supabase
      .from("tarefas")
      .insert({
        ...(dados.id ? { id: dados.id } : {}),
        titulo: dados.titulo,
        descricao: dados.descricao,
        tipo: dados.tipo,
        status: dados.status ?? "todo",
        ...(dados.criadoEm ? { criado_em: dados.criadoEm.toISOString() } : {}),
      })
      .select("*, subtarefas(*)")
      .single();
    if (error) throw error;
    return linhaParaObjeto(data as LinhaTarefa);
  }

  /** UPDATE — grava status e data de conclusão. */
  async atualizarStatus(t: Tarefa): Promise<void> {
    const { error } = await supabase
      .from("tarefas")
      .update({ status: t.status, concluido_em: t.concluidoEm?.toISOString() ?? null })
      .eq("id", t.id);
    if (error) throw error;
  }

  /** UPDATE — grava título/descrição. */
  async atualizarTexto(t: Tarefa): Promise<void> {
    const { error } = await supabase
      .from("tarefas")
      .update({ titulo: t.titulo, descricao: t.descricao })
      .eq("id", t.id);
    if (error) throw error;
  }

  /** DELETE — remove a tarefa (subtarefas caem junto por ON DELETE CASCADE). */
  async excluir(id: string): Promise<void> {
    const { error } = await supabase.from("tarefas").delete().eq("id", id);
    if (error) throw error;
  }

  /** CREATE em lote das subtarefas geradas pela IA. */
  async salvarSubtarefas(tarefaId: string, itens: { titulo: string; minutosEstimados: number }[]): Promise<Subtarefa[]> {
    await supabase.from("subtarefas").delete().eq("tarefa_id", tarefaId);
    const { data, error } = await supabase
      .from("subtarefas")
      .insert(itens.map((s, i) => ({ tarefa_id: tarefaId, titulo: s.titulo, minutos_estimados: s.minutosEstimados, ordem: i })))
      .select();
    if (error) throw error;
    return data
      .sort((a, b) => a.ordem - b.ordem)
      .map((s) => ({ id: s.id, titulo: s.titulo, minutosEstimados: s.minutos_estimados, feita: s.feita }));
  }

  async restaurarSubtarefas(tarefaId: string, itens: Subtarefa[]): Promise<void> {
    if (itens.length === 0) return;
    const { error } = await supabase.from("subtarefas").insert(
      itens.map((s, i) => ({ id: s.id, tarefa_id: tarefaId, titulo: s.titulo, minutos_estimados: s.minutosEstimados, feita: s.feita, ordem: i })),
    );
    if (error) throw error;
  }

  async marcarSubtarefa(id: string, feita: boolean): Promise<void> {
    const { error } = await supabase.from("subtarefas").update({ feita }).eq("id", id);
    if (error) throw error;
  }
}
