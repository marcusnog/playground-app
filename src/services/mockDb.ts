// Simple localStorage-backed mock DB

export type FormaPagamento = { id: string; descricao: string; status: 'ativo' | 'inativo' }
export type Brinquedo = { id: string; nome: string }
export type Parametros = {
	valorInicialMinutos: number;
	valorInicialReais: number;
	valorCicloMinutos: number;
	valorCicloReais: number;
	empresaNome?: string;
	empresaCnpj?: string;
	empresaLogoUrl?: string;
	pixChave?: string;
	pixCidade?: string;
}
export type CaixaStatus = 'aberto' | 'fechado'
export type Caixa = { id: string; data: string; valorInicial: number; status: CaixaStatus }
export type Lancamento = {
	id: string
	dataHora: string
	nomeCrianca: string
	nomeResponsavel: string
	whatsappResponsavel: string
	numeroPulseira?: string
	tempoSolicitadoMin: number | null // null -> Tempo Livre
	brinquedoId?: string
	status: 'aberto' | 'pago' | 'cancelado'
	valorCalculado: number
}

const KEY = 'app.mockdb.v1'

type DbShape = {
	formasPagamento: FormaPagamento[]
	brinquedos: Brinquedo[]
	parametros: Parametros
	caixas: Caixa[]
	lancamentos: Lancamento[]
}

const defaultDb: DbShape = {
	formasPagamento: [
		{ id: 'dinheiro', descricao: 'Dinheiro', status: 'ativo' },
		{ id: 'pix', descricao: 'PIX', status: 'ativo' },
		{ id: 'debito', descricao: 'Débito', status: 'ativo' },
	],
	brinquedos: [],
	parametros: { valorInicialMinutos: 30, valorInicialReais: 20, valorCicloMinutos: 15, valorCicloReais: 10, empresaNome: 'Parque Infantil', empresaCnpj: '00.000.000/0000-00', empresaLogoUrl: '', pixChave: '', pixCidade: 'Sua Cidade' },
	caixas: [],
	lancamentos: [],
}

function load(): DbShape {
	try {
		const raw = localStorage.getItem(KEY)
		if (raw) return JSON.parse(raw)
	} catch {}
	return defaultDb
}

function save(db: DbShape) {
	localStorage.setItem(KEY, JSON.stringify(db))
}

export const db = {
	get(): DbShape {
		return load()
	},
	set(next: DbShape) {
		save(next)
	},
	update(mutator: (draft: DbShape) => void) {
		const current = load()
		mutator(current)
		save(current)
	},
}

export function calcularValor(param: Parametros, tempoMin: number | null): number {
	if (tempoMin == null) return 0
	const { valorInicialMinutos, valorInicialReais, valorCicloMinutos, valorCicloReais } = param
	if (tempoMin <= valorInicialMinutos) return valorInicialReais
	const excedente = Math.max(0, tempoMin - valorInicialMinutos)
	const ciclos = Math.ceil(excedente / Math.max(1, valorCicloMinutos))
	return valorInicialReais + ciclos * valorCicloReais
}

export function uid(prefix: string) {
	return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}


