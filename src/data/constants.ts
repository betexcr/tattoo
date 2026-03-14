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
