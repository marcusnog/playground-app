import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, uid, calcularValor, Parametros } from '../services/mockDb'
import { useCaixa } from '../hooks/useCaixa'

export default function Lancamento() {
	const brinquedos = useMemo(() => db.get().brinquedos, [])
	const parametros = useMemo(() => db.get().parametros, [])
	const navigate = useNavigate()
	const { caixaAberto } = useCaixa()
	const [form, setForm] = useState({
		nomeCrianca: '',
		nomeResponsavel: '',
		whatsappResponsavel: '',
		numeroPulseira: '',
		brinquedoId: '',
		tempoSolicitadoMin: 30,
		tempoLivre: false,
	})

	const valor = useMemo(() => calcularValor(parametros as Parametros, form.tempoLivre ? null : form.tempoSolicitadoMin), [form.tempoSolicitadoMin, form.tempoLivre, parametros])

	function onSave() {
		if (!caixaAberto) {
			return alert('❌ Caixa fechado! É necessário abrir o caixa antes de fazer lançamentos.')
		}
		
		if (!form.nomeCrianca.trim() || !form.nomeResponsavel.trim()) {
			return alert('Preencha os nomes')
		}
		
		db.update((d) => {
			d.lancamentos.push({
				id: uid('lan'),
				dataHora: new Date().toISOString(),
				nomeCrianca: form.nomeCrianca.trim(),
				nomeResponsavel: form.nomeResponsavel.trim(),
				whatsappResponsavel: form.whatsappResponsavel.trim(),
				numeroPulseira: form.numeroPulseira.trim() || undefined,
				brinquedoId: form.brinquedoId || undefined,
				tempoSolicitadoMin: form.tempoLivre ? null : form.tempoSolicitadoMin,
				status: 'aberto',
				valorCalculado: valor,
			})
		})
		alert('✅ Lançamento salvo. Gerando cupom...')
		const lancamentos = db.get().lancamentos
		navigate(`/recibo/lancamento/${lancamentos[lancamentos.length - 1]?.id}`)
	}

	return (
		<div className="container" style={{ maxWidth: 860 }}>
			<div className="title">
				<h2>Novo Lançamento</h2>
				<div className="caixa-status">
					{caixaAberto ? (
						<span className="badge on">✅ Caixa Aberto</span>
					) : (
						<span className="badge off">❌ Caixa Fechado</span>
					)}
				</div>
			</div>
			
			{!caixaAberto && (
				<div className="card" style={{ background: '#2b1a1a', border: '1px solid #ff6b6b', marginBottom: '16px' }}>
					<div style={{ color: '#ff6b6b', fontWeight: '600', marginBottom: '8px' }}>
						⚠️ Caixa Fechado
					</div>
					<div style={{ color: '#ffb3b3', fontSize: '0.9rem' }}>
						É necessário abrir o caixa antes de fazer lançamentos. 
						<a href="/caixa" style={{ color: '#ff6b6b', textDecoration: 'underline' }}>
							Ir para Caixa
						</a>
					</div>
				</div>
			)}
			
			<div className="card form two">
				<div>
					<label className="field">
						<span>Data/Hora</span>
						<input className="input" value={new Date().toLocaleString()} readOnly />
					</label>
					<label className="field">
						<span>Número da pulseira</span>
						<input className="input" value={form.numeroPulseira} onChange={(e) => setForm({ ...form, numeroPulseira: e.target.value })} />
					</label>
				</div>
				<div>
					<label className="field">
						<span>Nome da criança</span>
						<input className="input" value={form.nomeCrianca} onChange={(e) => setForm({ ...form, nomeCrianca: e.target.value })} />
					</label>
					<label className="field">
						<span>Nome do responsável</span>
						<input className="input" value={form.nomeResponsavel} onChange={(e) => setForm({ ...form, nomeResponsavel: e.target.value })} />
					</label>
				</div>
				<div>
					<label className="field">
						<span>WhatsApp do responsável</span>
						<input className="input" value={form.whatsappResponsavel} onChange={(e) => setForm({ ...form, whatsappResponsavel: e.target.value })} placeholder="5599999999999" />
					</label>
					<label className="field">
						<span>Brinquedo</span>
						<select className="select" value={form.brinquedoId} onChange={(e) => setForm({ ...form, brinquedoId: e.target.value })}>
							<option value="">(opcional)</option>
							{brinquedos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
						</select>
					</label>
				</div>
				<div>
					<label className="field">
						<span>Tempo Solicitado (minutos)</span>
						<input className="input" type="number" disabled={form.tempoLivre} value={form.tempoSolicitadoMin} onChange={(e) => setForm({ ...form, tempoSolicitadoMin: Number(e.target.value) })} />
					</label>
					<label className="field">
						<span>Tempo Livre</span>
						<div className="row"><input type="checkbox" checked={form.tempoLivre} onChange={(e) => setForm({ ...form, tempoLivre: e.target.checked })} /> <span>Ativar</span></div>
					</label>
				</div>
				<div className="actions" style={{ gridColumn: '1 / -1' }}>
					<strong style={{ marginRight: 'auto' }}>Valor: R$ {valor.toFixed(2)}</strong>
					<button 
						className="btn primary icon" 
						onClick={onSave}
						disabled={!caixaAberto}
						style={{ 
							opacity: caixaAberto ? 1 : 0.5,
							cursor: caixaAberto ? 'pointer' : 'not-allowed'
						}}
					>
						🧾 Salvar e Gerar Cupom
					</button>
				</div>
			</div>
		</div>
	)
}


