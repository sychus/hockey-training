import type { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Acceso restringido</h1>
          <p className="text-gray-400">
            Necesitás un link de acceso válido para entrar al backoffice.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
