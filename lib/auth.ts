export type UserRole = 'user' | 'notary' | 'admin'

export interface AuthUser {
  name: string
  email: string
  phone: string
  role: UserRole
}

const KEY = 'ld_user'
const TOKEN_KEY = 'ld_token'

export const saveUser = (user: AuthUser): void => {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getUser = (): AuthUser | null => {
  try {
    const value = localStorage.getItem(KEY)
    if (!value) return null
    const parsed = JSON.parse(value)
    // migrate old data that may not have a role field
    if (!parsed.role) parsed.role = 'user' as UserRole
    return parsed as AuthUser
  } catch {
    return null
  }
}

export const clearUser = (): void => {
  localStorage.removeItem(KEY)
}
