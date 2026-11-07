UPDATE projects SET
  description_es = 'En desarrollo. App de música personal (v1) que empecé a mitad de verano para usarla yo: quería algo a mi medida, sin depender de las grandes suscripciones, y con la idea de publicarla en Play Store a medio plazo.',
  description_en = 'In development. Personal music app (v1) I started mid-summer for my own use: I wanted something built my way, without relying on the major subscriptions, and with the goal of publishing it on the Play Store in the medium term.',
  docs_es = 'Quería una app de música propia que pudiera usar a diario sin atarme a las suscripciones de las plataformas grandes, y con margen para ir puliéndola a mi ritmo.

La construí por cuenta propia con React, Vite y PWA en el frontend, y FastAPI en el backend. Lo que hay ahora es la v1: una base funcional, todavía lejos del nivel de optimización de productos maduros del mercado.

Sigue en desarrollo. Cuando termine el TFG quiero publicar una versión más pulida.
Código: https://github.com/ivanmarrtin2703/Melodix-v1
Demo en este portfolio: /demos/melodix/',
  docs_en = 'I wanted my own music app I could use every day without being tied to the major platforms'' subscriptions, with room to keep refining it at my own pace.

I built it on my own with React, Vite and a PWA on the frontend, and FastAPI on the backend. What''s here now is v1: a working base, still far from the optimization level of mature market products.

It is still in development. When I finish my final-year project (TFG), I want to publish a more polished version.
Code: https://github.com/ivanmarrtin2703/Melodix-v1
Demo on this portfolio: /demos/melodix/',
  updated_at = datetime('now')
WHERE id = 4;

UPDATE projects SET
  description_es = 'En desarrollo. Idea propia de vídeo marketing automatizado para clientes de Ovisoft: de un chat con productos y keywords a piezas para Instagram y TikTok. No llegué a cerrarlo por falta de recursos.',
  description_en = 'In development. Own idea for automated video marketing for Ovisoft clients: from a chat with products and keywords to pieces for Instagram and TikTok. I could not finish it due to lack of resources.',
  docs_es = 'El objetivo era ayudar a empresas clientes de Ovisoft a generar contenido corto y constante para redes sin montar un equipo de vídeo cada mes.

La idea del producto: una suscripción mensual con un chat donde meter productos, palabras clave y contexto, y el sistema generaría vídeos para Instagram, TikTok y plataformas similares. Stack: Angular y TypeScript en el frontend; Node y Express en el backend.

No está terminado: faltaron recursos para completarlo. Queda una demo de la interfaz en este portfolio; sirve para ver el enfoque, no un producto cerrado.
Demo UI: /demos/ovisoft/',
  docs_en = 'The goal was to help Ovisoft client companies generate short, steady social content without standing up a video team every month.

The product idea: a monthly subscription with a chat where they entered products, keywords and context, and the system would generate videos for Instagram, TikTok and similar platforms. Stack: Angular and TypeScript on the frontend; Node and Express on the backend.

It is not finished: there were not enough resources to complete it. A UI demo remains on this portfolio; it shows the product direction, not a closed product.
UI demo: /demos/ovisoft/',
  updated_at = datetime('now')
WHERE id = 5;
