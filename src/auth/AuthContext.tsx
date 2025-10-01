import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type User = {
	username: string
}

type AuthContextValue = {
	user: User | null
	isAuthenticated: boolean
	login: (username: string, password: string) => Promise<boolean>
	logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const AUTH_STORAGE_KEY = 'app.auth.user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(AUTH_STORAGE_KEY)
			if (raw) {
				setUser(JSON.parse(raw))
			}
		} catch {}
	}, [])

	const login = useCallback(async (username: string, password: string) => {
		// Mocked auth: accept any non-empty credentials
		if (!username || !password) return false
		const nextUser: User = { username }
		setUser(nextUser)
		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
		return true
	}, [])

	const logout = useCallback(() => {
		setUser(null)
		localStorage.removeItem(AUTH_STORAGE_KEY)
	}, [])

	const value = useMemo<AuthContextValue>(() => ({
		user,
		isAuthenticated: !!user,
		login,
		logout,
	}), [login, logout, user])

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}


