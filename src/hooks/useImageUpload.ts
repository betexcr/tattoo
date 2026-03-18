import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = async (file: File, path: string): Promise<{ url: string | null; error: string | null }> => {
    setUploading(true)
    setProgress(0)
    try {
      const storageRef = ref(storage, path)
      setProgress(30)
      await uploadBytes(storageRef, file)
      setProgress(80)
      const url = await getDownloadURL(storageRef)
      setProgress(100)
      setUploading(false)
      return { url, error: null }
    } catch (e: unknown) {
      setUploading(false)
      return { url: null, error: (e as Error).message }
    }
  }

  return { upload, uploading, progress }
}
