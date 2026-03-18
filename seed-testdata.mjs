#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = join(process.cwd(), name)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  }
}
loadEnv()

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'tattoo-aa948'
const API_KEY = process.env.VITE_FIREBASE_API_KEY || ''
if (!API_KEY) { console.error('Set VITE_FIREBASE_API_KEY in .env.local'); process.exit(1) }

async function getAccessToken() {
  const configPath = join(homedir(), '.config', 'configstore', 'firebase-tools.json')
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  const refreshToken = config.tokens?.refresh_token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  const data = await res.json()
  return data.access_token
}

let accessToken
const BASE = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

function toFV(val) {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'string') return { stringValue: val }
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val }
  if (typeof val === 'boolean') return { booleanValue: val }
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFV) } }
  if (typeof val === 'object') {
    const fields = {}
    for (const [k, v] of Object.entries(val)) fields[k] = toFV(v)
    return { mapValue: { fields } }
  }
  return { stringValue: String(val) }
}

async function addDoc(collection, data) {
  const fields = {}
  for (const [k, v] of Object.entries(data)) fields[k] = toFV(v)
  const res = await fetch(`${BASE}/${collection}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`Failed ${collection}: ${await res.text()}`)
  const doc = await res.json()
  return doc.name.split('/').pop()
}

async function setDoc(collection, docId, data) {
  const fields = {}
  for (const [k, v] of Object.entries(data)) fields[k] = toFV(v)
  const fieldPaths = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&')
  const res = await fetch(`${BASE}/${collection}/${docId}?${fieldPaths}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`Failed set ${collection}/${docId}: ${await res.text()}`)
}

async function createAuthUser(email, password) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
  const data = await res.json()
  if (data.error) {
    if (data.error.message === 'EMAIL_EXISTS') return null
    throw new Error(data.error.message)
  }
  return data.localId
}

