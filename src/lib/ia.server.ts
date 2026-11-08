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
  if (!apiKey && !openaiKey) return planoLocal(titulo, descricao);

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
    },
  });

  const saida = await result.output;
  return {
    subtarefas: saida.subtarefas.slice(0, 8).map((s) => ({
      titulo: s.titulo.trim(),
      minutosEstimados: Math.max(5, Math.min(600, Math.round(s.minutos_estimados))),
    })),
  };
}
