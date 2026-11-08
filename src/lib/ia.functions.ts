import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gerarPlano, planoLocal } from "./ia.server";

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
      // Se a IA falhar (sem internet, sem créditos, sem chave), usa o plano local.
      console.error("Auto-planejamento falhou, usando plano local", e);
      return { ok: true as const, aviso: `IA indisponível (${(e as Error)?.message ?? "erro"}). Usado plano local.`, ...planoLocal(data.titulo, data.descricao) };
    }
  });
