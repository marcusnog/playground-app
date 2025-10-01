import { useEffect, useMemo, useState } from 'react'
import { PaymentIcon, resolvePaymentKind } from '../ui/icons'
import { db, uid } from '../services/mockDb'

export default function FormasPagamento() {
	const [_, force] = useState(0)
	const formas = useMemo(() => db.get().formasPagamento, [_])
	const [descricao, setDescricao] = useState('')
	const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo')
	const [query, setQuery] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return formas
		return formas.filter((f) => f.descricao.toLowerCase().includes(q) || f.status.toLowerCase().includes(q))
	}, [formas, query])

	const totalPages = Math.max(1, Math.ceil(filtered.length / Math.max(1, pageSize)))
	const currentPage = Math.min(page, totalPages)
	const startIdx = (currentPage - 1) * pageSize
	const visible = filtered.slice(startIdx, startIdx + pageSize)

	useEffect(() => { setPage(1) }, [query, pageSize, formas.length])

	function exportCsv() {
		const rows = [['id', 'descricao', 'status'], ...filtered.map(f => [f.id, f.descricao, f.status])]
		const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
		a.download = `formas_pagamento_${ts}.csv`
		a.click()
		setTimeout(() => URL.revokeObjectURL(url), 500)
	}

	function exportXls() {
		// Gera uma tabela HTML simples que o Excel abre como planilha
		const header = ['id', 'descricao', 'status']
		const rows = filtered.map(f => [f.id, f.descricao, f.status])
		const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table>${[header, ...rows].map(r => `<tr>${r.map(c => `<td>${String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('')}</table></body></html>`
		const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
		a.download = `formas_pagamento_${ts}.xls`
		a.click()
		setTimeout(() => URL.revokeObjectURL(url), 500)
	}

	function refresh() { force((x) => x + 1 as unknown as number) }

	function add() {
		if (!descricao.trim()) return
		db.update((d) => {
			d.formasPagamento.push({ id: uid('fp'), descricao: descricao.trim(), status })
		})
		setDescricao('')
		refresh()
	}

	function toggle(id: string) {
		db.update((d) => {
			const f = d.formasPagamento.find((x) => x.id === id)
			if (f) f.status = f.status === 'ativo' ? 'inativo' : 'ativo'
		})
		refresh()
	}

	return (
		<div className="container medium">
			<div className="title"><h2>Formas de Pagamento</h2><span className="subtitle">Gerencie descrições e status</span></div>
			<div className="card row">
				<input className="input" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
				<select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
					<option value="ativo">Ativo</option>
					<option value="inativo">Inativo</option>
				</select>
				<button className="btn primary right" onClick={add}>Adicionar</button>
			</div>
			<div className="card row" style={{ marginTop: 16, marginBottom: 16, alignItems: 'center' }}>
				<input className="input" style={{ maxWidth: 360 }} placeholder="Buscar descrição ou status" value={query} onChange={(e) => setQuery(e.target.value)} />
				<div className="right row" style={{ alignItems: 'center' }}>
					<button className="btn" onClick={exportCsv}>Exportar CSV</button>
					<button className="btn" onClick={exportXls}>Exportar XLS</button>
					<span className="subtitle">Itens por página</span>
					<select className="select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
					</select>
				</div>
			</div>
			<div className="card table-wrap" style={{ marginBottom: 16 }}>
				<table className="table">
					<thead>
						<tr>
							<th>Descrição</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{visible.map((f) => (
							<tr key={f.id}>
								<td><span className="row center"><PaymentIcon kind={resolvePaymentKind(f.id + ' ' + f.descricao)} /> <span>{f.descricao}</span></span></td>
								<td>
									<span className={`badge ${f.status === 'ativo' ? 'on' : 'off'}`}>{f.status}</span>
								</td>
								<td><button className="btn icon" onClick={() => toggle(f.id)}>{f.status === 'ativo' ? '⏸️ Desativar' : '▶️ Ativar'}</button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="card row" style={{ alignItems: 'center' }}>
				<span className="subtitle">{filtered.length ? `${startIdx + 1}-${Math.min(startIdx + visible.length, filtered.length)} de ${filtered.length}` : '0 de 0'}</span>
				<div className="right row">
					<button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>Anterior</button>
					<button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Próximo</button>
				</div>
			</div>
		</div>
	)
}


