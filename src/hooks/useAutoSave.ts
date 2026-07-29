import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../stores/editor-store'
import { updateSession } from '../api/sessions'

export function useAutoSave(debounceMs = 2000) {
  const session = useEditorStore((s) => s.session)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // No guardar en el primer render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaving(true)
      setError(null)
      try {
        await updateSession(session)
        setLastSaved(new Date())
      } catch {
        setError('Error al guardar')
      } finally {
        setSaving(false)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [session, debounceMs])

  return { saving, lastSaved, error }
}
