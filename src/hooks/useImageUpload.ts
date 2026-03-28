import { useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = (file: File, path: string): Promise<{ url: string | null; error: string | null }> => {
    setUploading(true)
    setProgress(0)
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)

    return new Promise((resolve) => {
      task.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 90)
          setProgress(pct)
        },
        (err) => {
          setUploading(false)
          setProgress(0)
          resolve({ url: null, error: err.message })
        },
        async () => {
          try {
            const url = await getDownloadURL(storageRef)
            setProgress(100)
            setUploading(false)
            resolve({ url, error: null })
          } catch (e: unknown) {
            setUploading(false)
            resolve({ url: null, error: (e as Error).message })
          }
        },
      )
    })
  }

  return { upload, uploading, progress }
}
