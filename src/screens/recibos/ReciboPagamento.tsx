import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../services/mockDb'
import { PaymentIcon, resolvePaymentKind } from '../../ui/icons'

export default function ReciboPagamento() {
	const { id } = useParams()
	const d = db.get()
	const lanc = d.lancamentos.find((l) => l.id === id)

	useEffect(() => {
		setTimeout(() => window.print(), 300)
	}, [])

	if (!lanc) return <div className="receipt"><h3>Recibo</h3><div>Registro não encontrado</div></div>

	const params = d.parametros
	const forma = (lanc as any).formaPagamentoId as string | undefined
	const pixPayload = forma === 'pix'
		? `PIX|Key=${encodeURIComponent(params.pixChave || '')}|Nome=${encodeURIComponent(params.empresaNome || 'Loja')}|Cidade=${encodeURIComponent(params.pixCidade || '')}|Valor=${lanc.valorCalculado.toFixed(2)}|Txid=${encodeURIComponent('TX' + lanc.id)}`
		: ''
	return (
		<div className="receipt">
			{params.empresaLogoUrl ? (
				<div style={{ textAlign: 'center' }}>
					<img alt="logo" src={params.empresaLogoUrl} style={{ height: 40, objectFit: 'contain' }} />
				</div>
			) : null}
			<h3>{params.empresaNome || 'Recibo'}</h3>
			{params.empresaCnpj && <div style={{ textAlign: 'center', marginBottom: 8 }}>CNPJ: {params.empresaCnpj}</div>}
			<div>Recibo de Pagamento</div>
			<div>Data/Hora: {new Date().toLocaleString()}</div>
			<div>Criança: {lanc.nomeCrianca}</div>
			<div>Responsável: {lanc.nomeResponsavel}</div>
			<div>Valor pago: R$ {lanc.valorCalculado.toFixed(2)}</div>
			{forma && <div>Forma: <PaymentIcon kind={resolvePaymentKind(forma)} /> {forma.toUpperCase()}</div>}
			{forma === 'pix' && (
				<div style={{ textAlign: 'center', marginTop: 8 }}>
					<img alt="PIX QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixPayload)}`} />
					<div style={{ fontSize: 10 }}>Aponte a câmera para pagar</div>
				</div>
			)}
			<hr />
			<small>Obrigado pela preferência.</small>
		</div>
	)
}


