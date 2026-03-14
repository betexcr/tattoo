#!/usr/bin/env node
/**
 * Firestore seed script — run with: node seed-firestore.mjs
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account
 * JSON file, OR being logged in via `firebase login` and passing the project ID.
 *
 * Usage:
 *   export GCLOUD_PROJECT=your-firebase-project-id
 *   node seed-firestore.mjs
 *
 * Or using firebase-admin with application default credentials.
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID

initializeApp({
  credential: applicationDefault(),
  projectId,
})

const db = getFirestore()

const portfolioItems = [
  { title: 'Serpiente Mística', style: 'Fine Line', description: 'Serpiente envolvente con elementos botánicos', image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=500&fit=crop', published: true, sort_order: 1, created_at: new Date().toISOString() },
  { title: 'Rosa Geométrica', style: 'Geometric', description: 'Rosa deconstruida en formas geométricas', image_url: 'https://images.unsplash.com/photo-1590246814883-57c511e76543?w=400&h=500&fit=crop', published: true, sort_order: 2, created_at: new Date().toISOString() },
  { title: 'Luna Creciente', style: 'Dotwork', description: 'Luna con detalles en puntillismo', image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=500&fit=crop', published: true, sort_order: 3, created_at: new Date().toISOString() },
  { title: 'Mariposa Acuarela', style: 'Watercolor', description: 'Mariposa con splash de colores', image_url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=400&h=500&fit=crop', published: true, sort_order: 4, created_at: new Date().toISOString() },
  { title: 'Mandala Sagrado', style: 'Mandala', description: 'Mandala intrincado con simbolismo espiritual', image_url: 'https://images.unsplash.com/photo-1475727946784-2f8a15d79809?w=400&h=500&fit=crop', published: true, sort_order: 5, created_at: new Date().toISOString() },
  { title: 'Jaguar Tribal', style: 'Blackwork', description: 'Jaguar en estilo tribal contemporáneo', image_url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=500&fit=crop', published: true, sort_order: 6, created_at: new Date().toISOString() },
  { title: 'Flor de Loto', style: 'Fine Line', description: 'Loto minimalista con líneas delicadas', image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop', published: true, sort_order: 7, created_at: new Date().toISOString() },
  { title: 'Calavera Floral', style: 'Neo Traditional', description: 'Calavera decorada con flores mexicanas', image_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=500&fit=crop', published: true, sort_order: 8, created_at: new Date().toISOString() },
]

const shopItems = [
  // Cuadros
  { title: 'Cuadro "Serpiente Mística"', price: 180, image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=500&fit=crop', category: 'cuadros', description: 'Impresión giclée sobre lienzo, marco de madera negra. 40x50cm. Edición limitada de 50 piezas.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
  { title: 'Cuadro "Mandala Cósmico"', price: 320, image_url: 'https://images.unsplash.com/photo-1475727946784-2f8a15d79809?w=400&h=500&fit=crop', category: 'cuadros', description: 'Original pintado a mano con tinta y acrílico sobre lienzo. Pieza única 50x60cm.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
  { title: 'Cuadro "Luna Creciente"', price: 150, image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=500&fit=crop', category: 'cuadros', description: 'Lámina de arte en papel premium 300g con marco minimalista. 30x40cm.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
  { title: 'Cuadro "Flor de Loto"', price: 220, image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop', category: 'cuadros', description: 'Técnica mixta sobre lienzo. Detalles en pan de oro. 40x40cm. Pieza única.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
  { title: 'Tríptico "Geometría Sagrada"', price: 450, image_url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=500&fit=crop', category: 'cuadros', description: 'Set de 3 cuadros con diseños geométricos interconectados. 25x35cm cada uno.', in_stock: false, sizes: [], colors: [], created_at: new Date().toISOString() },
  // Ropa
  { title: 'Camiseta "Ink & Soul"', price: 38, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', category: 'ropa', description: 'Algodón orgánico 100%. Diseño exclusivo serigrafiado a mano. Corte unisex.', in_stock: true, sizes: ['S','M','L','XL'], colors: ['Negro','Blanco'], created_at: new Date().toISOString() },
  { title: 'Hoodie "Sacred Lines"', price: 65, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop', category: 'ropa', description: 'Sudadera con capucha de algodón premium. Diseño de líneas sagradas bordado en el pecho.', in_stock: true, sizes: ['S','M','L','XL'], colors: ['Negro','Gris Oscuro'], created_at: new Date().toISOString() },
  { title: 'Crop Top "Mandala"', price: 32, image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop', category: 'ropa', description: 'Crop top de algodón con mandala estampado en la espalda. Corte femenino.', in_stock: true, sizes: ['XS','S','M','L'], colors: ['Negro','Blanco','Terracota'], created_at: new Date().toISOString() },
  { title: 'Joggers "Dotwork"', price: 55, image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=500&fit=crop', category: 'ropa', description: 'Pantalón jogger con detalle de dotwork estampado en la pierna. Algodón French Terry.', in_stock: true, sizes: ['S','M','L','XL'], colors: ['Negro'], created_at: new Date().toISOString() },
  { title: 'Chaqueta Denim "Serpiente"', price: 120, image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', category: 'ropa', description: 'Chaqueta denim pintada a mano con diseño de serpiente en la espalda. Pieza única.', in_stock: false, sizes: ['M','L'], colors: ['Azul Denim'], created_at: new Date().toISOString() },
  // Zapatos
  { title: 'Sneakers "Fine Line" Custom', price: 145, image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop', category: 'zapatos', description: 'Zapatillas blancas personalizadas con diseño fine line pintado a mano.', in_stock: true, sizes: ['36','37','38','39','40','41','42','43','44'], colors: [], created_at: new Date().toISOString() },
  { title: 'Boots "Blackwork"', price: 180, image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=500&fit=crop', category: 'zapatos', description: 'Botines de cuero negro con grabado blackwork en el lateral.', in_stock: true, sizes: ['37','38','39','40','41','42'], colors: [], created_at: new Date().toISOString() },
  { title: 'Slides "Mandala"', price: 48, image_url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=500&fit=crop', category: 'zapatos', description: 'Sandalias slides con mandala impreso en la plantilla y correa.', in_stock: true, sizes: ['36-37','38-39','40-41','42-43'], colors: [], created_at: new Date().toISOString() },
  { title: 'Canvas Hi-Top "Geometric"', price: 95, image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop', category: 'zapatos', description: 'Zapatillas de caña alta con patrones geométricos pintados a mano.', in_stock: false, sizes: ['38','39','40','41','42','43'], colors: [], created_at: new Date().toISOString() },
  // Accesorios
  { title: 'Gorra "Ink & Soul" Bordada', price: 35, image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop', category: 'accesorios', description: 'Gorra de algodón con logo bordado. Ajuste regulable.', in_stock: true, sizes: [], colors: ['Negro','Beige'], created_at: new Date().toISOString() },
  { title: 'Tote Bag "Sacred Geometry"', price: 28, image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop', category: 'accesorios', description: 'Bolsa de tela orgánica con estampado de geometría sagrada.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
  { title: 'Collar Colgante "Luna"', price: 42, image_url: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6fc?w=400&h=500&fit=crop', category: 'accesorios', description: 'Colgante de plata 925 con diseño de luna creciente grabada. Cadena de 45cm.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
  { title: 'Pulsera "Serpiente"', price: 38, image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=500&fit=crop', category: 'accesorios', description: 'Pulsera de plata 925 con forma de serpiente envolvente. Ajustable.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
  { title: 'Funda iPhone "Botanical"', price: 25, image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=500&fit=crop', category: 'accesorios', description: 'Funda rígida con diseño botánico exclusivo. Para iPhone 14/15/16.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
  { title: 'Pin Set "Tattoo Icons"', price: 18, image_url: 'https://images.unsplash.com/photo-1614680376408-81e91bbe261f?w=400&h=500&fit=crop', category: 'accesorios', description: 'Set de 5 pins esmaltados: rosa, serpiente, luna, mandala y calavera.', in_stock: true, sizes: [], colors: [], created_at: new Date().toISOString() },
]

const courses = [
  { title: 'Introducción al Tattoo Art', description: 'Aprende las bases del tatuaje: higiene, máquinas, técnica de línea y sombreado.', date: '2026-04-05', duration: '8 horas (2 días)', price: 180, spots: 6, image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=400&fit=crop', level: 'beginner', created_at: new Date().toISOString() },
  { title: 'Fine Line & Dotwork Masterclass', description: 'Perfecciona la técnica de línea fina y puntillismo. Incluye práctica en piel sintética.', date: '2026-04-19', duration: '6 horas', price: 150, spots: 4, image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=400&fit=crop', level: 'intermediate', created_at: new Date().toISOString() },
  { title: 'Diseño Digital para Tatuadores', description: 'Procreate e iPad como herramientas de diseño. Crea stencils digitales profesionales.', date: '2026-05-10', duration: '5 horas', price: 120, spots: 8, image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&fit=crop', level: 'beginner', created_at: new Date().toISOString() },
  { title: 'Taller de Acuarela & Color', description: 'Técnicas de color y acuarela aplicadas al tatuaje. Teoría del color y mezclas.', date: '2026-05-24', duration: '6 horas', price: 160, spots: 5, image_url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&h=400&fit=crop', level: 'advanced', created_at: new Date().toISOString() },
]

const reminders = [
  { title: 'Preparar diseño para María López', date: '2026-03-11', time: '18:00', type: 'appointment', completed: false, created_at: new Date().toISOString() },
  { title: 'Comprar agujas 5RL y 7RL', date: '2026-03-10', time: '10:00', type: 'custom', completed: false, created_at: new Date().toISOString() },
  { title: 'Seguimiento curación - Luna García', date: '2026-03-17', time: '12:00', type: 'followup', completed: false, created_at: new Date().toISOString() },
  { title: 'Confirmar cita con Ana Torres', date: '2026-03-13', time: '09:00', type: 'appointment', completed: true, created_at: new Date().toISOString() },
  { title: 'Publicar fotos portfolio Instagram', date: '2026-03-09', time: '20:00', type: 'custom', completed: false, created_at: new Date().toISOString() },
]

async function seed() {
  console.log('Seeding Firestore...')

  for (const item of portfolioItems) {
    await db.collection('portfolio_items').add(item)
  }
  console.log(`  ✓ ${portfolioItems.length} portfolio items`)

  for (const item of shopItems) {
    await db.collection('shop_items').add(item)
  }
  console.log(`  ✓ ${shopItems.length} shop items`)

  for (const item of courses) {
    await db.collection('courses').add(item)
  }
  console.log(`  ✓ ${courses.length} courses`)

  for (const item of reminders) {
    await db.collection('reminders').add(item)
  }
  console.log(`  ✓ ${reminders.length} reminders`)

  console.log('Done! Firestore has been seeded.')
}

seed().catch(console.error)
