import i18n from '../i18n'

const firestoreErrorKeys: Record<string, string> = {
  'permission-denied': 'errors.firestore.permissionDenied',
  'not-found': 'errors.firestore.notFound',
  unavailable: 'errors.firestore.unavailable',
  'deadline-exceeded': 'errors.firestore.deadlineExceeded',
  'resource-exhausted': 'errors.firestore.resourceExhausted',
  unauthenticated: 'errors.firestore.unauthenticated',
  'already-exists': 'errors.firestore.alreadyExists',
  cancelled: 'errors.firestore.cancelled',
  'data-loss': 'errors.firestore.dataLoss',
  'failed-precondition': 'errors.firestore.failedPrecondition',
  'invalid-argument': 'errors.firestore.invalidArgument',
  'out-of-range': 'errors.firestore.outOfRange',
  internal: 'errors.firestore.internal',
  unknown: 'errors.firestore.unknown',
}

export function mapFirestoreError(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = (e as { code: string }).code
    const stripped = code.replace(/^firestore\//, '')
    const key = firestoreErrorKeys[stripped]
    if (key) return i18n.t(key)
  }
  if (import.meta.env.DEV) console.warn('[mapFirestoreError] unmapped error:', e)
  return i18n.t('errors.generic')
}
