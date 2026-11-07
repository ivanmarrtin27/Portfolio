UPDATE profile SET
  about_es = REPLACE(
    about_es,
    'para uso personal, para venderlos o para desarrollar lo que alguien necesita — ya sea para sí mismo o para un local pequeño.',
    'para uso personal, para venderlos o para desarrollar lo que alguien necesita, ya sea para sí mismo o para un local pequeño.'
  ),
  about_en = REPLACE(
    about_en,
    'for personal use, to sell, or to build what someone needs — for themselves or for a small local business.',
    'for personal use, to sell, or to build what someone needs, for themselves or for a small local business.'
  )
WHERE id = 1;
