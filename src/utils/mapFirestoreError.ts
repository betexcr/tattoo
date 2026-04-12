const firestoreErrorMessages: Record<string, string> = {
  'permission-denied': 'No se pudo cargar el contenido.',
  'not-found': 'No se encontró el recurso solicitado',
  unavailable: 'Servicio no disponible. Inténtalo de nuevo más tarde',
  'deadline-exceeded': 'La operación tardó demasiado. Inténtalo de nuevo',
  'resource-exhausted': 'Demasiadas solicitudes. Espera un momento',
  unauthenticated: 'Debes iniciar sesión para continuar',
  'already-exists': 'El recurso ya existe',
  cancelled: 'La operación fue cancelada',
  'data-loss': 'Error de datos. Inténtalo de nuevo',
  'failed-precondition': 'No se puede completar la operación en este momento',
  'invalid-argument': 'Datos no válidos. Revisa la información e inténtalo de nuevo',
  'out-of-range': 'Valor fuera de rango',
  internal: 'Error interno. Inténtalo de nuevo',
  unknown: 'Error desconocido. Inténtalo de nuevo',
}

export function mapFirestoreError(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = (e as { code: string }).code
    const stripped = code.replace(/^firestore\//, '')
    const msg = firestoreErrorMessages[stripped]
    if (msg) return msg
  }
  if (import.meta.env.DEV) console.warn('[mapFirestoreError] unmapped error:', e)
  return 'Ha ocurrido un error. Inténtalo de nuevo'
}
