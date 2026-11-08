/**
 * PILAR 2 — PROGRAMAÇÃO ORIENTADA A OBJETOS
 * Classes Usuario, Tarefa (abstrata + subclasses), Coluna e Quadro.
 * Composição: Usuario TEM um Quadro; Quadro TEM Colunas (numa lista encadeada); Coluna TEM Tarefas.
 * Polimorfismo: cada tipo de Tarefa sobrescreve rotulo() e calcularPrioridade().
 */
import { ListaDuplamenteEncadeada, No } from "./estruturas";

export type Status = "todo" | "doing" | "done";
export type TipoTarefa = "simples" | "urgente" | "bug";

export interface Subtarefa {
  id: string;
  titulo: string;
  minutosEstimados: number;
  feita: boolean;
}

export interface DadosTarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: Status;
  criadoEm: Date;
  concluidoEm: Date | null;
  subtarefas?: Subtarefa[];
}

/** Classe abstrata: não pode ser instanciada diretamente, só pelas subclasses. */
export abstract class Tarefa {
  readonly id: string;
  titulo: string;
  descricao: string;
  status: Status;
  readonly criadoEm: Date;
  concluidoEm: Date | null;
  subtarefas: Subtarefa[];

  constructor(d: DadosTarefa) {
    this.id = d.id;
    this.titulo = d.titulo;
    this.descricao = d.descricao;
    this.status = d.status;
    this.criadoEm = d.criadoEm;
    this.concluidoEm = d.concluidoEm;
    this.subtarefas = d.subtarefas ?? [];
  }

  abstract get tipo(): TipoTarefa;
  /** Texto exibido no cartão — cada subclasse decide. */
  abstract rotulo(): string;
  /** Prioridade de 1 (baixa) a 10 (alta) — cada subclasse calcula de um jeito. */
  abstract calcularPrioridade(agora?: Date): number;

  /** Comportamento comum herdado por todas. */
  minutosEstimadosTotal(): number {
    return this.subtarefas.reduce((s, st) => s + st.minutosEstimados, 0);
  }

  progresso(): number {
    if (this.subtarefas.length === 0) return this.status === "done" ? 1 : 0;
    return this.subtarefas.filter((s) => s.feita).length / this.subtarefas.length;
  }

  diasDesdeCriacao(agora = new Date()): number {
    return Math.floor((agora.getTime() - this.criadoEm.getTime()) / 86_400_000);
  }

  /** Atualiza status e datas: ao entrar em "done" registra a conclusão. */
  definirStatus(novo: Status, agora = new Date()): void {
    this.status = novo;
    this.concluidoEm = novo === "done" ? agora : null;
  }
}

export class TarefaSimples extends Tarefa {
  get tipo(): TipoTarefa {
    return "simples";
  }
  rotulo() {
    return "Tarefa";
  }
  calcularPrioridade(agora = new Date()) {
    // Cresce devagar com a idade da tarefa.
    return Math.min(10, 2 + Math.floor(this.diasDesdeCriacao(agora) / 3));
  }
}

export class TarefaUrgente extends Tarefa {
  get tipo(): TipoTarefa {
    return "urgente";
  }
  rotulo() {
    return "Urgente";
  }
  calcularPrioridade(agora = new Date()) {
    // Começa alta e chega ao máximo rapidamente.
    return Math.min(10, 7 + this.diasDesdeCriacao(agora));
  }
}

export class Bug extends Tarefa {
  get tipo(): TipoTarefa {
    return "bug";
  }
  rotulo() {
    return "Bug";
  }
  calcularPrioridade(agora = new Date()) {
    // Bugs: base 5, +1 por dia aberto.
    return Math.min(10, 5 + this.diasDesdeCriacao(agora));
  }
}

/** Fábrica: cria a subclasse certa a partir do tipo salvo no banco. */
export function criarTarefa(tipo: TipoTarefa, d: DadosTarefa): Tarefa {
  switch (tipo) {
    case "urgente":
      return new TarefaUrgente(d);
    case "bug":
      return new Bug(d);
    default:
      return new TarefaSimples(d);
  }
}

export class Coluna {
  constructor(
    readonly status: Status,
    readonly nome: string,
    public tarefas: Tarefa[] = [],
  ) {}
}

/** O Quadro é composto por colunas guardadas numa Lista Duplamente Encadeada. */
export class Quadro {
  readonly colunas = new ListaDuplamenteEncadeada<Coluna>();

  constructor() {
    this.colunas.adicionarNoFim(new Coluna("todo", "A Fazer"));
    this.colunas.adicionarNoFim(new Coluna("doing", "Fazendo"));
    this.colunas.adicionarNoFim(new Coluna("done", "Concluído"));
  }

  private noDaColuna(status: Status): No<Coluna> {
    const no = this.colunas.encontrar((c) => c.status === status);
    if (!no) throw new Error(`Coluna ${status} inexistente`);
    return no;
  }

  adicionar(t: Tarefa): void {
    this.noDaColuna(t.status).valor.tarefas.unshift(t);
  }

  remover(id: string): Tarefa | null {
    for (const col of this.colunas.paraArray()) {
      const i = col.tarefas.findIndex((t) => t.id === id);
      if (i >= 0) return col.tarefas.splice(i, 1)[0];
    }
    return null;
  }

  buscar(id: string): Tarefa | null {
    for (const col of this.colunas.paraArray()) {
      const t = col.tarefas.find((x) => x.id === id);
      if (t) return t;
    }
    return null;
  }

  /** Move para a coluna seguinte (proximo) ou anterior (anterior) da lista. */
  mover(id: string, direcao: "avancar" | "retroceder"): { de: Status; para: Status } | null {
    const t = this.buscar(id);
    if (!t) return null;
    const noAtual = this.noDaColuna(t.status);
    const destino = direcao === "avancar" ? noAtual.proximo : noAtual.anterior;
    if (!destino) return null; // já está na primeira/última coluna
    return this.moverPara(id, destino.valor.status);
  }

  moverPara(id: string, para: Status): { de: Status; para: Status } | null {
    const t = this.remover(id);
    if (!t) return null;
    const de = t.status;
    t.definirStatus(para);
    this.adicionar(t);
    return { de, para };
  }

  todas(): Tarefa[] {
    return this.colunas.paraArray().flatMap((c) => c.tarefas);
  }

  estatisticas() {
    const todas = this.todas();
    const concluidas = todas.filter((t) => t.status === "done" && t.concluidoEm);
    const mediaHoras =
      concluidas.length === 0
        ? null
        : concluidas.reduce(
            (s, t) => s + (t.concluidoEm!.getTime() - t.criadoEm.getTime()) / 3_600_000,
            0,
          ) / concluidas.length;
    return {
      porColuna: this.colunas.paraArray().map((c) => ({ nome: c.nome, total: c.tarefas.length })),
      total: todas.length,
      concluidas: concluidas.length,
      mediaHorasConclusao: mediaHoras,
      minutosPlanejados: todas.reduce((s, t) => s + t.minutosEstimadosTotal(), 0),
    };
  }
}

export class Usuario {
  readonly quadro = new Quadro(); // composição: o quadro nasce e morre com o usuário
  constructor(
    readonly id: string,
    readonly email: string,
  ) {}
}
