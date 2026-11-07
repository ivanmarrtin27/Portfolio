UPDATE projects SET
  description_es = 'En desarrollo. Producto propio: recepcionista con IA por WhatsApp para negocios con cita. Responde, agenda y recuerda; ahora en piloto.',
  description_en = 'In development. Own product: AI WhatsApp receptionist for appointment businesses. Replies, books and reminds; currently in pilot.',
  docs_es = 'Lo empecé porque muchos locales pierden mensajes fuera de horario o mientras atienden. Quería un recepcionista que viviera donde ya escriben los clientes — WhatsApp — sin obligar al local a montar otra app ni a configurarlo todo solo.

Klaro responde precios y horarios, agenda citas y recuerda al cliente. Incluye landing de captación, bot multi-local con menús interactivos (servicio → día → hora → confirmar), panel agency y panel Hoy para ver la agenda del día. La IA tiene fallback por reglas si el proveedor falla.

Stack: Cloudflare Pages, Functions, D1, JavaScript y WhatsApp Cloud API. Modelo agency managed: yo configuro cada negocio. Ahora mismo en piloto.
Landing en vivo: https://klaroapp.pages.dev
Probar chat: https://klaroapp.pages.dev/demo/
Código: https://github.com/ivanmarrtin2703/Klaro-Chat-Bot
Pack orientativo: 549 € setup + 129 €/mes. Fuera de v1: pagos al cliente final y self-serve.',
  docs_en = 'I started it because many shops miss messages after hours or while serving clients. I wanted a receptionist that lives where clients already write — WhatsApp — without forcing the shop to install another app or configure everything alone.

Klaro handles prices and hours, books appointments and sends reminders. It includes a lead landing, a multi-location bot with interactive menus (service → day → time → confirm), an agency panel and a Hoy panel for the day''s agenda. The AI has a rule-based fallback if the provider fails.

Stack: Cloudflare Pages, Functions, D1, JavaScript and WhatsApp Cloud API. Agency-managed model: I configure each business. Currently in pilot.
Live landing: https://klaroapp.pages.dev
Try chat: https://klaroapp.pages.dev/demo/
Code: https://github.com/ivanmarrtin2703/Klaro-Chat-Bot
Indicative pack: €549 setup + €129/mo. Out of v1: end-customer payments and self-serve.',
  updated_at = datetime('now')
WHERE id = 7
   OR title_es = 'Klaro-Chat Bot'
   OR title_en = 'Klaro-Chat Bot';
