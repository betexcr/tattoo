import { useState, useRef, useEffect } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, type UploadTask } from 'firebase/storage'
import { storage } from '../lib/firebase'
import { mapFirestoreError } from '../utils/mapFirestoreError'

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const taskRef = useRef<UploadTask | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (taskRef.current) taskRef.current.cancel()
    }
  }, [])

  const upload = (file: File, path: string): Promise<{ url: string | null; error: string | null }> => {
    if (taskRef.current) {
      taskRef.current.cancel()
      taskRef.current = null
    }
    setUploading(true)
    setProgress(0)
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)
    taskRef.current = task

    return new Promise((resolve) => {
      task.on(
        'state_changed',
        (snapshot) => {
          if (!mountedRef.current || taskRef.current !== task) return
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 90)
          setProgress(pct)
        },
        (err) => {
          if (taskRef.current !== task) {
            resolve({ url: null, error: 'Subida reemplazada' })
            return
          }
          taskRef.current = null
          if (!mountedRef.current) {
            resolve({ url: null, error: 'Subida cancelada' })
            return
          }
          setUploading(false)
          setProgress(0)
          resolve({ url: null, error: mapFirestoreError(err) })
        },
        async () => {
          if (taskRef.current !== task) {
            resolve({ url: null, error: 'Subida reemplazada' })
            return
          }
          taskRef.current = null
          try {
            const url = await getDownloadURL(storageRef)
            if (!mountedRef.current) {
              resolve({ url, error: null })
              return
            }
            setProgress(100)
            setUploading(false)
            resolve({ url, error: null })
          } catch (e: unknown) {
            if (!mountedRef.current) {
              resolve({ url: null, error: 'Subida cancelada' })
              return
            }
            setUploading(false)
            resolve({ url: null, error: mapFirestoreError(e) })
          }
        },
      )
    })
  }

  return { upload, uploading, progress }
}
