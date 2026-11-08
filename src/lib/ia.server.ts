/**
 * PILAR 5 — INTELIGÊNCIA ARTIFICIAL (roda só no servidor; a chave nunca vai ao navegador).
 */
import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";

const RUN_ID = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

const esquema = z.object({
  subtarefas: z.array(
    z.object({
      titulo: z.string(),
      minutos_estimados: z.number(),
    }),
  ),
});

export type Plano = { subtarefas: { titulo: string; minutosEstimados: number }[] };

export async function gerarPlano(titulo: string, descricao: string, signal?: AbortSignal): Promise<Plano> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const openaiKey = process.env["OPENAI_API_KEY"];
  const geminiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey && geminiKey) return gerarComGemini(titulo, descricao, geminiKey, signal);
  if (!apiKey && !openaiKey) throw new Error("nenhuma chave de IA cadastrada no servidor (GEMINI_API_KEY)");

  // Com OPENAI_API_KEY (ex.: deploy na Vercel) chama a OpenAI direto.
  const provider = apiKey
    ? createOpenAI({
        baseURL: "https://ai.gateway.lovable.dev/v1",
        apiKey,
        headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        fetch: runIdFetch(),
      })
    : createOpenAI({ apiKey: openaiKey! });

  const result = streamText({
    model: provider.responses(apiKey ? "openai/gpt-6-astra" : "gpt-4o-mini"),
    instructions:
      "Você é um gerente de projetos. Quebre a tarefa em 3 a 7 subtarefas pequenas, concretas e em ordem de execução. " +
      "Para cada uma, estime o tempo em minutos (entre 10 e 480). Responda em português do Brasil.",
    messages: [{ role: "user", content: `Título: ${titulo}\nDescrição: ${descricao || "(sem descrição)"}` }],
    output: Output.object({ schema: esquema }),
    ...(signal ? { abortSignal: signal } : {}),
    providerOptions: apiKey ? {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    } : { openai: { store: false } },
  });

  const saida = await result.output;
  return {
    subtarefas: saida.subtarefas.slice(0, 8).map((s) => ({
      titulo: s.titulo.trim(),
      minutosEstimados: Math.max(5, Math.min(600, Math.round(s.minutos_estimados))),
    })),
  };
}

const INSTRUCOES =
  "Você é um gerente de projetos. Quebre a tarefa em 3 a 7 subtarefas pequenas, concretas e em ordem de execução. " +
  "Para cada uma, estime o tempo em minutos (entre 10 e 480). Responda em português do Brasil. " +
  'Responda SOMENTE com JSON no formato {"subtarefas":[{"titulo":"...","minutos_estimados":30}]}.';

/** Google Gemini (chave grátis em aistudio.google.com), usado fora da Lovable, ex.: Vercel. */
async function gerarComGemini(titulo: string, descricao: string, chave: string, signal?: AbortSignal): Promise<Plano> {
  // Tenta o apelido "sempre o mais novo" e, se não existir, modelos recentes.
  // Se um estiver fora do ar ou lotado (404/429/503), passa para o próximo.
  const modelos = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"];
  let res: Response | undefined;
  for (const modelo of modelos) {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${chave}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: signal ?? null,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: INSTRUCOES }] },
          contents: [{ role: "user", parts: [{ text: `Título: ${titulo}\nDescrição: ${descricao || "(sem descrição)"}` }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    if (![404, 429, 500, 503].includes(res.status)) break;
    await new Promise((r) => setTimeout(r, 800));
  }
  if (!res) throw new Error("Gemini sem resposta");
  if (!res.ok) {
    const corpo = (await res.text()).slice(0, 200);
    throw new Error(`Gemini respondeu ${res.status}: ${corpo}`);
  }
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const texto = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const saida = esquema.parse(JSON.parse(texto));
  return {
    subtarefas: saida.subtarefas.slice(0, 8).map((s) => ({
      titulo: s.titulo.trim(),
      minutosEstimados: Math.max(5, Math.min(600, Math.round(s.minutos_estimados))),
    })),
  };
}

/**
 * Plano de contingência (sem chave de IA ou se a API falhar):
 * gera subtarefas a partir de etapas padrão de qualquer atividade,
 * com tempo proporcional ao tamanho da descrição.
 */
export function planoLocal(titulo: string, descricao: string): Plano {
  const t = titulo.trim() || "tarefa";
  const peso = Math.min(3, 1 + Math.floor(descricao.trim().length / 150));
  const etapas: [string, number][] = [
    [`Entender o objetivo de "${t}" e levantar requisitos`, 20],
    [`Pesquisar referências e materiais para "${t}"`, 30],
    [`Planejar as etapas e dividir o trabalho`, 20],
    [`Executar a parte principal de "${t}"`, 90],
    [`Revisar e testar o resultado`, 30],
    [`Finalizar e documentar a entrega`, 20],
  ];
  return {
    subtarefas: etapas.map(([nome, min]) => ({ titulo: nome, minutosEstimados: min * peso })),
  };
}