async function seed() {
  accessToken = await getAccessToken()
  console.log('Token refreshed.\n')
  console.log('Creating test client accounts...')
  const clients = [
    { email: 'lucia@test.com', password: 'Test1234!', name: 'Lucía Martínez', phone: '+34 612 345 678' },
    { email: 'andres@test.com', password: 'Test1234!', name: 'Andrés Pérez', phone: '+34 623 456 789' },
    { email: 'carmen@test.com', password: 'Test1234!', name: 'Carmen Rodríguez', phone: '+34 634 567 890' },
    { email: 'sofia@test.com', password: 'Test1234!', name: 'Sofía López', phone: '+34 645 678 901' },
    { email: 'marco@test.com', password: 'Test1234!', name: 'Marco García', phone: '+34 656 789 012' },
  ]

  const clientIds = []
  for (const c of clients) {
    const uid = await createAuthUser(c.email, c.password)
    if (uid) {
      await setDoc('profiles', uid, {
        full_name: c.name,
        phone: c.phone,
        role: 'client',
        avatar_url: '',
        created_at: new Date().toISOString(),
      })
      clientIds.push({ uid, ...c })
      console.log(`  + ${c.name} (${uid})`)
    } else {
      console.log(`  ~ ${c.name} (already exists)`)
    }
  }
  console.log(`  ${clientIds.length} clients created\n`)

  // --- Studio Settings ---
  console.log('Setting studio settings...')
  await setDoc('studio_settings', 'main', {
    studio_name: 'Ink & Soul Studio',
    artist_name: 'Valentina Torres',
    bio: 'Tatuadora profesional con más de 8 años de experiencia. Especializada en Fine Line, Geometric y Dotwork. Mi pasión es transformar ideas en arte permanente que cuente tu historia. Cada pieza es única y diseñada a medida.',
    phone: '+34 611 222 333',
    email: 'hola@inknsoul.com',
    address: 'Calle del Arte 42, Madrid, España',
    schedule: {
      lunes: { open: true, start: '10:00', end: '19:00' },
      martes: { open: true, start: '10:00', end: '19:00' },
      miercoles: { open: true, start: '10:00', end: '19:00' },
      jueves: { open: true, start: '10:00', end: '19:00' },
      viernes: { open: true, start: '10:00', end: '18:00' },
      sabado: { open: true, start: '11:00', end: '15:00' },
      domingo: { open: false, start: '10:00', end: '19:00' },
    },
    prices: {
      tiny: { min: 50, max: 80 },
      small: { min: 80, max: 150 },
      medium: { min: 150, max: 350 },
      large: { min: 350, max: 800 },
      xl: { min: 800, max: 1500 },
    },
    social_links: {
      instagram: 'https://instagram.com/inknsoul',
      tiktok: 'https://tiktok.com/@inknsoul',
      website: 'https://inknsoul.com',
    },
    notifications: {
      new_booking: true,
      message_notification: true,
      reminder_notification: true,
      deposit_received: true,
    },
    tattoo_styles: [
      'Fine Line', 'Blackwork', 'Traditional', 'Neo Traditional',
      'Japanese', 'Geometric', 'Dotwork', 'Watercolor',
      'Realism', 'Tribal', 'Lettering', 'Mandala',
      'Minimalist', 'Ornamental', 'Sketch', 'Surrealism',
    ],
    body_parts: [
      'Muñeca', 'Antebrazo', 'Brazo completo', 'Hombro',
      'Espalda', 'Pecho', 'Costado', 'Pierna',
      'Tobillo', 'Pie', 'Cuello', 'Mano',
      'Dedo', 'Cadera', 'Muslo',
    ],
    suggestions: [
      { id: '1', title: 'Minimalismo Botánico', description: 'Hojas y flores con líneas delicadas, perfecto para primeros tatuajes', style: 'Fine Line', popularity: 95 },
      { id: '2', title: 'Geometría Sagrada', description: 'Patrones geométricos con significado espiritual profundo', style: 'Geometric', popularity: 88 },
      { id: '3', title: 'Fauna Mística', description: 'Animales con elementos místicos y celestiales', style: 'Dotwork', popularity: 82 },
      { id: '4', title: 'Lettering Artístico', description: 'Frases y palabras con tipografías únicas y decorativas', style: 'Lettering', popularity: 78 },
      { id: '5', title: 'Micro Realismo', description: 'Detalles hiperrealistas en tamaño pequeño', style: 'Realism', popularity: 92 },
      { id: '6', title: 'Neo Tradicional Floral', description: 'Flores con colores vibrantes y líneas definidas', style: 'Neo Traditional', popularity: 85 },
      { id: '7', title: 'Constelaciones', description: 'Tu signo zodiacal o constelación favorita', style: 'Minimalist', popularity: 90 },
      { id: '8', title: 'Mandalas Personalizados', description: 'Diseños circulares únicos con tu propia simbología', style: 'Mandala', popularity: 87 },
    ],
    chatbot_responses: {
      precio: '💰 Los precios varían según tamaño y complejidad:\n• Tiny (2-5cm): €50-80\n• Pequeño (5-10cm): €80-150\n• Mediano (10-20cm): €150-350\n• Grande (20-35cm): €350-800\n• Extra grande (35+cm): €800+\n\nPide un presupuesto exacto reservando una cita.',
      cuidados: '🩹 Cuidados post-tatuaje:\n1. Deja el film protector 3-4 horas\n2. Lava suavemente con jabón neutro\n3. Aplica crema cicatrizante 2-3 veces al día\n4. No rasques ni arranques costras\n5. Evita sol directo 2-3 semanas\n6. No te bañes en piscina/mar 2 semanas',
      deposito: '💳 Se requiere un depósito del 30% para confirmar la cita. Se descuenta del precio final. Si cancelas con más de 48h de antelación, se te devuelve íntegro.',
      duracion: '⏱️ La duración depende del tamaño y detalle:\n• Tiny: 30-60 min\n• Pequeño: 1-2 horas\n• Mediano: 2-4 horas\n• Grande: 4-6 horas\n• Extra grande: varias sesiones',
      dolor: '😬 El dolor varía según la zona:\n• Poco dolor: Brazo, muslo, pantorrilla\n• Dolor medio: Hombro, espalda, pecho\n• Dolor alto: Costillas, pies, manos, cuello\n\nUsamos cremas anestésicas si lo necesitas.',
      horario: '🕐 Nuestro horario:\n• Lunes a Viernes: 10:00 - 18:00/19:00\n• Sábado: 11:00 - 15:00\n• Domingo: Cerrado\n\nLas citas se agendan con mínimo 3 días de anticipación.',
      estilos: '🎨 Especialidades de la artista:\n• Fine Line: Líneas delicadas y minimalistas\n• Dotwork: Puntillismo detallado\n• Geometric: Formas geométricas y simetría\n• Botanical: Flores y plantas\n• Watercolor: Efecto acuarela\n• Mandala: Diseños simétricos espirituales',
      cancelar: '❌ Política de cancelación:\n• Más de 48h antes: Reembolso completo del depósito\n• 24-48h antes: 50% del depósito\n• Menos de 24h: Sin reembolso\n\nPara cancelar, escríbenos o llama al +34 611 222 333.',
      preparacion: '✅ Antes de tu cita:\n1. Descansa bien la noche anterior\n2. Come bien antes de venir\n3. No bebas alcohol 24h antes\n4. Hidrata la zona los días previos\n5. No tomes sol en la zona\n6. Trae ropa cómoda que permita acceso a la zona',
    },
    chat_config: {
      artist_name: 'Valentina Torres',
      artist_initials: 'VT',
      welcome_message: '¡Hola! Bienvenido/a a Ink & Soul. Soy Valentina, ¿en qué puedo ayudarte? 😊',
      quick_replies: [
        { label: 'Precios', key: 'precio' },
        { label: 'Cuidados', key: 'cuidados' },
        { label: 'Depósito', key: 'deposito' },
        { label: 'Duración', key: 'duracion' },
        { label: 'Dolor', key: 'dolor' },
        { label: 'Horario', key: 'horario' },
        { label: 'Estilos', key: 'estilos' },
        { label: 'Cancelación', key: 'cancelar' },
        { label: 'Preparación', key: 'preparacion' },
      ],
      canned_responses: [
        '¡Gracias por tu mensaje! Lo reviso y te contesto en un momento 😊',
        'Qué buena idea! Me encantaría trabajar en eso. ¿Tienes alguna referencia visual?',
        'Perfecto, lo anoto. ¿Hay algo más que quieras comentarme?',
        '¡Me encanta! Podemos hablar de los detalles cuando vengas al estudio.',
        'Claro que sí, sin problema. ¿Quieres que te reserve un hueco esta semana?',
        '¡Genial! Te preparo un boceto y te lo enseño antes de la cita.',
        'Buena elección de zona. El resultado va a quedar increíble ahí.',
        'Recuerda hidratar bien la zona los días previos a tu cita 🙌',
      ],
      fallback_response: 'No tengo una respuesta específica para eso. ¿Te gustaría hablar directamente con la artista? Usa la pestaña "Artista" para enviarle un mensaje.',
      response_time_text: 'Normalmente responde en menos de 1h',
    },
    home_content: {
      subtitle: 'Tattoo Art Studio',
      tagline: 'Arte que vive en tu piel. Diseños únicos, hechos con pasión y dedicación.',
      reviews: [
        { name: 'Lucía M.', text: 'Un trabajo increíble. Valentina captó exactamente lo que quería. Totalmente recomendable.', rating: 5, style: 'Fine Line' },
        { name: 'Andrés P.', text: 'El estudio es precioso y la atención impecable. Mi tatuaje sanó perfecto.', rating: 5, style: 'Geometric' },
        { name: 'Carmen R.', text: 'Ya llevo 3 tatuajes con ella. Cada vez supera mis expectativas. Artista de verdad.', rating: 5, style: 'Dotwork' },
      ],
    },
    about_content: {
      hero_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
      artist_title: 'Tattoo Artist & Visual Creator',
      bio: 'Con más de 8 años de experiencia en el mundo del tatuaje, mi pasión es transformar ideas en arte que perdura. Especializada en fine line, dotwork y diseños botánicos, cada pieza que creo es única y personal. Mi estudio es un espacio seguro donde el arte y la expresión se encuentran.',
      stats: [
        { value: '8+', label: 'Años' },
        { value: '2000+', label: 'Tatuajes' },
        { value: '500+', label: 'Diseños' },
      ],
      specialties: ['Fine Line', 'Dotwork', 'Botanical', 'Geometric', 'Watercolor', 'Mandala'],
      certifications: [
        'Curso Avanzado de Higiene y Bioseguridad',
        'Masterclass en Fine Line - Barcelona 2023',
        'Workshop de Color Theory - México 2024',
      ],
    },
    quiz_config: {
      questions: [
        { id: 'q1', question: '¿Qué te atrae más?', options: ['Naturaleza', 'Geometría', 'Animales', 'Símbolos'] },
        { id: 'q2', question: '¿Prefieres diseños...', options: ['Pequeños y discretos', 'Medianos', 'Grandes y llamativos'] },
        { id: 'q3', question: '¿Qué estética te representa?', options: ['Minimalista', 'Detallada', 'Colorida', 'Oscura'] },
      ],
      style_recommendations: {
        'Naturaleza-Minimalista': { style: 'Fine Line', description: 'Líneas delicadas con elementos botánicos' },
        'Naturaleza-Detallada': { style: 'Neo Traditional', description: 'Flores y naturaleza con detalles ricos' },
        'Naturaleza-Colorida': { style: 'Watercolor', description: 'Naturaleza con splash de colores' },
        'Naturaleza-Oscura': { style: 'Blackwork', description: 'Elementos naturales en negro intenso' },
        'Geometría-Minimalista': { style: 'Geometric', description: 'Formas puras y líneas limpias' },
        'Geometría-Detallada': { style: 'Mandala', description: 'Patrones geométricos intrincados' },
        'Geometría-Colorida': { style: 'Neo Traditional', description: 'Geometría con acentos de color' },
        'Geometría-Oscura': { style: 'Blackwork', description: 'Geometría sagrada en negro' },
        'Animales-Minimalista': { style: 'Fine Line', description: 'Siluetas de animales delicadas' },
        'Animales-Detallada': { style: 'Dotwork', description: 'Fauna con texturas y detalles' },
        'Animales-Colorida': { style: 'Neo Traditional', description: 'Animales con colores vibrantes' },
        'Animales-Oscura': { style: 'Tribal', description: 'Animales en estilo tribal oscuro' },
        'Símbolos-Minimalista': { style: 'Minimalist', description: 'Símbolos simples y elegantes' },
        'Símbolos-Detallada': { style: 'Ornamental', description: 'Símbolos decorativos elaborados' },
        'Símbolos-Colorida': { style: 'Traditional', description: 'Símbolos clásicos con color' },
        'Símbolos-Oscura': { style: 'Blackwork', description: 'Símbolos en negro sólido' },
      },
      trending_threshold: 85,
    },
    updated_at: new Date().toISOString(),
  })
  console.log('  + Studio settings configured\n')

  // --- Appointments ---
  console.log('Creating appointments...')
  const artistUid = 'y7rfsnppbnMZKihSE6iwUPWqR7P2'
  const appointments = [
    { client_name: 'Lucía Martínez', date: '2026-03-09', time: '10:00', description: 'Serpiente fine line en el antebrazo derecho, estilo minimalista con elementos botánicos', body_part: 'Antebrazo', style: 'Fine Line', status: 'completed', deposit: 80, phone: '+34 612 345 678', email: 'lucia@test.com', reference_images: [], size: 'Mediano (15-25cm)', notes: 'Primera sesión completada. Necesita retoque en 3 semanas.', client_id: clientIds[0]?.uid || null },
    { client_name: 'Andrés Pérez', date: '2026-03-10', time: '11:00', description: 'Mandala geométrico en el hombro, diseño simétrico con patrones sagrados', body_part: 'Hombro', style: 'Geometric', status: 'completed', deposit: 120, phone: '+34 623 456 789', email: 'andres@test.com', reference_images: [], size: 'Grande (25cm+)', notes: 'Cliente regular. Muy contento con el resultado.', client_id: clientIds[1]?.uid || null },
    { client_name: 'Carmen Rodríguez', date: '2026-03-12', time: '14:00', description: 'Luna creciente dotwork detrás de la oreja, sutil y delicada', body_part: 'Detrás de la oreja', style: 'Dotwork', status: 'confirmed', deposit: 60, phone: '+34 634 567 890', email: 'carmen@test.com', reference_images: [], size: 'Pequeño (5-15cm)', notes: '', client_id: clientIds[2]?.uid || null },
    { client_name: 'Sofía López', date: '2026-03-13', time: '10:00', description: 'Mariposa acuarela en la espalda, colores vibrantes con splash effect', body_part: 'Espalda', style: 'Watercolor', status: 'confirmed', deposit: 150, phone: '+34 645 678 901', email: 'sofia@test.com', reference_images: [], size: 'Grande (25cm+)', notes: 'Traer referencias de colores.', client_id: clientIds[3]?.uid || null },
    { client_name: 'Marco García', date: '2026-03-14', time: '16:00', description: 'Lobo blackwork en el pecho, estilo realista con sombras', body_part: 'Pecho', style: 'Blackwork', status: 'pending', deposit: 200, phone: '+34 656 789 012', email: 'marco@test.com', reference_images: [], size: 'Grande (25cm+)', notes: 'Primera consulta. Discutir tamaño exacto.', client_id: clientIds[4]?.uid || null },
    { client_name: 'Lucía Martínez', date: '2026-03-16', time: '11:00', description: 'Retoque de serpiente fine line + nueva pieza: flor de cerezo en la muñeca', body_part: 'Muñeca', style: 'Fine Line', status: 'confirmed', deposit: 60, phone: '+34 612 345 678', email: 'lucia@test.com', reference_images: [], size: 'Pequeño (5-15cm)', notes: 'Retoque gratuito + nueva pieza.', client_id: clientIds[0]?.uid || null },
    { client_name: 'Andrés Pérez', date: '2026-03-18', time: '10:00', description: 'Extensión del mandala hacia el brazo, segunda sesión', body_part: 'Brazo', style: 'Geometric', status: 'pending', deposit: 150, phone: '+34 623 456 789', email: 'andres@test.com', reference_images: [], size: 'Grande (25cm+)', notes: 'Continuación del trabajo anterior.', client_id: clientIds[1]?.uid || null },
    { client_name: 'Ana Torres', date: '2026-03-20', time: '15:00', description: 'Constelación de estrellas en la clavícula, fine line minimalista', body_part: 'Clavícula', style: 'Fine Line', status: 'pending', deposit: 70, phone: '+34 667 890 123', email: 'ana@email.com', reference_images: [], size: 'Mediano (15-25cm)', notes: 'Nueva clienta. Referida por Lucía.', client_id: null },
    { client_name: 'Carmen Rodríguez', date: '2026-02-20', time: '10:00', description: 'Rosa geométrica en el tobillo, primer tatuaje', body_part: 'Tobillo', style: 'Geometric', status: 'completed', deposit: 90, phone: '+34 634 567 890', email: 'carmen@test.com', reference_images: [], size: 'Pequeño (5-15cm)', notes: 'Muy nerviosa pero salió perfecto.', client_id: clientIds[2]?.uid || null },
    { client_name: 'Diego Ruiz', date: '2026-03-22', time: '12:00', description: 'Fénix neo-traditional en el antebrazo, colores vivos', body_part: 'Antebrazo', style: 'Neo Traditional', status: 'pending', deposit: 180, phone: '+34 678 901 234', email: 'diego@email.com', reference_images: [], size: 'Grande (25cm+)', notes: 'Quiere estilo americano clásico con toques modernos.', client_id: null },
  ]

  for (const apt of appointments) {
    await addDoc('appointments', { ...apt, created_at: new Date().toISOString() })
  }
  console.log(`  + ${appointments.length} appointments\n`)

  // --- Chat Messages ---
  console.log('Creating chat conversations...')
  const chatConversations = [
    {
      clientId: clientIds[0]?.uid,
      messages: [
        { sender_role: 'client', text: 'Hola! Quería preguntar sobre mi cita del lunes. ¿Debo traer algo especial?' },
        { sender_role: 'artist', text: 'Hola Lucía! Solo ven bien hidratada y descansada. Si puedes evitar alcohol 24h antes, mejor. ¡Te espero!' },
        { sender_role: 'client', text: 'Perfecto! Y sobre el diseño, ¿ya lo tienes listo?' },
        { sender_role: 'artist', text: 'Sí, te envío un preview mañana por la tarde. Creo que te va a encantar 🐍' },
        { sender_role: 'client', text: '¡No puedo esperar! Muchas gracias Valentina ❤️' },
      ],
    },
    {
      clientId: clientIds[1]?.uid,
      messages: [
        { sender_role: 'client', text: 'Buenos días! Quería saber si es posible extender el mandala hacia el brazo.' },
        { sender_role: 'artist', text: 'Buenos días Andrés! Claro que sí, sería un diseño espectacular. Te propongo una sesión adicional de unas 3-4 horas.' },
        { sender_role: 'client', text: '¿Cuánto costaría aproximadamente?' },
        { sender_role: 'artist', text: 'Para la extensión, estaríamos entre 250-350€ dependiendo del detalle. ¿Quieres que agendemos una consulta para definir el diseño?' },
        { sender_role: 'client', text: 'Sí, por favor. ¿Tienes disponibilidad esta semana?' },
        { sender_role: 'artist', text: 'El jueves a las 18h tengo un hueco. ¿Te viene bien?' },
        { sender_role: 'client', text: 'Perfecto, ahí estaré. ¡Gracias!' },
      ],
    },
    {
      clientId: clientIds[2]?.uid,
      messages: [
        { sender_role: 'client', text: 'Hola Valentina! Mi tatuaje del tobillo ya está curado y quedó precioso. Ahora quiero uno detrás de la oreja 😍' },
        { sender_role: 'artist', text: '¡Me alegra mucho Carmen! ¿Qué tienes en mente para el nuevo?' },
        { sender_role: 'client', text: 'Una luna creciente en dotwork, algo sutil y femenino.' },
        { sender_role: 'artist', text: 'Me encanta la idea. Es una zona delicada pero quedará hermoso. Ya te agendé para el jueves.' },
      ],
    },
    {
      clientId: clientIds[3]?.uid,
      messages: [
        { sender_role: 'client', text: 'Hola! Vi tu portfolio y me enamoré del estilo acuarela. ¿Aceptas nuevos clientes?' },
        { sender_role: 'artist', text: '¡Hola Sofía! Muchas gracias, claro que sí. ¿Qué diseño tienes en mente?' },
        { sender_role: 'client', text: 'Una mariposa grande en la espalda, con colores tipo acuarela, azules y morados.' },
        { sender_role: 'artist', text: 'Suena espectacular. Para una pieza así necesitaríamos una sesión de 4-5 horas. ¿Has tenido tatuajes antes?' },
        { sender_role: 'client', text: 'No, sería mi primero! Estoy un poco nerviosa jaja' },
        { sender_role: 'artist', text: 'No te preocupes, te cuido mucho durante todo el proceso. La espalda es una zona bastante tolerable. Te he agendado para el viernes, ¿te parece bien?' },
        { sender_role: 'client', text: '¡Sí, perfecto! ¡Estoy emocionada!' },
      ],
    },
  ]

  let totalMsgs = 0
  for (const conv of chatConversations) {
    if (!conv.clientId) continue
    let baseTime = new Date('2026-03-07T10:00:00Z').getTime()
    for (const msg of conv.messages) {
      baseTime += Math.floor(Math.random() * 3600000) + 300000
      await addDoc('chat_messages', {
        client_id: conv.clientId,
        sender_role: msg.sender_role,
        text: msg.text,
        read: true,
        created_at: new Date(baseTime).toISOString(),
      })
      totalMsgs++
    }
  }
  console.log(`  + ${totalMsgs} chat messages across ${chatConversations.length} conversations\n`)

  // --- Orders ---
  console.log('Creating sample orders...')
  const orders = [
    { client_name: 'Lucía Martínez', client_email: 'lucia@test.com', client_phone: '+34 612 345 678', client_address: 'Calle Gran Vía 15, Madrid', total: 218, status: 'delivered', client_id: clientIds[0]?.uid || null, items: [{ shop_item_id: 'x', quantity: 1, size: 'M', color: 'Negro', price: 38 }, { shop_item_id: 'y', quantity: 1, size: '', color: '', price: 180 }] },
    { client_name: 'Sofía López', client_email: 'sofia@test.com', client_phone: '+34 645 678 901', client_address: 'Av. de la Constitución 8, Madrid', total: 97, status: 'shipped', client_id: clientIds[3]?.uid || null, items: [{ shop_item_id: 'z', quantity: 1, size: 'S', color: 'Negro', price: 65 }, { shop_item_id: 'w', quantity: 1, size: '', color: 'Negro', price: 32 }] },
    { client_name: 'Marco García', client_email: 'marco@test.com', client_phone: '+34 656 789 012', client_address: 'Calle Serrano 25, Madrid', total: 145, status: 'confirmed', client_id: clientIds[4]?.uid || null, items: [{ shop_item_id: 'a', quantity: 1, size: '42', color: '', price: 145 }] },
    { client_name: 'Carmen Rodríguez', client_email: 'carmen@test.com', client_phone: '+34 634 567 890', client_address: 'Paseo del Prado 3, Madrid', total: 70, status: 'pending', client_id: clientIds[2]?.uid || null, items: [{ shop_item_id: 'b', quantity: 1, size: '', color: '', price: 42 }, { shop_item_id: 'c', quantity: 1, size: '', color: '', price: 28 }] },
  ]

  for (const order of orders) {
    const { items, ...orderData } = order
    const orderId = await addDoc('orders', { ...orderData, created_at: new Date().toISOString() })
    for (const item of items) {
      await addDoc('order_items', { order_id: orderId, ...item })
    }
  }
  console.log(`  + ${orders.length} orders\n`)

  // --- Contact Submissions ---
  console.log('Creating contact submissions...')
  const contacts = [
    { name: 'Laura Sánchez', email: 'laura@email.com', phone: '+34 689 012 345', message: 'Me gustaría información sobre precios para un tatuaje de manga completa estilo japonés.', tattoo_style: 'Neo Traditional', body_part: 'Brazo completo' },
    { name: 'Pablo Moreno', email: 'pablo@email.com', phone: '+34 690 123 456', message: 'Hola! ¿Hacéis tatuajes de cover-up? Tengo uno antiguo que quiero cubrir.', tattoo_style: 'Blackwork', body_part: 'Espalda' },
    { name: 'Elena Vidal', email: 'elena@email.com', phone: '', message: '¿Cuánto costaría un tatuaje pequeño de una estrella en la muñeca? Es mi primer tatuaje.', tattoo_style: 'Fine Line', body_part: 'Muñeca' },
  ]

  for (const c of contacts) {
    await addDoc('contact_submissions', { ...c, created_at: new Date().toISOString() })
  }
  console.log(`  + ${contacts.length} contact submissions\n`)

  console.log('All test data seeded!')
}

seed().catch(console.error)
