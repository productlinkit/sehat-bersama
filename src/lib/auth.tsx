import { createContext, useContext, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { usePersistentState } from './storage'

export interface User {
  phone: string
  name: string
  gender?: 'P' | 'L'
  birthDate?: string
}

interface AuthContextValue {
  user: User | null
  login: (phone: string, password: string) => Promise<void>
  register: (name: string, phone: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const PHONE_RE = /^08\d{8,11}$/

/** Error codes thrown by login/register; the UI translates them. */
export type AuthError = 'invalid-phone' | 'wrong-credentials' | 'weak-password'

// Mock auth. Replace the bodies of login/register with real API calls.
// Errors are thrown as codes (Error.message = AuthError) so the UI can show them in the user's language.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = usePersistentState<User | null>('sb:user', null)

  const login = async (phone: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400))
    if (!PHONE_RE.test(phone)) throw new Error('invalid-phone' satisfies AuthError)
    if (password.length < 6) throw new Error('wrong-credentials' satisfies AuthError)
    setUser({ phone, name: 'Akun Demo' })
  }

  const register = async (name: string, phone: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400))
    if (!PHONE_RE.test(phone)) throw new Error('invalid-phone' satisfies AuthError)
    if (password.length < 8) throw new Error('weak-password' satisfies AuthError)
    setUser({ phone, name })
  }

  const logout = () => setUser(null)
  const updateUser = (patch: Partial<User>) => setUser((u) => (u ? { ...u, ...patch } : u))

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return children
}
