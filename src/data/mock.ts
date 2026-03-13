export interface PortfolioItem {
  id: string
  title: string
  style: string
  image: string
  description: string
}

export interface Appointment {
  id: string
  client: string
  date: string
  time: string
  description: string
  bodyPart: string
  style: string
  status: 'confirmed' | 'pending' | 'completed' | 'rejected'
  deposit: number
  phone?: string
  email?: string
}

export interface ChatMessage {
  id: string
  from: 'user' | 'artist' | 'bot'
  text: string
  timestamp: string
  read: boolean
}

export interface ChatConversation {
  id: string
  userName: string
  lastMessage: string
  lastTimestamp: string
  unread: number
  messages: ChatMessage[]
}

export interface Reminder {
  id: string
  title: string
  date: string
  time: string
  type: 'appointment' | 'followup' | 'custom'
  completed: boolean
}

export interface ShopItem {
  id: string
  title: string
  price: number
  image: string
  category: 'cuadros' | 'ropa' | 'zapatos' | 'accesorios'
  description: string
  inStock: boolean
  sizes?: string[]
  colors?: string[]
}

export interface Course {
  id: string
  title: string
  description: string
  date: string
  duration: string
  price: number
  spots: number
  image: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export const portfolioItems: PortfolioItem[] = [
  { id: '1', title: 'Serpiente Mística', style: 'Fine Line', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=500&fit=crop', description: 'Serpiente envolvente con elementos botánicos' },
  { id: '2', title: 'Rosa Geométrica', style: 'Geometric', image: 'https://images.unsplash.com/photo-1590246814883-57c511e76543?w=400&h=500&fit=crop', description: 'Rosa deconstruida en formas geométricas' },
  { id: '3', title: 'Luna Creciente', style: 'Dotwork', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=500&fit=crop', description: 'Luna con detalles en puntillismo' },
  { id: '4', title: 'Mariposa Acuarela', style: 'Watercolor', image: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=400&h=500&fit=crop', description: 'Mariposa con splash de colores' },
  { id: '5', title: 'Mandala Sagrado', style: 'Mandala', image: 'https://images.unsplash.com/photo-1475727946784-2f8a15d79809?w=400&h=500&fit=crop', description: 'Mandala intrincado con simbolismo espiritual' },
  { id: '6', title: 'Jaguar Tribal', style: 'Blackwork', image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=500&fit=crop', description: 'Jaguar en estilo tribal contemporáneo' },
  { id: '7', title: 'Flor de Loto', style: 'Fine Line', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop', description: 'Loto minimalista con líneas delicadas' },
  { id: '8', title: 'Calavera Floral', style: 'Neo Traditional', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=500&fit=crop', description: 'Calavera decorada con flores mexicanas' },
]

export const appointments: Appointment[] = [
  { id: '1', client: 'María López', date: '2026-03-12', time: '10:00', description: 'Rosa pequeña en la muñeca con hojas delicadas', bodyPart: 'Muñeca', style: 'Fine Line', status: 'confirmed', deposit: 50, phone: '+34 611 222 333' },
  { id: '2', client: 'Carlos Ruiz', date: '2026-03-12', time: '14:00', description: 'Manga completa estilo japonés con dragón y olas', bodyPart: 'Brazo completo', style: 'Japanese', status: 'confirmed', deposit: 200, phone: '+34 622 333 444' },
  { id: '3', client: 'Ana Torres', date: '2026-03-15', time: '11:00', description: 'Mandala en la espalda con elementos geométricos', bodyPart: 'Espalda', style: 'Mandala', status: 'pending', deposit: 150, phone: '+34 633 444 555' },
  { id: '4', client: 'Diego Morales', date: '2026-03-18', time: '16:00', description: 'Frase en lettering cursivo en el costado', bodyPart: 'Costado', style: 'Lettering', status: 'pending', deposit: 80, phone: '+34 644 555 666' },
  { id: '5', client: 'Luna García', date: '2026-03-10', time: '12:00', description: 'Constelación personalizada en el antebrazo', bodyPart: 'Antebrazo', style: 'Fine Line', status: 'completed', deposit: 60, phone: '+34 655 666 777' },
  { id: '6', client: 'Sofía Méndez', date: '2026-03-16', time: '10:00', description: 'Mariposa acuarela en el hombro', bodyPart: 'Hombro', style: 'Watercolor', status: 'pending', deposit: 100, phone: '+34 666 777 888' },
  { id: '7', client: 'Pablo Herrera', date: '2026-03-17', time: '14:00', description: 'Lobo geométrico en el antebrazo', bodyPart: 'Antebrazo', style: 'Geometric', status: 'confirmed', deposit: 120, phone: '+34 677 888 999' },
]

export const occupiedSlots: Record<string, string[]> = {
  '2026-03-12': ['10:00', '14:00'],
  '2026-03-15': ['11:00'],
  '2026-03-16': ['10:00'],
  '2026-03-17': ['14:00'],
  '2026-03-18': ['16:00'],
}

export const chatConversations: ChatConversation[] = [
  {
    id: 'c1',
    userName: 'María López',
    lastMessage: '¡Genial! Nos vemos el jueves entonces.',
    lastTimestamp: '2026-03-08T18:30:00',
    unread: 0,
    messages: [
      { id: 'm1', from: 'user', text: 'Hola! Quería preguntar si puedo cambiar mi cita del jueves a un poco más tarde?', timestamp: '2026-03-08T14:00:00', read: true },
      { id: 'm2', from: 'artist', text: 'Hola María! Claro, ¿a qué hora te vendría mejor?', timestamp: '2026-03-08T14:15:00', read: true },
      { id: 'm3', from: 'user', text: 'A las 11:00 sería perfecto', timestamp: '2026-03-08T14:20:00', read: true },
      { id: 'm4', from: 'artist', text: 'Perfecto, te cambio la cita a las 11:00. Recuerda venir con la piel hidratada y sin tomar sol en la zona.', timestamp: '2026-03-08T14:30:00', read: true },
      { id: 'm5', from: 'user', text: '¡Genial! Nos vemos el jueves entonces.', timestamp: '2026-03-08T18:30:00', read: true },
    ],
  },
  {
    id: 'c2',
    userName: 'Ana Torres',
    lastMessage: '¿Podrías enviarme un boceto antes de la cita?',
    lastTimestamp: '2026-03-08T20:00:00',
    unread: 1,
    messages: [
      { id: 'm6', from: 'user', text: 'Hola! Soy Ana, acabo de reservar mi cita para el mandala.', timestamp: '2026-03-08T19:00:00', read: true },
      { id: 'm7', from: 'artist', text: '¡Hola Ana! Sí, vi tu reserva. Me encanta la idea del mandala con elementos geométricos.', timestamp: '2026-03-08T19:10:00', read: true },
      { id: 'm8', from: 'user', text: '¿Podrías enviarme un boceto antes de la cita?', timestamp: '2026-03-08T20:00:00', read: false },
    ],
  },
  {
    id: 'c3',
    userName: 'Diego Morales',
    lastMessage: 'Quiero algo en cursiva pero moderno, no clásico',
    lastTimestamp: '2026-03-07T16:45:00',
    unread: 2,
    messages: [
      { id: 'm9', from: 'user', text: 'Buenas! Tengo unas dudas sobre el lettering que quiero', timestamp: '2026-03-07T15:00:00', read: true },
      { id: 'm10', from: 'artist', text: 'Hola Diego! Cuéntame, ¿qué tienes en mente?', timestamp: '2026-03-07T15:30:00', read: true },
      { id: 'm11', from: 'user', text: 'La frase es "per aspera ad astra" pero no sé qué tipografía quedaría mejor', timestamp: '2026-03-07T16:00:00', read: false },
      { id: 'm12', from: 'user', text: 'Quiero algo en cursiva pero moderno, no clásico', timestamp: '2026-03-07T16:45:00', read: false },
    ],
  },
]

export const chatbotResponses: Record<string, string> = {
  'precio': '💰 Los precios varían según tamaño y complejidad:\n• Tiny (2-5cm): €50-80\n• Pequeño (5-10cm): €80-150\n• Mediano (10-20cm): €150-300\n• Grande (20-35cm): €300-500\n• Extra grande (35+cm): €500+\n\nPide un presupuesto exacto reservando una cita.',
  'cuidados': '🩹 Cuidados post-tatuaje:\n1. Deja el film protector 3-4 horas\n2. Lava suavemente con jabón neutro\n3. Aplica crema cicatrizante 2-3 veces al día\n4. No rasques ni arranques costras\n5. Evita sol directo 2-3 semanas\n6. No te bañes en piscina/mar 2 semanas',
  'deposito': '💳 Se requiere un depósito del 30% para confirmar la cita. Se descuenta del precio final. Si cancelas con más de 48h de antelación, se te devuelve íntegro.',
  'duracion': '⏱️ La duración depende del tamaño y detalle:\n• Tiny: 30-60 min\n• Pequeño: 1-2 horas\n• Mediano: 2-4 horas\n• Grande: 4-6 horas\n• Extra grande: varias sesiones',
  'dolor': '😬 El dolor varía según la zona:\n• Poco dolor: Brazo, muslo, pantorrilla\n• Dolor medio: Hombro, espalda, pecho\n• Dolor alto: Costillas, pies, manos, cuello\n\nUsamos cremas anestésicas si lo necesitas.',
  'horario': '🕐 Nuestro horario:\n• Lunes a Viernes: 10:00 - 19:00\n• Sábado: 10:00 - 15:00\n• Domingo: Cerrado\n\nLas citas se agendan con mínimo 3 días de anticipación.',
  'estilos': '🎨 Especialidades de la artista:\n• Fine Line: Líneas delicadas y minimalistas\n• Dotwork: Puntillismo detallado\n• Geometric: Formas geométricas y simetría\n• Botanical: Flores y plantas\n• Watercolor: Efecto acuarela\n• Mandala: Diseños simétricos espirituales',
  'cancelar': '❌ Política de cancelación:\n• Más de 48h antes: Reembolso completo del depósito\n• 24-48h antes: 50% del depósito\n• Menos de 24h: Sin reembolso\n\nPara cancelar, escríbenos o llama al +34 612 345 678.',
  'preparacion': '✅ Antes de tu cita:\n1. Descansa bien la noche anterior\n2. Come bien antes de venir\n3. No bebas alcohol 24h antes\n4. Hidrata la zona los días previos\n5. No tomes sol en la zona\n6. Trae ropa cómoda que permita acceso a la zona',
}

export const reminders: Reminder[] = [
  { id: '1', title: 'Preparar diseño para María López', date: '2026-03-11', time: '18:00', type: 'appointment', completed: false },
  { id: '2', title: 'Comprar agujas 5RL y 7RL', date: '2026-03-10', time: '10:00', type: 'custom', completed: false },
  { id: '3', title: 'Seguimiento curación - Luna García', date: '2026-03-17', time: '12:00', type: 'followup', completed: false },
  { id: '4', title: 'Confirmar cita con Ana Torres', date: '2026-03-13', time: '09:00', type: 'appointment', completed: true },
  { id: '5', title: 'Publicar fotos portfolio Instagram', date: '2026-03-09', time: '20:00', type: 'custom', completed: false },
]

export const shopItems: ShopItem[] = [
  // Cuadros de Arte
  { id: '1', title: 'Cuadro "Serpiente Mística"', price: 180, image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=500&fit=crop', category: 'cuadros', description: 'Impresión giclée sobre lienzo, marco de madera negra. 40x50cm. Edición limitada de 50 piezas.', inStock: true },
  { id: '2', title: 'Cuadro "Mandala Cósmico"', price: 320, image: 'https://images.unsplash.com/photo-1475727946784-2f8a15d79809?w=400&h=500&fit=crop', category: 'cuadros', description: 'Original pintado a mano con tinta y acrílico sobre lienzo. Pieza única 50x60cm.', inStock: true },
  { id: '3', title: 'Cuadro "Luna Creciente"', price: 150, image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=500&fit=crop', category: 'cuadros', description: 'Lámina de arte en papel premium 300g con marco minimalista. 30x40cm.', inStock: true },
  { id: '4', title: 'Cuadro "Flor de Loto"', price: 220, image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop', category: 'cuadros', description: 'Técnica mixta sobre lienzo. Detalles en pan de oro. 40x40cm. Pieza única.', inStock: true },
  { id: '5', title: 'Tríptico "Geometría Sagrada"', price: 450, image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=500&fit=crop', category: 'cuadros', description: 'Set de 3 cuadros con diseños geométricos interconectados. 25x35cm cada uno.', inStock: false },

  // Ropa
  { id: '6', title: 'Camiseta "Ink & Soul"', price: 38, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', category: 'ropa', description: 'Algodón orgánico 100%. Diseño exclusivo serigrafiado a mano. Corte unisex.', inStock: true, sizes: ['S', 'M', 'L', 'XL'], colors: ['Negro', 'Blanco'] },
  { id: '7', title: 'Hoodie "Sacred Lines"', price: 65, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop', category: 'ropa', description: 'Sudadera con capucha de algodón premium. Diseño de líneas sagradas bordado en el pecho.', inStock: true, sizes: ['S', 'M', 'L', 'XL'], colors: ['Negro', 'Gris Oscuro'] },
  { id: '8', title: 'Crop Top "Mandala"', price: 32, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop', category: 'ropa', description: 'Crop top de algodón con mandala estampado en la espalda. Corte femenino.', inStock: true, sizes: ['XS', 'S', 'M', 'L'], colors: ['Negro', 'Blanco', 'Terracota'] },
  { id: '9', title: 'Joggers "Dotwork"', price: 55, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=500&fit=crop', category: 'ropa', description: 'Pantalón jogger con detalle de dotwork estampado en la pierna. Algodón French Terry.', inStock: true, sizes: ['S', 'M', 'L', 'XL'], colors: ['Negro'] },
  { id: '10', title: 'Chaqueta Denim "Serpiente"', price: 120, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', category: 'ropa', description: 'Chaqueta denim pintada a mano con diseño de serpiente en la espalda. Pieza única.', inStock: false, sizes: ['M', 'L'], colors: ['Azul Denim'] },

  // Zapatos
  { id: '11', title: 'Sneakers "Fine Line" Custom', price: 145, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop', category: 'zapatos', description: 'Zapatillas blancas personalizadas con diseño fine line pintado a mano. Cada par es único.', inStock: true, sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'] },
  { id: '12', title: 'Boots "Blackwork"', price: 180, image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=500&fit=crop', category: 'zapatos', description: 'Botines de cuero negro con grabado blackwork en el lateral. Diseño exclusivo.', inStock: true, sizes: ['37', '38', '39', '40', '41', '42'] },
  { id: '13', title: 'Slides "Mandala"', price: 48, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=500&fit=crop', category: 'zapatos', description: 'Sandalias slides con mandala impreso en la plantilla y correa. Comodidad total.', inStock: true, sizes: ['36-37', '38-39', '40-41', '42-43'] },
  { id: '14', title: 'Canvas Hi-Top "Geometric"', price: 95, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop', category: 'zapatos', description: 'Zapatillas de caña alta con patrones geométricos pintados a mano. Lona premium.', inStock: false, sizes: ['38', '39', '40', '41', '42', '43'] },

  // Accesorios
  { id: '15', title: 'Tote Bag "Sacred Geometry"', price: 28, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop', category: 'accesorios', description: 'Bolsa de tela orgánica con estampado de geometría sagrada. Resistente y amplia.', inStock: true },
  { id: '16', title: 'Gorra "Ink & Soul" Bordada', price: 35, image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop', category: 'accesorios', description: 'Gorra de algodón con logo "Ink & Soul" bordado. Ajuste regulable.', inStock: true, colors: ['Negro', 'Beige'] },
  { id: '17', title: 'Collar Colgante "Luna"', price: 42, image: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6fc?w=400&h=500&fit=crop', category: 'accesorios', description: 'Colgante de plata 925 con diseño de luna creciente grabada. Cadena de 45cm incluida.', inStock: true },
  { id: '18', title: 'Pulsera "Serpiente"', price: 38, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=500&fit=crop', category: 'accesorios', description: 'Pulsera de plata 925 con forma de serpiente envolvente. Ajustable.', inStock: true },
  { id: '19', title: 'Funda iPhone "Botanical"', price: 25, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=500&fit=crop', category: 'accesorios', description: 'Funda rígida con diseño botánico exclusivo. Disponible para iPhone 14/15/16.', inStock: true },
  { id: '20', title: 'Pin Set "Tattoo Icons"', price: 18, image: 'https://images.unsplash.com/photo-1614680376408-81e91bbe261f?w=400&h=500&fit=crop', category: 'accesorios', description: 'Set de 5 pins esmaltados con iconos de tatuaje: rosa, serpiente, luna, mandala y calavera.', inStock: true },
]

export const courses: Course[] = [
  { id: '1', title: 'Introducción al Tattoo Art', description: 'Aprende las bases del tatuaje: higiene, máquinas, técnica de línea y sombreado.', date: '2026-04-05', duration: '8 horas (2 días)', price: 180, spots: 6, image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=400&fit=crop', level: 'beginner' },
  { id: '2', title: 'Fine Line & Dotwork Masterclass', description: 'Perfecciona la técnica de línea fina y puntillismo. Incluye práctica en piel sintética.', date: '2026-04-19', duration: '6 horas', price: 150, spots: 4, image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=400&fit=crop', level: 'intermediate' },
  { id: '3', title: 'Diseño Digital para Tatuadores', description: 'Procreate e iPad como herramientas de diseño. Crea stencils digitales profesionales.', date: '2026-05-10', duration: '5 horas', price: 120, spots: 8, image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&fit=crop', level: 'beginner' },
  { id: '4', title: 'Taller de Acuarela & Color', description: 'Técnicas de color y acuarela aplicadas al tatuaje. Teoría del color y mezclas.', date: '2026-05-24', duration: '6 horas', price: 160, spots: 5, image: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&h=400&fit=crop', level: 'advanced' },
]

export const tattooStyles = [
  'Fine Line', 'Blackwork', 'Traditional', 'Neo Traditional',
  'Japanese', 'Geometric', 'Dotwork', 'Watercolor',
  'Realism', 'Tribal', 'Lettering', 'Mandala',
  'Minimalist', 'Ornamental', 'Sketch', 'Surrealism',
]

export const bodyParts = [
  'Muñeca', 'Antebrazo', 'Brazo completo', 'Hombro',
  'Espalda', 'Pecho', 'Costado', 'Pierna',
  'Tobillo', 'Pie', 'Cuello', 'Mano',
  'Dedo', 'Cadera', 'Muslo',
]

export const suggestions = [
  { id: '1', title: 'Minimalismo Botánico', description: 'Hojas y flores con líneas delicadas, perfecto para primeros tatuajes', style: 'Fine Line', popularity: 95 },
  { id: '2', title: 'Geometría Sagrada', description: 'Patrones geométricos con significado espiritual profundo', style: 'Geometric', popularity: 88 },
  { id: '3', title: 'Fauna Mística', description: 'Animales con elementos místicos y celestiales', style: 'Dotwork', popularity: 82 },
  { id: '4', title: 'Lettering Artístico', description: 'Frases y palabras con tipografías únicas y decorativas', style: 'Lettering', popularity: 78 },
  { id: '5', title: 'Micro Realismo', description: 'Detalles hiperrealistas en tamaño pequeño', style: 'Realism', popularity: 92 },
  { id: '6', title: 'Neo Tradicional Floral', description: 'Flores con colores vibrantes y líneas definidas', style: 'Neo Traditional', popularity: 85 },
  { id: '7', title: 'Constelaciones', description: 'Tu signo zodiacal o constelación favorita', style: 'Minimalist', popularity: 90 },
  { id: '8', title: 'Mandalas Personalizados', description: 'Diseños circulares únicos con tu propia simbología', style: 'Mandala', popularity: 87 },
]
