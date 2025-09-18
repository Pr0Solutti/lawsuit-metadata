interface IDATAJUD {
  took: number;
  timed_out: boolean;
  _shards: SHARDS;
  hits: HITS;
}
interface SHARDS {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}
interface HITS {
  total: TOTAL;
  max_score: null;
  hits: Processo[];
}
interface TOTAL {
  value: number;
  relation: 'gte' | 'lte';
}
export interface Processo {
  _index: string;
  _id: string;
  _score: number | null;
  _source: Source;
  sort: number[];
}

export interface Source {
  classe: Classe;
  numeroProcesso: string;
  sistema: Sistema;
  formato: Formato;
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  grau: string;
  '@timestamp': string;
  dataAjuizamento: string;
  movimentos: Movimento[];
  id: string;
  nivelSigilo: number;
  orgaoJulgador: OrgaoJulgador;
  assuntos: Assunto[];
}

export interface Classe {
  codigo: number;
  nome: string;
}

export interface Sistema {
  codigo: number;
  nome: string;
}

export interface Formato {
  codigo: number;
  nome: string;
}

export interface Movimento {
  codigo: number;
  nome: string;
  dataHora: string;
  complementosTabelados?: ComplementoTabelado[];
}

export interface ComplementoTabelado {
  codigo: number;
  valor: number;
  nome: string;
  descricao: string;
}

export interface OrgaoJulgador {
  codigoMunicipioIBGE: number;
  codigo: number;
  nome: string;
}

export interface Assunto {
  codigo: number;
  nome: string;
}

export { IDATAJUD };
