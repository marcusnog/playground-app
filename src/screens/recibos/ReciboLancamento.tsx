import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../services/mockDb'

export default function ReciboLancamento() {
	const { id } = useParams()
	const d = db.get()
	const lanc = d.lancamentos.find((l) => l.id === id)

	useEffect(() => {
		setTimeout(() => window.print(), 300)
	}, [])

	if (!lanc) return <div className="receipt"><h3>Recibo</h3><div>Registro não encontrado</div></div>

	const params = d.parametros
	return (
		<div className="receipt">
			{params.empresaLogoUrl ? (
				<div style={{ textAlign: 'center' }}>
					<img alt="logo" src={params.empresaLogoUrl} style={{ height: 40, objectFit: 'contain' }} />
				</div>
			) : null}
			<h3>{params.empresaNome || 'Recibo'}</h3>
			{params.empresaCnpj && <div style={{ textAlign: 'center', marginBottom: 8 }}>CNPJ: {params.empresaCnpj}</div>}
			<div>Recibo de Lançamento</div>
			<div>Data/Hora: {new Date(lanc.dataHora).toLocaleString()}</div>
			<div>Criança: {lanc.nomeCrianca}</div>
			<div>Responsável: {lanc.nomeResponsavel}</div>
			{lanc.numeroPulseira && <div>Pulseira: {lanc.numeroPulseira}</div>}
			<div>Tempo: {lanc.tempoSolicitadoMin == null ? 'Tempo Livre' : `${lanc.tempoSolicitadoMin} min`}</div>
			<div>Valor: R$ {lanc.valorCalculado.toFixed(2)}</div>
			<hr />
			<small>Apresente este cupom no caixa.</small>
		</div>
	)
}


