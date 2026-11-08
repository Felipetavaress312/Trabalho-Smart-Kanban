import { describe, expect, it } from "vitest";
import { ListaDuplamenteEncadeada, Pilha } from "@/domain/estruturas";
import { Bug, Quadro, TarefaSimples, TarefaUrgente, criarTarefa } from "@/domain/modelos";

const base = (status: "todo" | "doing" | "done" = "todo") => ({
  id: "1", titulo: "T", descricao: "", status, criadoEm: new Date("2026-01-01"), concluidoEm: null,
});

describe("Lista duplamente encadeada", () => {
  it("percorre nos dois sentidos", () => {
    const l = new ListaDuplamenteEncadeada<number>();
    [1, 2, 3].forEach((n) => l.adicionarNoFim(n));
    expect(l.paraArray()).toEqual([1, 2, 3]);
    expect(l.paraArrayReverso()).toEqual([3, 2, 1]);
  });
  it("remove religando vizinhos", () => {
    const l = new ListaDuplamenteEncadeada<number>();
    l.adicionarNoFim(1); const meio = l.adicionarNoFim(2); l.adicionarNoFim(3);
    l.remover(meio);
    expect(l.paraArray()).toEqual([1, 3]);
    expect(l.tamanho).toBe(2);
  });
});

describe("Pilha", () => {
  it("é LIFO", () => {
    const p = new Pilha<string>();
    p.empilhar("a"); p.empilhar("b");
    expect(p.desempilhar()).toBe("b");
    expect(p.desempilhar()).toBe("a");
    expect(p.desempilhar()).toBeNull();
  });
  it("respeita o limite descartando o mais antigo", () => {
    const p = new Pilha<number>(2);
    p.empilhar(1); p.empilhar(2); p.empilhar(3);
    expect(p.tamanho).toBe(2);
    expect(p.desempilhar()).toBe(3);
    expect(p.desempilhar()).toBe(2);
    expect(p.desempilhar()).toBeNull();
  });
});

describe("Polimorfismo", () => {
  const agora = new Date("2026-01-01");
  it("cada subclasse calcula prioridade diferente", () => {
    expect(new TarefaSimples(base()).calcularPrioridade(agora)).toBe(2);
    expect(new TarefaUrgente(base()).calcularPrioridade(agora)).toBe(7);
    expect(new Bug(base()).calcularPrioridade(agora)).toBe(5);
  });
  it("fábrica devolve a subclasse certa", () => {
    expect(criarTarefa("bug", base())).toBeInstanceOf(Bug);
  });
});

describe("Quadro", () => {
  it("avança e retrocede pela lista e registra conclusão", () => {
    const q = new Quadro();
    q.adicionar(new TarefaSimples(base()));
    q.mover("1", "avancar");
    expect(q.buscar("1")!.status).toBe("doing");
    q.mover("1", "avancar");
    expect(q.buscar("1")!.concluidoEm).not.toBeNull();
    expect(q.mover("1", "avancar")).toBeNull();
    q.mover("1", "retroceder");
    expect(q.buscar("1")!.status).toBe("doing");
    expect(q.buscar("1")!.concluidoEm).toBeNull();
  });
});
