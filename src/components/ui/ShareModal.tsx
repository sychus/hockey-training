import { useState } from 'react'

interface ShareModalProps {
  url: string
  onClose: () => void
}

export function ShareModal({ url, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Mira la sesion de entrenamiento: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center gap-4 shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success icon */}
        <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="text-white font-bold text-xl">Publicado</h2>
        <p className="text-gray-400 text-sm text-center">
          Podes compartir este link con las jugadoras
        </p>

        {/* URL display */}
        <div className="w-full px-4 py-3 bg-gray-800 rounded-lg text-center">
          <p className="text-white text-sm break-all font-mono">{url}</p>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="w-full py-3 rounded-lg border-2 border-green-600 text-green-400 font-bold text-sm hover:bg-green-600/10 transition-colors"
        >
          {copied ? 'LINK COPIADO ✓' : 'COPIAR LINK'}
        </button>

        {/* WhatsApp button */}
        <button
          onClick={handleWhatsApp}
          className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-colors"
        >
          ENVIAR POR WHATSAPP
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm mt-1"
        >
          CERRAR
        </button>
      </div>
    </div>
  )
}
