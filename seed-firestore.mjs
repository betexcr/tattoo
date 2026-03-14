#!/usr/bin/env node
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const projectId = process.env.FIREBASE_PROJECT_ID || 'tattoo-aa948'

let accessToken = process.env.FIREBASE_TOKEN
if (!accessToken) {
  const configPath = join(homedir(), '.config', 'configstore', 'firebase-tools.json')
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  accessToken = config.tokens?.access_token
}

if (!accessToken) {
  console.error('No access token found. Run `firebase login` first.')
  process.exit(1)
}

const BASE = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents`

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'string') return { stringValue: val }
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val }
  if (typeof val === 'boolean') return { booleanValue: val }
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } }
  if (typeof val === 'object') {
    const fields = {}
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v)
    return { mapValue: { fields } }
  }
  return { stringValue: String(val) }
}

async function addDoc(collectionName, data) {
  const fields = {}
  for (const [k, v] of Object.entries(data)) fields[k] = toFirestoreValue(v)
  const res = await fetch(`${BASE}/${collectionName}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to add to ${collectionName}: ${err}`)
  }
}

const now = new Date().toISOString()

const portfolioItems = [
  { title: 'Serpiente Mística', style: 'Fine Line', description: 'Serpiente envolvente con elementos botánicos', image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=500&fit=crop', published: true, sort_order: 1, created_at: now },
  { title: 'Rosa Geométrica', style: 'Geometric', description: 'Rosa deconstruida en formas geométricas', image_url: 'https://images.unsplash.com/photo-1590246814883-57c511e76543?w=400&h=500&fit=crop', published: true, sort_order: 2, created_at: now },
  { title: 'Luna Creciente', style: 'Dotwork', description: 'Luna con detalles en puntillismo', image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=500&fit=crop', published: true, sort_order: 3, created_at: now },
  { title: 'Mariposa Acuarela', style: 'Watercolor', description: 'Mariposa con splash de colores', image_url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=400&h=500&fit=crop', published: true, sort_order: 4, created_at: now },
  { title: 'Mandala Sagrado', style: 'Mandala', description: 'Mandala intrincado con simbolismo espiritual', image_url: 'https://images.unsplash.com/photo-1475727946784-2f8a15d79809?w=400&h=500&fit=crop', published: true, sort_order: 5, created_at: now },
  { title: 'Jaguar Tribal', style: 'Blackwork', description: 'Jaguar en estilo tribal contemporáneo', image_url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=500&fit=crop', published: true, sort_order: 6, created_at: now },
  { title: 'Flor de Loto', style: 'Fine Line', description: 'Loto minimalista con líneas delicadas', image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop', published: true, sort_order: 7, created_at: now },
  { title: 'Calavera Floral', style: 'Neo Traditional', description: 'Calavera decorada con flores mexicanas', image_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=500&fit=crop', published: true, sort_order: 8, created_at: now },
]

const shopItems = [
  { title: 'Cuadro "Serpiente Mística"', price: 180, image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=500&fit=crop', category: 'cuadros', description: 'Impresión giclée sobre lienzo, marco de madera negra. 40x50cm.', in_stock: true, sizes: [], colors: [], created_at: now },
  { title: 'Cuadro "Mandala Cósmico"', price: 320, image_url: 'https://images.unsplash.com/photo-1475727946784-2f8a15d79809?w=400&h=500&fit=crop', category: 'cuadros', description: 'Original pintado a mano con tinta y acrílico sobre lienzo. 50x60cm.', in_stock: true, sizes: [], colors: [], created_at: now },
  { title: 'Cuadro "Luna Creciente"', price: 150, image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=500&fit=crop', category: 'cuadros', description: 'Lámina de arte en papel premium 300g. 30x40cm.', in_stock: true, sizes: [], colors: [], created_at: now },
  { title: 'Cuadro "Flor de Loto"', price: 220, image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop', category: 'cuadros', description: 'Técnica mixta sobre lienzo. Detalles en pan de oro. 40x40cm.', in_stock: true, sizes: [], colors: [], created_at: now },
  { title: 'Tríptico "Geometría Sagrada"', price: 450, image_url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=500&fit=crop', category: 'cuadros', description: 'Set de 3 cuadros geométricos interconectados. 25x35cm cada uno.', in_stock: false, sizes: [], colors: [], created_at: now },
  { title: 'Camiseta "Ink & Soul"', price: 38, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', category: 'ropa', description: 'Algodón orgánico 100%. Diseño exclusivo serigrafiado a mano.', in_stock: true, sizes: ['S','M','L','XL'], colors: ['Negro','Blanco'], created_at: now },
  { title: 'Hoodie "Sacred Lines"', price: 65, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop', category: 'ropa', description: 'Sudadera con capucha de algodón premium.', in_stock: true, sizes: ['S','M','L','XL'], colors: ['Negro','Gris Oscuro'], created_at: now },
  { title: 'Crop Top "Mandala"', price: 32, image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop', category: 'ropa', description: 'Crop top de algodón con mandala estampado.', in_stock: true, sizes: ['XS','S','M','L'], colors: ['Negro','Blanco','Terracota'], created_at: now },
  { title: 'Joggers "Dotwork"', price: 55, image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=500&fit=crop', category: 'ropa', description: 'Pantalón jogger con detalle dotwork.', in_stock: true, sizes: ['S','M','L','XL'], colors: ['Negro'], created_at: now },
  { title: 'Chaqueta Denim "Serpiente"', price: 120, image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', category: 'ropa', description: 'Chaqueta denim pintada a mano. Pieza única.', in_stock: false, sizes: ['M','L'], colors: ['Azul Denim'], created_at: now },
  { title: 'Sneakers "Fine Line" Custom', price: 145, image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop', category: 'zapatos', description: 'Zapatillas personalizadas con diseño fine line.', in_stock: true, sizes: ['36','37','38','39','40','41','42','43','44'], colors: [], created_at: now },
  { title: 'Boots "Blackwork"', price: 180, image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=500&fit=crop', category: 'zapatos', description: 'Botines de cuero con grabado blackwork.', in_stock: true, sizes: ['37','38','39','40','41','42'], colors: [], created_at: now },
  { title: 'Slides "Mandala"', price: 48, image_url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=500&fit=crop', category: 'zapatos', description: 'Sandalias slides con mandala impreso.', in_stock: true, sizes: ['36-37','38-39','40-41','42-43'], colors: [], created_at: now },
  { title: 'Canvas Hi-Top "Geometric"', price: 95, image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop', category: 'zapatos', description: 'Zapatillas con patrones geométricos pintados a mano.', in_stock: false, sizes: ['38','39','40','41','42','43'], colors: [], created_at: now },
  { title: 'Gorra "Ink & Soul" Bordada', price: 35, image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop', category: 'accesorios', description: 'Gorra de algodón con logo bordado.', in_stock: true, sizes: [], colors: ['Negro','Beige'], created_at: now },
  { title: 'Tote Bag "Sacred Geometry"', price: 28, image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop', category: 'accesorios', description: 'Bolsa de tela orgánica con estampado.', in_stock: true, sizes: [], colors: [], created_at: now },
  { title: 'Collar Colgante "Luna"', price: 42, image_url: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6fc?w=400&h=500&fit=crop', category: 'accesorios', description: 'Colgante de plata 925 con luna creciente.', in_stock: true, sizes: [], colors: [], created_at: now },
  { title: 'Pulsera "Serpiente"', price: 38, image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=500&fit=crop', category: 'accesorios', description: 'Pulsera de plata 925 con serpiente envolvente.', in_stock: true, sizes: [], colors: [], created_at: now },
  { title: 'Funda iPhone "Botanical"', price: 25, image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=500&fit=crop', category: 'accesorios', description: 'Funda rígida con diseño botánico.', in_stock: true, sizes: [], colors: [], created_at: now },
  { title: 'Pin Set "Tattoo Icons"', price: 18, image_url: 'https://images.unsplash.com/photo-1614680376408-81e91bbe261f?w=400&h=500&fit=crop', category: 'accesorios', description: 'Set de 5 pins esmaltados.', in_stock: true, sizes: [], colors: [], created_at: now },
]

const courses = [
  { title: 'Introducción al Tattoo Art', description: 'Aprende las bases del tatuaje: higiene, máquinas, técnica de línea y sombreado.', date: '2026-04-05', duration: '8 horas (2 días)', price: 180, spots: 6, image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=400&fit=crop', level: 'beginner', created_at: now },
  { title: 'Fine Line & Dotwork Masterclass', description: 'Perfecciona la técnica de línea fina y puntillismo.', date: '2026-04-19', duration: '6 horas', price: 150, spots: 4, image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=400&fit=crop', level: 'intermediate', created_at: now },
  { title: 'Diseño Digital para Tatuadores', description: 'Procreate e iPad como herramientas de diseño.', date: '2026-05-10', duration: '5 horas', price: 120, spots: 8, image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&fit=crop', level: 'beginner', created_at: now },
  { title: 'Taller de Acuarela & Color', description: 'Técnicas de color y acuarela aplicadas al tatuaje.', date: '2026-05-24', duration: '6 horas', price: 160, spots: 5, image_url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&h=400&fit=crop', level: 'advanced', created_at: now },
]

const reminders = [
  { title: 'Preparar diseño para María López', date: '2026-03-11', time: '18:00', type: 'appointment', completed: false, created_at: now },
  { title: 'Comprar agujas 5RL y 7RL', date: '2026-03-10', time: '10:00', type: 'custom', completed: false, created_at: now },
  { title: 'Seguimiento curación - Luna García', date: '2026-03-17', time: '12:00', type: 'followup', completed: false, created_at: now },
  { title: 'Confirmar cita con Ana Torres', date: '2026-03-13', time: '09:00', type: 'appointment', completed: true, created_at: now },
  { title: 'Publicar fotos portfolio Instagram', date: '2026-03-09', time: '20:00', type: 'custom', completed: false, created_at: now },
]

async function seed() {
  console.log('Seeding Firestore via REST API...')

  for (const item of portfolioItems) await addDoc('portfolio_items', item)
  console.log(`  + ${portfolioItems.length} portfolio items`)

  for (const item of shopItems) await addDoc('shop_items', item)
  console.log(`  + ${shopItems.length} shop items`)

  for (const item of courses) await addDoc('courses', item)
  console.log(`  + ${courses.length} courses`)

  for (const item of reminders) await addDoc('reminders', item)
  console.log(`  + ${reminders.length} reminders`)

  console.log('Done!')
}

seed().catch(console.error)
