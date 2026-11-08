import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gerarPlano } from "./ia.server";

/** Função de servidor chamada pelo botão "Auto-Planejamento". Exige usuário logado. */
export const autoPlanejar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { titulo: string; descricao: string }) => ({
    titulo: String(d.titulo).slice(0, 200),
    descricao: String(d.descricao ?? "").slice(0, 2000),
  }))
  .handler(async ({ data }) => {
    try {
      const plano = await gerarPlano(data.titulo, data.descricao, getRequest()?.signal);
      return { ok: true as const, ...plano };
    } catch (e: unknown) {
      console.error("Auto-planejamento falhou", e);
      const status = (e as { statusCode?: number })?.statusCode;
      const msg =
        status === 429
          ? "Muitas requisições. Tente de novo em instantes."
          : status === 402
            ? "Créditos de IA esgotados."
            : "Não foi possível gerar o plano agora.";
      return { ok: false as const, erro: msg, subtarefas: [] };
    }
  });
