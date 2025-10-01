import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../services/mockDb'
import { PaymentIcon, resolvePaymentKind } from '../ui/icons'

export default function Pagamento() {
	const { id } = useParams()
	const navigate = useNavigate()
	const d = db.get()
	const lanc = d.lancamentos.find((l) => l.id === id)
	const formas = d.formasPagamento.filter((f) => f.status === 'ativo')
	const [forma, setForma] = useState<string>(formas[0]?.id || '')

	if (!lanc) return <div>Registro não encontrado</div>

	function finalizar() {
		if (!lanc) return
		db.update((dbb) => {
			const l = dbb.lancamentos.find((x) => x.id === lanc.id)
			if (l) {
				l.status = 'pago'
				;(l as any).formaPagamentoId = forma
			}
		})
		alert('Pagamento concluído. Gerando recibo...')
		navigate(`/recibo/pagamento/${lanc.id}`)
	}

	return (
		<div className="container" style={{ maxWidth: 560 }}>
			<h2>Pagamento</h2>
			<div className="card form two">
				<div>
					<div><strong>Criança:</strong> {lanc.nomeCrianca}</div>
					<div><strong>Responsável:</strong> {lanc.nomeResponsavel}</div>
				</div>
				<div>
					<label className="field">
						<span>Valor</span>
						<input className="input" readOnly value={`R$ ${lanc.valorCalculado.toFixed(2)}`} />
					</label>
					<label className="field">
						<span>Forma de pagamento</span>
						<div className="row center">
							<PaymentIcon kind={resolvePaymentKind(forma)} />
							<select className="select" value={forma} onChange={(e) => setForma(e.target.value)}>
								{formas.map((f) => <option key={f.id} value={f.id}>{f.descricao}</option>)}
							</select>
						</div>
					</label>
				</div>
				<div className="actions" style={{ gridColumn: '1 / -1' }}>
					<button className="btn primary icon" onClick={finalizar}>✅ Finalizar</button>
				</div>
			</div>
		</div>
	)
}


