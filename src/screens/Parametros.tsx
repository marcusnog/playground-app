import { useState } from 'react'
import { db, Parametros } from '../services/mockDb'

export default function Parametros() {
	const current = db.get().parametros
	const [form, setForm] = useState<Parametros>({ ...current })

	function onChange<K extends keyof Parametros>(key: K, value: number) {
		setForm({ ...form, [key]: value })
	}

	function onSave() {
		db.update((d) => {
			d.parametros = { ...form }
		})
		alert('Parâmetros salvos')
	}

	return (
		<div className="container" style={{ maxWidth: 520 }}>
			<h2>Parâmetros</h2>
			<div className="card form two">
				<label className="field">
					<span>Inicial (minutos)</span>
					<input className="input" type="number" value={form.valorInicialMinutos} onChange={(e) => onChange('valorInicialMinutos', Number(e.target.value))} />
				</label>
				<label className="field">
					<span>Valor inicial (R$)</span>
					<input className="input" type="number" value={form.valorInicialReais} onChange={(e) => onChange('valorInicialReais', Number(e.target.value))} />
				</label>
				<label className="field">
					<span>Ciclo (minutos)</span>
					<input className="input" type="number" value={form.valorCicloMinutos} onChange={(e) => onChange('valorCicloMinutos', Number(e.target.value))} />
				</label>
				<label className="field">
					<span>Valor ciclo (R$)</span>
					<input className="input" type="number" value={form.valorCicloReais} onChange={(e) => onChange('valorCicloReais', Number(e.target.value))} />
				</label>
				<label className="field">
					<span>Nome da empresa</span>
					<input className="input" value={form.empresaNome || ''} onChange={(e) => setForm({ ...form, empresaNome: e.target.value })} />
				</label>
				<label className="field">
					<span>CNPJ</span>
					<input className="input" value={form.empresaCnpj || ''} onChange={(e) => setForm({ ...form, empresaCnpj: e.target.value })} />
				</label>
				<label className="field">
					<span>Logo (URL)</span>
					<input className="input" value={form.empresaLogoUrl || ''} onChange={(e) => setForm({ ...form, empresaLogoUrl: e.target.value })} placeholder="https://...logo.png" />
				</label>
				<label className="field">
					<span>PIX - Chave</span>
					<input className="input" value={form.pixChave || ''} onChange={(e) => setForm({ ...form, pixChave: e.target.value })} />
				</label>
				<label className="field">
					<span>PIX - Cidade</span>
					<input className="input" value={form.pixCidade || ''} onChange={(e) => setForm({ ...form, pixCidade: e.target.value })} />
				</label>
				<div className="actions" style={{ gridColumn: '1 / -1' }}>
					<button className="btn primary icon" onClick={onSave}>💾 Salvar</button>
				</div>
			</div>
		</div>
	)
}


