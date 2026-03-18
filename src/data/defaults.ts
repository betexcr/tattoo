import type {
  Suggestion,
  Review,
  AboutStat,
  QuickReply,
  QuizQuestion,
  StyleRecommendation,
  ChatConfig,
  HomeContent,
  AboutContent,
  QuizConfig,
} from '../types'

export const defaultTattooStyles: string[] = [
  'Fine Line', 'Blackwork', 'Traditional', 'Neo Traditional',
  'Japanese', 'Geometric', 'Dotwork', 'Watercolor',
  'Realism', 'Tribal', 'Lettering', 'Mandala',
  'Minimalist', 'Ornamental', 'Sketch', 'Surrealism',
]

export const defaultBodyParts: string[] = [
  'Muñeca', 'Antebrazo', 'Brazo completo', 'Hombro',
  'Espalda', 'Pecho', 'Costado', 'Pierna',
  'Tobillo', 'Pie', 'Cuello', 'Mano',
  'Dedo', 'Cadera', 'Muslo',
]

export const defaultSuggestions: Suggestion[] = [
  { id: '1', title: 'Minimalismo Botánico', description: 'Hojas y flores con líneas delicadas, perfecto para primeros tatuajes', style: 'Fine Line', popularity: 95 },
  { id: '2', title: 'Geometría Sagrada', description: 'Patrones geométricos con significado espiritual profundo', style: 'Geometric', popularity: 88 },
  { id: '3', title: 'Fauna Mística', description: 'Animales con elementos místicos y celestiales', style: 'Dotwork', popularity: 82 },
  { id: '4', title: 'Lettering Artístico', description: 'Frases y palabras con tipografías únicas y decorativas', style: 'Lettering', popularity: 78 },
  { id: '5', title: 'Micro Realismo', description: 'Detalles hiperrealistas en tamaño pequeño', style: 'Realism', popularity: 92 },
  { id: '6', title: 'Neo Tradicional Floral', description: 'Flores con colores vibrantes y líneas definidas', style: 'Neo Traditional', popularity: 85 },
  { id: '7', title: 'Constelaciones', description: 'Tu signo zodiacal o constelación favorita', style: 'Minimalist', popularity: 90 },
  { id: '8', title: 'Mandalas Personalizados', description: 'Diseños circulares únicos con tu propia simbología', style: 'Mandala', popularity: 87 },
]

export const defaultChatbotResponses: Record<string, string> = {
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

export const defaultQuickReplies: QuickReply[] = [
  { label: 'Precios', key: 'precio' },
  { label: 'Cuidados', key: 'cuidados' },
  { label: 'Depósito', key: 'deposito' },
  { label: 'Duración', key: 'duracion' },
  { label: 'Dolor', key: 'dolor' },
  { label: 'Horario', key: 'horario' },
  { label: 'Estilos', key: 'estilos' },
  { label: 'Cancelación', key: 'cancelar' },
  { label: 'Preparación', key: 'preparacion' },
]

export const defaultChatConfig: ChatConfig = {
  artist_name: 'Valentina Reyes',
  artist_initials: 'VR',
  welcome_message: '¡Hola! Bienvenido/a a INK & SOUL. Soy Valentina, ¿en qué puedo ayudarte? 😊',
  quick_replies: defaultQuickReplies,
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
}

export const defaultReviews: Review[] = [
  { name: 'Lucía M.', text: 'Un trabajo increíble. Valentina captó exactamente lo que quería. Totalmente recomendable.', rating: 5, style: 'Fine Line' },
  { name: 'Andrés P.', text: 'El estudio es precioso y la atención impecable. Mi tatuaje sanó perfecto.', rating: 5, style: 'Geometric' },
  { name: 'Carmen R.', text: 'Ya llevo 3 tatuajes con ella. Cada vez supera mis expectativas. Artista de verdad.', rating: 5, style: 'Dotwork' },
]

export const defaultHomeContent: HomeContent = {
  subtitle: 'Tattoo Art Studio',
  tagline: 'Arte que vive en tu piel. Diseños únicos, hechos con pasión y dedicación.',
  reviews: defaultReviews,
}

export const defaultAboutStats: AboutStat[] = [
  { value: '8+', label: 'Años' },
  { value: '2000+', label: 'Tatuajes' },
  { value: '500+', label: 'Diseños' },
]

export const defaultAboutContent: AboutContent = {
  hero_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
  artist_title: 'Tattoo Artist & Visual Creator',
  bio: 'Con más de 8 años de experiencia en el mundo del tatuaje, mi pasión es transformar ideas en arte que perdura. Especializada en fine line, dotwork y diseños botánicos, cada pieza que creo es única y personal. Mi estudio es un espacio seguro donde el arte y la expresión se encuentran.',
  stats: defaultAboutStats,
  specialties: ['Fine Line', 'Dotwork', 'Botanical', 'Geometric', 'Watercolor', 'Mandala'],
  certifications: [
    'Curso Avanzado de Higiene y Bioseguridad',
    'Masterclass en Fine Line - Barcelona 2023',
    'Workshop de Color Theory - México 2024',
  ],
}

export const defaultQuizQuestions: QuizQuestion[] = [
  { id: 'q1', question: '¿Qué te atrae más?', options: ['Naturaleza', 'Geometría', 'Animales', 'Símbolos'] },
  { id: 'q2', question: '¿Prefieres diseños...', options: ['Pequeños y discretos', 'Medianos', 'Grandes y llamativos'] },
  { id: 'q3', question: '¿Qué estética te representa?', options: ['Minimalista', 'Detallada', 'Colorida', 'Oscura'] },
]

export const defaultStyleRecommendations: Record<string, StyleRecommendation> = {
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
}

export const defaultQuizConfig: QuizConfig = {
  questions: defaultQuizQuestions,
  style_recommendations: defaultStyleRecommendations,
  trending_threshold: 85,
}
