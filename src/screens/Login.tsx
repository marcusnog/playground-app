import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
	const { login } = useAuth()
	const navigate = useNavigate()
	useEffect(() => {
		document.title = 'Playground - Login'
	}, [])
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		const ok = await login(username.trim(), password)
		if (!ok) {
			setError('Usuário e senha são obrigatórios')
			return
		}
		navigate('/acompanhamento')
	}

	return (
		<div className="container" style={{ maxWidth: 420, margin: '64px auto' }}>
			<div className="card">
				<h2>Login</h2>
				<form className="form" onSubmit={onSubmit}>
					<label className="field">
						<span>Usuário</span>
						<input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="usuario" />
					</label>
					<label className="field">
						<span>Senha</span>
						<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="senha" />
					</label>
					{error && <div style={{ color: '#ef4444' }}>{error}</div>}
					<div className="actions">
						<button className="btn primary" type="submit">Entrar</button>
					</div>
				</form>
			</div>
		</div>
	)
}


