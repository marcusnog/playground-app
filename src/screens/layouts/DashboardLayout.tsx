import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useEffect, useState } from 'react'

export default function DashboardLayout() {
	const { logout } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [submenuOpen, setSubmenuOpen] = useState<string | null>(null)
	
	// Check if we're on desktop
	const [isDesktop, setIsDesktop] = useState(false)
	
	useEffect(() => {
		const checkScreenSize = () => {
			setIsDesktop(window.innerWidth >= 1024)
		}
		
		checkScreenSize()
		window.addEventListener('resize', checkScreenSize)
		
		return () => window.removeEventListener('resize', checkScreenSize)
	}, [])
	
	// Use isDesktop to control sidebar visibility
	const shouldShowSidebar = isDesktop || sidebarOpen

	function toggleTheme() {
		const isLight = document.documentElement.dataset.theme === 'light'
		const next = isLight ? 'dark' : 'light'
		document.documentElement.dataset.theme = next
		try { localStorage.setItem('app.theme', next) } catch {}
	}

	const isLight = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light'

	// Update page title based on current route
	const path = location.pathname
	let pageTitle = 'Dashboard'
	if (path.startsWith('/dashboard')) pageTitle = 'Dashboard'
	else if (path.startsWith('/acompanhamento')) pageTitle = 'Acompanhamento'
	else if (path.startsWith('/lancamento')) pageTitle = 'Lançamento'
	else if (path.startsWith('/caixa')) pageTitle = 'Caixa'
	else if (path.startsWith('/parametros')) pageTitle = 'Parâmetros'
	else if (path.startsWith('/formas-pagamento')) pageTitle = 'Formas de Pagamento'
	else if (path.startsWith('/brinquedos')) pageTitle = 'Brinquedos'
	else if (path.startsWith('/pagamento')) pageTitle = 'Pagamento'
	else if (path.startsWith('/recibo')) pageTitle = 'Recibo'

	useEffect(() => {
		document.title = `Playground - ${pageTitle}`
	}, [pageTitle])

	function onLogout() {
		logout()
		navigate('/login')
	}

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen)
	}

	const closeSidebar = () => {
		setSidebarOpen(false)
	}

	const toggleSubmenu = (menuName: string) => {
		setSubmenuOpen(submenuOpen === menuName ? null : menuName)
	}

	return (
		<div className="app-layout">
			{/* Mobile Header */}
			<header className="app-header mobile-header">
				<button className="menu-toggle" onClick={toggleSidebar}>
					☰
				</button>
				<Link to="/acompanhamento" className="brand">Parque</Link>
				<div className="header-actions">
					<label className="switch">
						<span className="icon sun">☀️</span>
						<input type="checkbox" onChange={toggleTheme} defaultChecked={isLight} />
						<span className="slider"></span>
						<span className="icon moon">🌙</span>
					</label>
					<button className="btn" onClick={onLogout}>Sair</button>
				</div>
			</header>

			{/* Sidebar */}
			<aside className={`sidebar ${shouldShowSidebar ? 'open' : ''}`}>
				<div className="sidebar-header">
					<Link to="/acompanhamento" className="brand" onClick={closeSidebar}>Parque</Link>
					<button className="close-sidebar" onClick={closeSidebar}>×</button>
				</div>
				<nav className="sidebar-nav">
					<NavLink to="/dashboard" onClick={closeSidebar}>
						<span className="nav-icon">📈</span>
						Dashboard
					</NavLink>
					<NavLink to="/acompanhamento" onClick={closeSidebar}>
						<span className="nav-icon">📊</span>
						Acompanhamento
					</NavLink>
					<NavLink to="/lancamento" onClick={closeSidebar}>
						<span className="nav-icon">➕</span>
						Lançamento
					</NavLink>
					<NavLink to="/caixa" onClick={closeSidebar}>
						<span className="nav-icon">💰</span>
						Caixa
					</NavLink>
					
					{/* Parâmetros com submenu */}
					<div className="nav-item">
						<button 
							className="nav-link nav-toggle" 
							onClick={() => toggleSubmenu('parametros')}
						>
							<span className="nav-icon">⚙️</span>
							Parâmetros
							<span className={`nav-arrow ${submenuOpen === 'parametros' ? 'open' : ''}`}>▼</span>
						</button>
						{submenuOpen === 'parametros' && (
							<div className="nav-submenu">
								<NavLink to="/parametros" onClick={closeSidebar}>
									<span className="nav-icon">⚙️</span>
									Configurações
								</NavLink>
								<NavLink to="/formas-pagamento" onClick={closeSidebar}>
									<span className="nav-icon">💳</span>
									Formas de Pagamento
								</NavLink>
								<NavLink to="/brinquedos" onClick={closeSidebar}>
									<span className="nav-icon">🎠</span>
									Brinquedos
								</NavLink>
							</div>
						)}
					</div>
				</nav>
				<div className="sidebar-footer">
					<div className="user-info">
						<span>Usuário Logado</span>
					</div>
				</div>
			</aside>

			{/* Overlay for mobile */}
			{sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

			{/* Main Content */}
			<main className="main-content">
				<div className="page container">
					<Outlet />
				</div>
			</main>
		</div>
	)
}


