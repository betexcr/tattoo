-- ============================================================
-- Ink & Soul — Seed Data
-- Run AFTER supabase-schema.sql in the Supabase SQL Editor
-- ============================================================

-- Portfolio Items
insert into public.portfolio_items (title, style, description, image_url, sort_order) values
  ('Serpiente Mística',  'Fine Line',       'Serpiente envolvente con elementos botánicos',         'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=500&fit=crop', 1),
  ('Rosa Geométrica',    'Geometric',       'Rosa deconstruida en formas geométricas',              'https://images.unsplash.com/photo-1590246814883-57c511e76543?w=400&h=500&fit=crop', 2),
  ('Luna Creciente',     'Dotwork',         'Luna con detalles en puntillismo',                     'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=500&fit=crop', 3),
  ('Mariposa Acuarela',  'Watercolor',      'Mariposa con splash de colores',                       'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=400&h=500&fit=crop', 4),
  ('Mandala Sagrado',    'Mandala',         'Mandala intrincado con simbolismo espiritual',          'https://images.unsplash.com/photo-1475727946784-2f8a15d79809?w=400&h=500&fit=crop', 5),
  ('Jaguar Tribal',      'Blackwork',       'Jaguar en estilo tribal contemporáneo',                 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=500&fit=crop', 6),
  ('Flor de Loto',       'Fine Line',       'Loto minimalista con líneas delicadas',                 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop', 7),
  ('Calavera Floral',    'Neo Traditional', 'Calavera decorada con flores mexicanas',                'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=500&fit=crop', 8);

-- Shop Items — Cuadros
insert into public.shop_items (title, price, image_url, category, description, in_stock) values
  ('Cuadro "Serpiente Mística"', 180, 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=500&fit=crop', 'cuadros', 'Impresión giclée sobre lienzo, marco de madera negra. 40x50cm. Edición limitada de 50 piezas.', true),
  ('Cuadro "Mandala Cósmico"',  320, 'https://images.unsplash.com/photo-1475727946784-2f8a15d79809?w=400&h=500&fit=crop', 'cuadros', 'Original pintado a mano con tinta y acrílico sobre lienzo. Pieza única 50x60cm.', true),
  ('Cuadro "Luna Creciente"',   150, 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=500&fit=crop', 'cuadros', 'Lámina de arte en papel premium 300g con marco minimalista. 30x40cm.', true),
  ('Cuadro "Flor de Loto"',     220, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop', 'cuadros', 'Técnica mixta sobre lienzo. Detalles en pan de oro. 40x40cm. Pieza única.', true),
  ('Tríptico "Geometría Sagrada"', 450, 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=500&fit=crop', 'cuadros', 'Set de 3 cuadros con diseños geométricos interconectados. 25x35cm cada uno.', false);

-- Shop Items — Ropa
insert into public.shop_items (title, price, image_url, category, description, in_stock, sizes, colors) values
  ('Camiseta "Ink & Soul"',      38,  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', 'ropa', 'Algodón orgánico 100%. Diseño exclusivo serigrafiado a mano. Corte unisex.', true, array['S','M','L','XL'], array['Negro','Blanco']),
  ('Hoodie "Sacred Lines"',      65,  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop', 'ropa', 'Sudadera con capucha de algodón premium. Diseño de líneas sagradas bordado en el pecho.', true, array['S','M','L','XL'], array['Negro','Gris Oscuro']),
  ('Crop Top "Mandala"',         32,  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop', 'ropa', 'Crop top de algodón con mandala estampado en la espalda. Corte femenino.', true, array['XS','S','M','L'], array['Negro','Blanco','Terracota']),
  ('Joggers "Dotwork"',          55,  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=500&fit=crop', 'ropa', 'Pantalón jogger con detalle de dotwork estampado en la pierna. Algodón French Terry.', true, array['S','M','L','XL'], array['Negro']),
  ('Chaqueta Denim "Serpiente"', 120, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', 'ropa', 'Chaqueta denim pintada a mano con diseño de serpiente en la espalda. Pieza única.', false, array['M','L'], array['Azul Denim']);

-- Shop Items — Zapatos
insert into public.shop_items (title, price, image_url, category, description, in_stock, sizes) values
  ('Sneakers "Fine Line" Custom', 145, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop', 'zapatos', 'Zapatillas blancas personalizadas con diseño fine line pintado a mano.', true, array['36','37','38','39','40','41','42','43','44']),
  ('Boots "Blackwork"',           180, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=500&fit=crop', 'zapatos', 'Botines de cuero negro con grabado blackwork en el lateral.', true, array['37','38','39','40','41','42']),
  ('Slides "Mandala"',            48,  'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=500&fit=crop', 'zapatos', 'Sandalias slides con mandala impreso en la plantilla y correa.', true, array['36-37','38-39','40-41','42-43']),
  ('Canvas Hi-Top "Geometric"',   95,  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop', 'zapatos', 'Zapatillas de caña alta con patrones geométricos pintados a mano.', false, array['38','39','40','41','42','43']);

-- Shop Items — Accesorios
insert into public.shop_items (title, price, image_url, category, description, in_stock, colors) values
  ('Gorra "Ink & Soul" Bordada', 35, 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop', 'accesorios', 'Gorra de algodón con logo bordado. Ajuste regulable.', true, array['Negro','Beige']);
insert into public.shop_items (title, price, image_url, category, description, in_stock) values
  ('Tote Bag "Sacred Geometry"', 28, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop', 'accesorios', 'Bolsa de tela orgánica con estampado de geometría sagrada.', true),
  ('Collar Colgante "Luna"',     42, 'https://images.unsplash.com/photo-1515562141589-67f0d569b6fc?w=400&h=500&fit=crop', 'accesorios', 'Colgante de plata 925 con diseño de luna creciente grabada. Cadena de 45cm.', true),
  ('Pulsera "Serpiente"',        38, 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=500&fit=crop', 'accesorios', 'Pulsera de plata 925 con forma de serpiente envolvente. Ajustable.', true),
  ('Funda iPhone "Botanical"',   25, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=500&fit=crop', 'accesorios', 'Funda rígida con diseño botánico exclusivo. Para iPhone 14/15/16.', true),
  ('Pin Set "Tattoo Icons"',     18, 'https://images.unsplash.com/photo-1614680376408-81e91bbe261f?w=400&h=500&fit=crop', 'accesorios', 'Set de 5 pins esmaltados: rosa, serpiente, luna, mandala y calavera.', true);

-- Courses
insert into public.courses (title, description, date, duration, price, spots, image_url, level) values
  ('Introducción al Tattoo Art',       'Aprende las bases del tatuaje: higiene, máquinas, técnica de línea y sombreado.',                    '2026-04-05', '8 horas (2 días)', 180, 6, 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=400&fit=crop', 'beginner'),
  ('Fine Line & Dotwork Masterclass',  'Perfecciona la técnica de línea fina y puntillismo. Incluye práctica en piel sintética.',            '2026-04-19', '6 horas',          150, 4, 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=400&fit=crop', 'intermediate'),
  ('Diseño Digital para Tatuadores',   'Procreate e iPad como herramientas de diseño. Crea stencils digitales profesionales.',               '2026-05-10', '5 horas',          120, 8, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&fit=crop', 'beginner'),
  ('Taller de Acuarela & Color',       'Técnicas de color y acuarela aplicadas al tatuaje. Teoría del color y mezclas.',                     '2026-05-24', '6 horas',          160, 5, 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&h=400&fit=crop', 'advanced');

-- Reminders
insert into public.reminders (title, date, time, type, completed) values
  ('Preparar diseño para María López',    '2026-03-11', '18:00', 'appointment', false),
  ('Comprar agujas 5RL y 7RL',            '2026-03-10', '10:00', 'custom',      false),
  ('Seguimiento curación - Luna García',  '2026-03-17', '12:00', 'followup',    false),
  ('Confirmar cita con Ana Torres',       '2026-03-13', '09:00', 'appointment', true),
  ('Publicar fotos portfolio Instagram',  '2026-03-09', '20:00', 'custom',      false);
