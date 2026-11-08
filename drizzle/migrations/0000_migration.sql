CREATE TABLE public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'simples',
  status text NOT NULL DEFAULT 'todo',
  posicao double precision NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now(),
  concluido_em timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarefas TO authenticated;
GRANT ALL ON public.tarefas TO service_role;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dono le" ON public.tarefas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dono cria" ON public.tarefas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dono altera" ON public.tarefas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dono exclui" ON public.tarefas FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.subtarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  titulo text NOT NULL,
  minutos_estimados integer NOT NULL DEFAULT 30,
  feita boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtarefas TO authenticated;
GRANT ALL ON public.subtarefas TO service_role;
ALTER TABLE public.subtarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dono le sub" ON public.subtarefas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dono cria sub" ON public.subtarefas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dono altera sub" ON public.subtarefas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dono exclui sub" ON public.subtarefas FOR DELETE TO authenticated USING (auth.uid() = user_id);