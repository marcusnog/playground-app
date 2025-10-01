import { useEffect, useMemo, useState } from 'react'
import { db, calcularValor } from '../services/mockDb'
import { Link } from 'react-router-dom'

export default function Acompanhamento() {
	const [tick, setTick] = useState(0)
	const d = db.get()
	const parametros = d.parametros
	const abertos = useMemo(() => d.lancamentos.filter((l) => l.status === 'aberto'), [tick])

	useEffect(() => {
		const t = setInterval(() => setTick((x) => x + 1), 1000 * 30)
		return () => clearInterval(t)
	}, [])

	function minutosDecorridos(iso: string) {
		const ms = Date.now() - new Date(iso).getTime()
		return Math.floor(ms / 60000)
	}

	function abrirWhatsapp(numero: string, texto: string) {
		const url = `https://wa.me/${encodeURIComponent(numero)}?text=${encodeURIComponent(texto)}`
		window.open(url, '_blank')
	}

	return (
		<div className="container wide">
			<div className="title">
				<h2>Acompanhamento</h2>
				<span className="subtitle">{abertos.length} em andamento</span>
			</div>
			<div className="card table-wrap">
				<table className="table">
					<thead>
						<tr>
							<th>Criança</th>
							<th>Responsável</th>
							<th>Tempo</th>
							<th>Valor</th>
							<th style={{ width: 330 }}>Ações</th>
						</tr>
					</thead>
					<tbody>
						{abertos.map((l) => {
							const dec = minutosDecorridos(l.dataHora)
							const alvo = l.tempoSolicitadoMin ?? Infinity
							const restante = isFinite(alvo) ? Math.max(0, alvo - dec) : Infinity
							const valor = calcularValor(parametros, l.tempoSolicitadoMin)
							const alerta = isFinite(restante) && restante <= 5
							return (
								<tr key={l.id} className={alerta ? 'highlight' : undefined}>
									<td>{l.nomeCrianca}</td>
									<td>{l.nomeResponsavel}</td>
									<td>{isFinite(restante) ? `${dec} min / falta ${restante} min` : `${dec} min (livre)`}</td>
									<td>R$ {valor.toFixed(2)}</td>
									<td className="row">
										<button className="btn icon" onClick={() => abrirWhatsapp(l.whatsappResponsavel, 'Por favor, compareça ao local.')} disabled={!l.whatsappResponsavel}>📞 Chamar</button>
										{alerta && l.whatsappResponsavel && <button className="btn warning icon" onClick={() => abrirWhatsapp(l.whatsappResponsavel, 'O tempo solicitado está acabando.')}>📣 Avisar</button>}
										<Link to={`/pagamento/${l.id}`}><button className="btn primary icon">💳 Pagamento</button></Link>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}


