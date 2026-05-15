// Service worker mínimo — existe só para manter o PWA instalável.
// Bump a versão sempre que este arquivo mudar (força os clientes a atualizarem).
const SW_VERSION = 'formula-boi-v2';

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// IMPORTANTE: o handler de fetch existe (o Chrome exige um para o app ser
// "instalável"), mas ele NÃO chama event.respondWith(). Sem respondWith, cada
// requisição cai no tratamento nativo do navegador — comportamento idêntico a
// não ter service worker.
//
// A versão anterior fazia `event.respondWith(fetch(event.request))`, um
// pass-through que interceptava TODA requisição do site (inclusive o login no
// Supabase) sem nenhum tratamento de erro: qualquer falha no re-fetch virava
// um "Failed to fetch" cru na tela. Não voltar a esse padrão.
self.addEventListener('fetch', () => {
    // intencionalmente vazio — deixa o navegador resolver a requisição
});
