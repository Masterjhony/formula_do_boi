// URL interna da pré-reserva CONAN (rota Next /conan/checkout).
// SSR-safe: retorna sempre o mesmo caminho (sem ler window) pra
// não gerar mismatch de hidratação no atributo href.
export function getCheckoutUrl(base = '/conan/checkout') {
  return base
}
