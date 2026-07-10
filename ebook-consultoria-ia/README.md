# E-book de vendas — Consultoria de IA (ecossistema Claude)

Material consultivo de vendas para a consultoria de implementação de IA de
**Fabrício Lucas Pereira** (advogados + corretores/avaliadores).

## Arquivos

- **`index.html`** — o e-book completo, diagramado (16 páginas A4 retrato). Fonte única, sem dependências externas; abre em qualquer navegador.
- **`ebook-consultoria-ia.pdf`** — versão exportada para PDF, pronta para envio.

## Identidade visual

Padrão "Fabrício Advogado": vermelho `#A81D20`, cinza escuro `#333333`, cinza
médio `#7F7F7F`, tipografia serifada, estética jurídica premium. Rodapé com
OAB/MG 141.462 · CRECI/MG 55.756 · CNAI 49.018 e numeração de página.

## Estrutura (16 páginas)

Capa · carta de abertura · diagnóstico (advogados / corretores) · a virada de
chave · 4 casos reais · quadro antes/depois · o método em 5 etapas · objeções ·
bio de autoridade · CTA (diagnóstico gratuito de 30 min).

## Placeholders a preencher

- Página 15: foto profissional (`[PLACEHOLDER]` marcado no HTML).

## Reexportar o PDF

Edite `index.html` e imprima para PDF pelo navegador (A4, margens “nenhuma”,
“gráficos de plano de fundo” ligado), ou use um Chromium headless:

```bash
# exemplo com Playwright/Chromium
node -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+__dirname+'/index.html',{waitUntil:'networkidle'});await p.pdf({path:'ebook-consultoria-ia.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});await b.close();})()"
```
