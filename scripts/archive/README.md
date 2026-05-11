# scripts/archive

Scripts one-shot que **já foram executados em produção** e ficam aqui apenas como registro histórico/auditoria. Não rodar de novo a cega: muitos foram desenhados para uma janela de dados específica (lote, leilão, data, assessor).

Padrão de nomes:

| Prefixo | O que costuma fazer |
|---|---|
| `ajustar_*`, `apply_*`, `aplicar_*` | Ajustes pontuais (taxas, comissões, status) |
| `backfill_*` | Preenche colunas novas a partir de dados existentes |
| `fix_*`, `revert_*`, `redirect_*` | Correções de bugs ou reversões de operações erradas |
| `insert_*`, `upsert_*` | Carga inicial de uma fonte externa (xlsx, csv) |
| `unify_*` | Normalizações cruzadas (nomes de assessores, leilões) |
| `discover_*`, `verify_*`, `extract_*` | Diagnóstico que escreve em arquivo, sem alterar DB |

Antes de rodar qualquer um destes:

1. Leia o arquivo todo — quase sempre tem hard-coded ID/data.
2. Faça um dry-run apontando para uma cópia do DB ou um ambiente de staging.
3. Confirme com o time se a operação ainda faz sentido — pode já ter sido superada por outra correção.
