// Centralização de assessores conforme diretiva do chefe (2026-05-11).
// Pedro Barnabé e Matheus Amormino → atribuídos a Marcelo Carneiro em
// agregações cross-leilão (ranking, faturamento, comissão a pagar). O nome
// cru permanece em `bula_leilao_fechamento.por_assessor[]` para preservar
// histórico e permitir edição do fechamento original.

const DIACRITICS_RE = /[̀-ͯ]/g

const stripDiacritics = (s: string) =>
  s.normalize('NFD').replace(DIACRITICS_RE, '')

const CENTRALIZED_UNDER_MARCELO: ReadonlySet<string> = new Set([
  'pedro barnabe',
  'matheus amormino',
])

export const MARCELO_CARNEIRO = 'Marcelo Carneiro'

export function normalizeAssessorNome(nome: string | null | undefined): string {
  const raw = (nome ?? '').trim()
  if (!raw) return ''
  const key = stripDiacritics(raw).toLowerCase()
  if (CENTRALIZED_UNDER_MARCELO.has(key)) return MARCELO_CARNEIRO
  return raw
}
