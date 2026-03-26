-- Seed default WhatsApp flow configuration in site_settings
INSERT INTO site_settings (key, value, description)
VALUES (
  'whatsapp_flow',
  '{
    "welcome_message": "Olá {nome}! Seja bem vindo(a)! 🎉\n\nGostaríamos de te apresentar a *Fórmula do Boi*!\n\nAcesse nosso Marketplace e confira nossas ofertas exclusivas:\n👉 https://app.formuladoboi.com\n\nDeseja mais informações? Responda com o número da opção:\n\n1️⃣ Ver catálogo completo\n2️⃣ Falar com um consultor\n3️⃣ Conhecer nossos serviços",
    "options": [
      {"key": "1", "label": "Ver catálogo", "response": "Confira nosso catálogo completo em: https://app.formuladoboi.com 🐂"},
      {"key": "2", "label": "Falar com consultor", "response": "Ótimo! Em breve um de nossos consultores entrará em contato com você! 😊"},
      {"key": "3", "label": "Conhecer serviços", "response": "Conheça todos os nossos serviços em: https://formuladoboi.com 🌟"}
    ],
    "flow_timeout_minutes": 60
  }'::jsonb,
  'Configuração do fluxo de mensagens WhatsApp automáticas'
)
ON CONFLICT (key) DO NOTHING;
