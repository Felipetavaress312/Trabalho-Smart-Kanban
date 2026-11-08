/**
 * PILAR 1 — ESTRUTURAS DE DADOS
 * Implementações próprias (sem usar Array como atalho para a lógica principal).
 */

/** Nó de uma lista duplamente encadeada: guarda o valor e ponteiros para os vizinhos. */
export class No<T> {
  valor: T;
  anterior: No<T> | null = null;
  proximo: No<T> | null = null;

  constructor(valor: T) {
    this.valor = valor;
  }
}

/**
 * Lista Duplamente Encadeada.
 * No quadro, cada nó é uma COLUNA (A Fazer ↔ Fazendo ↔ Concluído).
 * Avançar uma tarefa = ir para `no.proximo`; retroceder = `no.anterior`. Ambos O(1).
 */
export class ListaDuplamenteEncadeada<T> {
  cabeca: No<T> | null = null;
  cauda: No<T> | null = null;
  tamanho = 0;

  /** Insere no final — O(1), pois temos o ponteiro `cauda`. */
  adicionarNoFim(valor: T): No<T> {
    const novo = new No(valor);
    if (!this.cauda) {
      this.cabeca = novo;
      this.cauda = novo;
    } else {
      novo.anterior = this.cauda;
      this.cauda.proximo = novo;
      this.cauda = novo;
    }
    this.tamanho++;
    return novo;
  }

  /** Busca linear O(n) pelo primeiro nó que satisfaz o critério. */
  encontrar(criterio: (valor: T) => boolean): No<T> | null {
    let atual = this.cabeca;
    while (atual) {
      if (criterio(atual.valor)) return atual;
      atual = atual.proximo;
    }
    return null;
  }

  /** Remove um nó religando os vizinhos — O(1). */
  remover(no: No<T>): void {
    if (no.anterior) no.anterior.proximo = no.proximo;
    else this.cabeca = no.proximo;
    if (no.proximo) no.proximo.anterior = no.anterior;
    else this.cauda = no.anterior;
    no.anterior = null;
    no.proximo = null;
    this.tamanho--;
  }

  /** Percorre da cabeça até a cauda (ordem direta). */
  paraArray(): T[] {
    const saida: T[] = [];
    let atual = this.cabeca;
    while (atual) {
      saida.push(atual.valor);
      atual = atual.proximo;
    }
    return saida;
  }

  /** Percorre da cauda até a cabeça (só é possível porque a lista é DUPLAMENTE encadeada). */
  paraArrayReverso(): T[] {
    const saida: T[] = [];
    let atual = this.cauda;
    while (atual) {
      saida.push(atual.valor);
      atual = atual.anterior;
    }
    return saida;
  }
}

/**
 * Pilha (LIFO — último a entrar, primeiro a sair).
 * Usada no "Desfazer" (Ctrl+Z): cada ação feita é empilhada; desfazer = desempilhar.
 * Implementada com nós encadeados: push/pop em O(1).
 */
export class Pilha<T> {
  private topo: { valor: T; abaixo: Pilha<T>["topo"] } | null = null;
  private _tamanho = 0;
  private readonly limite: number;

  constructor(limite = 50) {
    this.limite = limite;
  }

  empilhar(valor: T): void {
    this.topo = { valor, abaixo: this.topo };
    this._tamanho++;
    if (this._tamanho > this.limite) this.cortarBase();
  }

  desempilhar(): T | null {
    if (!this.topo) return null;
    const valor = this.topo.valor;
    this.topo = this.topo.abaixo;
    this._tamanho--;
    return valor;
  }

  espiar(): T | null {
    return this.topo ? this.topo.valor : null;
  }

  estaVazia(): boolean {
    return this.topo === null;
  }

  get tamanho(): number {
    return this._tamanho;
  }

  /** Remove o elemento mais antigo para não crescer sem limite. */
  private cortarBase(): void {
    let atual = this.topo;
    while (atual && atual.abaixo && atual.abaixo.abaixo) atual = atual.abaixo;
    if (atual) atual.abaixo = null;
    this._tamanho--;
  }
}
