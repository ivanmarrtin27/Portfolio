UPDATE profile SET
  about_es = REPLACE(about_es, 'almeriense', 'Almeriense')
WHERE id = 1;
