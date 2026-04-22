-- ============================================================
-- MIGRAÇÃO: Cronograma de Leilões 2026
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

CREATE TABLE IF NOT EXISTS cronograma_leiloes (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data                  DATE NOT NULL,
    dia_semana            TEXT,
    hora                  TEXT,
    nome                  TEXT NOT NULL,
    criador               TEXT,
    presencial            TEXT,   -- VIRTUAL | PRESENCIAL | EXPOGRANDE | EXPOZEBU
    leiloeira             TEXT,
    raca                  TEXT,
    qtd_animais           INTEGER,
    sexo                  TEXT,
    comissao              TEXT,
    contrato              TEXT,
    faturamento_previsto  NUMERIC(15,2),
    faturamento_realizado NUMERIC(15,2),
    venda_bula            NUMERIC(15,2),
    comissao_receber      TEXT,
    recebido              TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_cronograma_leiloes_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cronograma_leiloes_updated_at ON cronograma_leiloes;
CREATE TRIGGER trg_cronograma_leiloes_updated_at
BEFORE UPDATE ON cronograma_leiloes
FOR EACH ROW EXECUTE FUNCTION update_cronograma_leiloes_updated_at();

-- RLS: somente admins
ALTER TABLE cronograma_leiloes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage cronograma" ON cronograma_leiloes;
CREATE POLICY "Admins can manage cronograma"
ON cronograma_leiloes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================
-- SEED: importa os dados do cronograma existente
-- ============================================================
INSERT INTO cronograma_leiloes (data, dia_semana, hora, nome, criador, presencial, leiloeira, raca, qtd_animais, sexo, comissao, contrato, faturamento_previsto, faturamento_realizado, venda_bula, comissao_receber, recebido) VALUES
-- JANEIRO
('2026-01-25','Domingo','10:00','NELORE CRISPIM','NELORE CRISPIM','','E-RURAL','PO',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-01-27','Terça-feira','19:30','MATA BONITA - REPRODUTORES','NELORE MATA BONITA','','E-RURAL','PO',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-01-29','Quinta-feira','19:30','TOUROS BEEM','NELORE BEEM','','E-RURAL','PO',NULL,'TOUROS','','',NULL,NULL,NULL,'',''),
-- FEVEREIRO
('2026-02-01','Domingo','14:00','LEILÃO KATAYAMA - ABERTURA DE SAFRA','NELORE KATAYAMA','VIRTUAL','CENTRAL LEILOES','Nelore Padrão',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-02-03','Terça-feira','17:30','SÓ CRIADOR','','','BULA REMATES','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-02-07','Sábado','09:00','LEILÃO PARTNER RG & ABS - 1ª ETAPA','NELORE RG','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-02-08','Domingo','09:00','LEILÃO PARTNER RG & ABS - 2ª ETAPA','NELORE RG','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-02-11','Quarta-feira','17:30','SÓ CRIADOR OU CORTE PREMIUM','','','BULA REMATES','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-02-20','Sexta-feira','17:00','LEILÃO GRIFES MS','','','BULA REMATES','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-02-23','Segunda-feira','20:00','LEILÃO SEMANA DA GENÉTICA GUADALUPE - DIA 1','GUADALUPE AGROPECUÁRIA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'MACHOS','','NÃO',NULL,NULL,NULL,'',''),
('2026-02-24','Terça-feira','20:00','LEILÃO SEMANA DA GENÉTICA GUADALUPE - DIA 2','GUADALUPE AGROPECUÁRIA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'MACHOS','','NÃO',NULL,NULL,NULL,'',''),
('2026-02-24','Terça-feira','19:30','7º LEILÃO NELORE BAHIA PREMIUM','NELORE BAHIA','VIRTUAL','AGRESTE LEILÕES','Nelore Padrão',NULL,'MACHOS E FÊMEAS','','NÃO',NULL,NULL,NULL,'',''),
('2026-02-25','Quarta-feira','20:00','LEILÃO SEMANA DA GENÉTICA GUADALUPE - DIA 3','GUADALUPE AGROPECUÁRIA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'MACHOS','','NÃO',NULL,NULL,NULL,'',''),
-- MARÇO
('2026-03-01','Domingo','09:00','LEILÃO TOUROS MATINHA','LEILÃO TOUROS MATINHA','','PROGRAMA LEILÕES','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-03','Terça-feira','17:00','CORTE LOG BRASIL 2.000','','','BULA','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-03-03','Terça-feira','19:30','NELORE BARRA DO DIA','NELORE BARRA DO DIA','','E-RURAL','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-06','Sexta-feira','17:00','LEILÃO DE CORTE SÓ CRIADOR','','','BULA','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-03-07','Sábado','','TOUROS NAVIRAI PARÁ','NAVIRAÍ','','','',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-08','Domingo','','TOUROS EAO','EAO AGROPECUÁRIA','','','',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-09','Segunda-feira','','MATRIZES EAO','EAO AGROPECUÁRIA','','','',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-13','Sexta-feira','17:00','GRIFES MS - RIBALTA','','','BULA','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-03-15','Domingo','09:00','REPRODUTORES CAMPARINO','FAZENDA CAMPARINO','','PROGRAMA LEILOES','PO',NULL,'MACHOS','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-15','Domingo','09:00','LS AGROPECUÁRIA','LS AGROPECUÁRIA','','E-RURAL','PO',NULL,'FÊMEAS','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-16','Segunda-feira','20:00','MATRIZES CAMPARINO','FAZENDA CAMPARINO','','PROGRAMA LEILOES','PO',NULL,'FÊMEAS','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-17','Terça-feira','17:00','SÓ CRIADOR','','','BULA','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-03-18','Quarta-feira','','4º LEILÃO AGROPECUÁRIA LAGOA DOS PATOS','AGROPECUÁRIA LAGOA DOS PATOS','','','',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-19','Quinta-feira','','NELORE VC','NELORE VC','','','',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-20','Sexta-feira','17:00','GRIFES MS','','','BULA','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-03-22','Domingo','20:00','LEILÃO NELORE PARANÁ','NELORE PARANÁ','','PROGRAMA LEILOES','PO',NULL,'MACHOS','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-23','Segunda-feira','20:00','LEILÃO KATAYAMA TRIOLOGIA','NELORE KATAYAMA','','CENTRAL','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-23','Segunda-feira','20:00','DNA MARCONDES','DNA MARCONDES','','E-RURAL','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-24','Terça-feira','20:00','LEILÃO KATAYAMA TRIOLOGIA','NELORE KATAYAMA','','CENTRAL','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-25','Quarta-feira','20:00','LEILÃO KATAYAMA TRIOLOGIA','NELORE KATAYAMA','','CENTRAL','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-25','Quarta-feira','20:00','MEGA GENÉTICA NAVIRAÍ','NAVIRAÍ','','PROGRAMA LEILOES','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-26','Quinta-feira','20:00','MEGA GENÉTICA NAVIRAÍ','NAVIRAÍ','','PROGRAMA LEILOES','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-27','Sexta-feira','17:00','SÓ CRIADOR','','','BULA','CORTE',NULL,'','','',NULL,NULL,NULL,'',''),
('2026-03-29','Domingo','10:30','BAMBU','NELORE BAMBU','','ERURAL','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-29','Domingo','09:00','MEGA GENÉTICA NAVIRAÍ','NAVIRAÍ','','PROGRAMA LEILOES','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-30','Segunda-feira','20:00','MEGA GENÉTICA NAVIRAÍ','NAVIRAÍ','','PROGRAMA LEILOES','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
('2026-03-31','Terça-feira','19:00','ELITES NB','ELITES NB','','ERURAL','PO',NULL,'','','NÃO',NULL,NULL,NULL,'',''),
-- ABRIL
('2026-04-02','Quinta-feira','19:30','2º LEILÃO VIRTUAL FB AGRO','FAZENDA BELA ROSA','VIRTUAL','E-RURAL','Nelore Padrão',40,'FÊMEAS','2% do Faturamento','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-04-05','Domingo','09:00','NOVILHOTAS TOP MATINHA','RANCHO DA MATINHA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'FÊMEAS','0,33% do Faturamento + 5% da venda','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-04-06','Segunda-feira','19:30','LEILÃO FLOC','NELORE FLOC','VIRTUAL','AGRESTE LEILÕES','Nelore Padrão',NULL,'FÊMEAS','','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-04-09','Quinta-feira','13:00','TOKA JAKARÉ - 3 NASCENTES','TOKA JAKARÉ - 3 NASCENTES','EXPOGRANDE','BULA REMATES','Nelore Padrão',76,'FÊMEAS','1% do Faturamento','NÃO',NULL,1306080,NULL,'1% do Fat.','NÃO'),
('2026-04-11','Sábado','13:00','LEILÃO IPB PRIME','NELORE IPB','EXPOGRANDE','BULA REMATES','Nelore Padrão',29,'FÊMEAS','1% do Faturamento','NÃO',NULL,854700,NULL,'1% do Fat.','NÃO'),
('2026-04-14','Terça-feira','19:30','NELORE CACHOEIRÃO','FAZENDA CACHOEIRÃO','EXPOGRANDE','BULA REMATES','Nelore Padrão',31,'FÊMEAS','1% do Faturamento','NÃO',NULL,1434000,NULL,'1% do Fat.','NÃO'),
('2026-04-19','Domingo','09:00','FÊMEAS JMP','NELORE JMP','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',160,'FÊMEAS','0,5% do Faturamento','NÃO',NULL,10373300,410400,'0,5% do Fat.','NÃO'),
('2026-04-19','Domingo','09:00','TOUROS TERRA BRAVA','FAZENDA TERRA BRAVA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',200,'MACHOS','5% da venda','NÃO',NULL,NULL,138600,'5% da venda','NÃO'),
('2026-04-22','Quarta-feira','20:00','LEILÃO MRA','NELORE MRA','VIRTUAL','BULA REMATES','Nelore Padrão',50,'FÊMEAS','1% do Faturamento','NÃO',NULL,NULL,NULL,'1% do Fat.','NÃO'),
('2026-04-28','Terça-feira','20:00','LEILÃO MATINHA EXPOZEBU - EFICIÊNCIA','RANCHO DA MATINHA','EXPOZEBU','PROGRAMA LEILÕES','Nelore Padrão',30,'FÊMEAS','A DEFINIR','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-04-30','Quinta-feira','20:00','CAMPARINO EXPOZEBU','FAZENDA CAMPARINO','EXPOZEBU','PROGRAMA LEILÕES','Nelore Padrão',NULL,'FÊMEAS','Tabela sobre faturamento','NÃO',NULL,NULL,NULL,'','NÃO'),
-- MAIO
('2026-05-02','Sábado','09:00','LEILÃO DOADORAS, ASPIRAÇÕES, MATRIZES E BEZERRAS EAO','EAO AGROPECUÁRIA','EXPOZEBU','PROGRAMA LEILÕES','Nelore Padrão',150,'FÊMEAS','0,33% do Faturamento','NÃO',NULL,NULL,NULL,'0,33% do Fat.','NÃO'),
('2026-05-03','Domingo','09:00','TOUROS EAO','EAO AGROPECUARIA','EXPOZEBU','PROGRAMA LEILÕES','Nelore Padrão',180,'MACHOS','0,33% do Faturamento','NÃO',NULL,NULL,NULL,'0,33% do Fat.','NÃO'),
('2026-05-05','Terça-feira','','LEILÃO FAZENDA GAROA','','VIRTUAL','AGRESTE LEILÕES','Nelore Pintado',40,'FÊMEAS','1% do faturamento','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-05','Terça-feira','','MATINHA EMBRIO','RANCHO DA MATINHA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'EMBRIÕES','A DEFINIR','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-07','Quinta-feira','19:00','LEILÃO MATRIZES SANTA FÉ','NELORE SANTA FÉ','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',35,'FÊMEAS','1% do faturamento + 3% da venda','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-09','Sábado','12:00','NELORE KITO / MRA - 4R','NELORE KITO - MRA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'MACHOS','1% do faturamento','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-13','Quarta-feira','19:00','GRUPO RIBALTA','GRUPO RIBALTA','VIRTUAL','BULA REMATES','Nelore Padrão',NULL,'MACHOS','1% do faturamento','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-14','Quinta-feira','','LEILÃO TOUROS SANTA NAZARÉ','NELORE SANTA NAZARÉ','PRESENCIAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'MACHOS','1% do faturamento + 3% da venda','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-17','Domingo','','MATRIZES MATINHA','RANCHO DA MATINHA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'FÊMEAS','A DEFINIR','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-19','Terça-feira','','GOLDEN BOYS MATINHA','RANCHO DA MATINHA','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'MACHOS','A DEFINIR','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-21','Quinta-feira','19:00','NELORE TRESMAR','NELORE TRESMAR','VIRTUAL','BULA REMATES','Nelore Padrão',NULL,'MACHOS','1% do faturamento','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-24','Domingo','09:30','NELORE MEAB & MODELO','','VIRTUAL','BULA REMATES','Nelore Padrão',NULL,'FÊMEAS','1% do faturamento','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-28','Quinta-feira','12:00','RANCHO DA MATINHA','','VIRTUAL','PROGRAMA LEILÕES','Nelore Padrão',NULL,'FÊMEAS','A DEFINIR','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-30','Sábado','','LS AGROPECUÁRIA','','VIRTUAL','E-RURAL','Nelore Padrão',NULL,'MACHOS','2% do Faturamento','NÃO',NULL,NULL,NULL,'','NÃO'),
('2026-05-31','Domingo','','LS AGROPECUÁRIA','','VIRTUAL','E-RURAL','Nelore Padrão',NULL,'FÊMEAS','2% do Faturamento','NÃO',NULL,NULL,NULL,'','NÃO')
ON CONFLICT DO NOTHING;
