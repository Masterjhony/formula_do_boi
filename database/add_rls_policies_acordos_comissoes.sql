-- ─────────────────────────────────────────────────────────────────────────
-- RLS policies para as tabelas criadas em add_acordos_e_comissoes_tables.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Contexto: ao rodar a migration anterior o Supabase Studio mostrou popup
-- e o usuário clicou "Run and enable RLS" — então as tabelas existem com
-- RLS ON mas sem policies (= ninguém via REST consegue ler/escrever, exceto
-- service_role que bypassa RLS por padrão).
--
-- Como o backend só acessa essas tabelas via service_role (server-side),
-- isso não quebra nada. Estas policies só liberam SELECT para usuários
-- autenticados — útil caso futuro client component leia direto. Mutations
-- continuam restritas a service_role.

-- bula_acordos_criadores ───────────────────────────────────────────────
ALTER TABLE bula_acordos_criadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura autenticada de acordos" ON bula_acordos_criadores;
CREATE POLICY "Leitura autenticada de acordos"
    ON bula_acordos_criadores
    FOR SELECT
    TO authenticated
    USING (true);

-- bula_comissoes_padrao_assessor ──────────────────────────────────────
ALTER TABLE bula_comissoes_padrao_assessor ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura autenticada de comissoes" ON bula_comissoes_padrao_assessor;
CREATE POLICY "Leitura autenticada de comissoes"
    ON bula_comissoes_padrao_assessor
    FOR SELECT
    TO authenticated
    USING (true);

-- ─────────────────────────────────────────────────────────────────────────
-- Verificação: as policies devem aparecer aqui
-- ─────────────────────────────────────────────────────────────────────────
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('bula_acordos_criadores', 'bula_comissoes_padrao_assessor')
ORDER BY tablename, policyname;
