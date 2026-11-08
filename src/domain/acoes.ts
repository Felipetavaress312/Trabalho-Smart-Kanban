/**
 * Ações desfazíveis (padrão Command) — polimorfismo + Pilha.
 * Toda ação sabe se desfazer; o quadro só chama acao.desfazer() sem saber o tipo.
 */
import type { Quadro, Status, Tarefa } from "./modelos";
import type { TarefaRepositorio } from "./repositorio";

export abstract class Acao {
  abstract descricao(): string;
  abstract desfazer(quadro: Quadro, repo: TarefaRepositorio): Promise<void>;
}

export class CriarAcao extends Acao {
  constructor(private tarefa: Tarefa) {
    super();
  }
  descricao() {
    return `criar "${this.tarefa.titulo}"`;
  }
  async desfazer(quadro: Quadro, repo: TarefaRepositorio) {
    quadro.remover(this.tarefa.id);
    await repo.excluir(this.tarefa.id);
  }
}

export class ExcluirAcao extends Acao {
  constructor(private tarefa: Tarefa) {
    super();
  }
  descricao() {
    return `excluir "${this.tarefa.titulo}"`;
  }
  async desfazer(quadro: Quadro, repo: TarefaRepositorio) {
    const t = this.tarefa;
    await repo.criar({ id: t.id, titulo: t.titulo, descricao: t.descricao, tipo: t.tipo, status: t.status, criadoEm: t.criadoEm });
    await repo.restaurarSubtarefas(t.id, t.subtarefas);
    if (t.concluidoEm) await repo.atualizarStatus(t);
    quadro.adicionar(t);
  }
}

export class MoverAcao extends Acao {
  constructor(
    private tarefaId: string,
    private titulo: string,
    private de: Status,
  ) {
    super();
  }
  descricao() {
    return `mover "${this.titulo}"`;
  }
  async desfazer(quadro: Quadro, repo: TarefaRepositorio) {
    quadro.moverPara(this.tarefaId, this.de);
    const t = quadro.buscar(this.tarefaId);
    if (t) await repo.atualizarStatus(t);
  }
}
