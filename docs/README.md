# docs/

Documentação técnica do projeto que não cabe no [README](../README.md) raiz nem no [architecture.md](../architecture.md).

| Arquivo | Conteúdo |
|---|---|
| [whatsapp-central.md](./whatsapp-central.md) | Central WhatsApp end-to-end — VPS, fluxo, classificador, templates, campanhas, comandos de grupo |
| [assets/brandbook/](./assets/brandbook/) | Brandbook em PDF (referência visual permanente) |
| [assets/catalogos/](./assets/catalogos/) | Catálogos digitais de leilões (PDFs grandes — pense antes de commitar mais; se um catálogo virar obsoleto, `git rm --cached <arquivo>` desliga o tracking sem apagar do disco) |
| [legacy/](./legacy/) | Versões antigas/protótipos preservados (HTMLs órfãos, mockups) |

A documentação operacional do CLI e dos serviços externos fica em [CLAUDE.md](../CLAUDE.md) na raiz.
