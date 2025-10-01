import { useEffect, useMemo, useState } from 'react'
import { db, Brinquedo, uid } from '../services/mockDb'

export default function Brinquedos() {
	const [_, force] = useState(0)
	const brinquedos = useMemo(() => db.get().brinquedos, [_])
	const [nome, setNome] = useState('')
	const [editId, setEditId] = useState<string | null>(null)
	const [editNome, setEditNome] = useState('')
	const [query, setQuery] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)

	function refresh() { force((x) => x + 1 as unknown as number) }

	function add() {
		if (!nome.trim()) return
		db.update((d) => {
			d.brinquedos.push({ id: uid('bq'), nome: nome.trim() })
		})
		setNome('')
		refresh()
	}

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return brinquedos
		return brinquedos.filter((b) => b.nome.toLowerCase().includes(q))
	}, [brinquedos, query])

	const totalPages = Math.max(1, Math.ceil(filtered.length / Math.max(1, pageSize)))
	const currentPage = Math.min(page, totalPages)
	const startIdx = (currentPage - 1) * pageSize
	const visible = filtered.slice(startIdx, startIdx + pageSize)

	useEffect(() => { setPage(1) }, [query, pageSize, brinquedos.length])

	function exportCsv() {
		const rows = [['id', 'nome'], ...filtered.map(b => [b.id, b.nome])]
		const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
		a.download = `brinquedos_${ts}.csv`
		a.click()
		setTimeout(() => URL.revokeObjectURL(url), 500)
	}

function exportXls() {
	const header = ['id', 'nome']
	const rows = filtered.map(b => [b.id, b.nome])
	const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table>${[header, ...rows].map(r => `<tr>${r.map(c => `<td>${String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('')}</table></body></html>`
	const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
	a.download = `brinquedos_${ts}.xls`
	a.click()
	setTimeout(() => URL.revokeObjectURL(url), 500)
}

	return (
		<div className="container medium">
			<div className="title"><h2>Brinquedos</h2><span className="subtitle">Cadastro simples de brinquedos</span></div>
			<div className="card row" style={{ marginBottom: 16 }}>
				<input className="input" placeholder="Nome do Brinquedo" value={nome} onChange={(e) => setNome(e.target.value)} />
				<button className="btn primary right" onClick={add}>Adicionar</button>
			</div>
			<div className="card row" style={{ alignItems: 'center', marginBottom: 16 }}>
				<input className="input" style={{ maxWidth: 360 }} placeholder="Buscar brinquedo" value={query} onChange={(e) => setQuery(e.target.value)} />
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
							<th>Nome</th>
							<th style={{ width: 220 }}>Ações</th>
						</tr>
					</thead>
					<tbody>
						{visible.map((b) => (
							<tr key={b.id}>
								<td>
									{editId === b.id ? (
										<input className="input" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
									) : (
										<span>{b.nome}</span>
									)}
								</td>
								<td className="row">
									{editId === b.id ? (
										<>
											<button className="btn success" onClick={() => salvarEdicao(b.id)}>Salvar</button>
											<button className="btn" onClick={() => cancelarEdicao()}>Cancelar</button>
										</>
									) : (
										<>
										<button className="btn icon" onClick={() => iniciarEdicao(b)}>✏️ Editar</button>
										<button className="btn icon" onClick={() => remover(b.id)}>🗑️ Excluir</button>
										</>
									)}
								</td>
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

	function iniciarEdicao(item: Brinquedo) {
		setEditId(item.id)
		setEditNome(item.nome)
	}

	function cancelarEdicao() {
		setEditId(null)
		setEditNome('')
	}

	function salvarEdicao(id: string) {
		const nomeLimpo = editNome.trim()
		if (!nomeLimpo) return alert('Informe o nome do brinquedo')
		db.update((d) => {
			const item = d.brinquedos.find((x) => x.id === id)
			if (item) item.nome = nomeLimpo
		})
		cancelarEdicao()
		refresh()
	}

	function remover(id: string) {
		// impedir remoção se houver lançamentos vinculados
		const temUso = db.get().lancamentos.some((l) => l.brinquedoId === id)
		if (temUso) return alert('Não é possível excluir: existem lançamentos vinculados a este brinquedo.')
		if (!confirm('Excluir este brinquedo?')) return
		db.update((d) => {
			d.brinquedos = d.brinquedos.filter((x) => x.id !== id)
		})
		refresh()
	}
}


