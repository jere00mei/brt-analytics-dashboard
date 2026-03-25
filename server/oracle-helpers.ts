/**
 * Oracle 19c Connection Helpers
 * 
 * Este arquivo contém helpers para conexão e queries ao Oracle 19c do ERP Sankhya OM
 * Todas as queries utilizam bind variables para otimização de performance
 */

import oracledb from 'oracledb';

// Configuração de conexão Oracle
const ORACLE_CONFIG = {
  host: process.env.ORACLE_HOST || '192.168.100.199',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DB || 'orcl',
  user: process.env.ORACLE_USER || 'jiva',
  password: process.env.ORACLE_PASSWORD || 'tecsis',
};

let oracleConnection: oracledb.Connection | null = null;

/**
 * Inicializa a conexão com Oracle 19c
 */
export async function initOracleConnection(): Promise<oracledb.Connection> {
  if (oracleConnection) {
    return oracleConnection;
  }

  try {
    oracleConnection = await oracledb.getConnection({
      user: ORACLE_CONFIG.user,
      password: ORACLE_CONFIG.password,
      connectionString: `${ORACLE_CONFIG.host}:${ORACLE_CONFIG.port}/${ORACLE_CONFIG.database}`,
    });

    console.log('[Oracle] Conexão estabelecida com sucesso');
    return oracleConnection;
  } catch (error) {
    console.error('[Oracle] Erro ao conectar:', error);
    throw error;
  }
}

/**
 * Executa uma query com bind variables
 */
export async function executeQuery<T>(
  query: string,
  bindParams: Record<string, unknown> | unknown[] = {},
  options: { fetchSize?: number } = {}
): Promise<T[]> {
  const connection = await initOracleConnection();

  try {
    const result = await (connection.execute as any)(query, bindParams, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchSize: options.fetchSize || 1000,
    });

    return (result.rows || []) as T[];
  } catch (error) {
    console.error('[Oracle] Erro ao executar query:', error);
    throw error;
  }
}

/**
 * Executa uma query e retorna um único resultado
 */
export async function executeQuerySingle<T>(
  query: string,
  bindParams: Record<string, unknown> | unknown[] = {}
): Promise<T | null> {
  const results = await executeQuery<T>(query, bindParams);
  return results.length > 0 ? results[0] : null;
}

/**
 * Executa uma query e retorna um valor escalar
 */
export async function executeQueryScalar<T>(
  query: string,
  bindParams: Record<string, unknown> | unknown[] = {}
): Promise<T | null> {
  const result = await executeQuerySingle<Record<string, T>>(query, bindParams);
  if (!result) return null;
  
  const firstValue = Object.values(result)[0];
  return (firstValue ?? null) as T | null;
}

/**
 * Fecha a conexão com Oracle
 */
export async function closeOracleConnection(): Promise<void> {
  if (oracleConnection) {
    try {
      await oracleConnection.close();
      oracleConnection = null;
      console.log('[Oracle] Conexão fechada');
    } catch (error) {
      console.error('[Oracle] Erro ao fechar conexão:', error);
    }
  }
}

/**
 * Tipos de dados para queries do Dashboard
 */

export interface KPIData {
  faturamentoTotal: number;
  lucroLiquido: number;
  margemPercentual: number;
  ebitda: number;
  faturamentoAnterior: number;
  lucroAnterior: number;
}

export interface VendaData {
  codEmpresa: number;
  empresa: string;
  codVendedor: number;
  vendedor: string;
  codProduto: number;
  produto: string;
  marca: string;
  codGrupo: number;
  grupo: string;
  dataVenda: Date;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  desconto: number;
  lucro: number;
}

export interface CustoData {
  codEmpresa: number;
  empresa: string;
  codProduto: number;
  produto: string;
  marca: string;
  custoMedio: number;
  custoGerencial: number;
  custoComICM: number;
  custoSemICM: number;
  dataAtualizacao: Date;
}

export interface EstoqueData {
  codEmpresa: number;
  empresa: string;
  codProduto: number;
  produto: string;
  marca: string;
  codGrupo: number;
  grupo: string;
  estoque: number;
  reservado: number;
  disponivel: number;
  taxaGiro: number;
  diasCobertura: number;
  statusAlerta: string; // 'parado' | 'normal' | 'ruptura'
}

export interface InadimplenciaData {
  codEmpresa: number;
  empresa: string;
  nufin: number;
  nunota: number;
  numnota: string;
  dataVencimento: Date;
  dataBaixa: Date | null;
  diasAtraso: number;
  valor: number;
  codCliente: number;
  cliente: string;
  status: string; // 'pendente' | 'pago' | 'negociado'
}

export interface LimiteData {
  nuchave: number;
  codEmpresa: number;
  empresa: string;
  codCliente: number;
  cliente: string;
  descricao: string;
  usuarioBloqueio: string;
  dataBloqueio: Date;
  status: string; // 'P' (Pendente) | 'L' (Liberado) | 'N' (Negado)
  valor: number;
  diasPendente: number;
}

export interface GiroData {
  codEmpresa: number;
  empresa: string;
  codProduto: number;
  produto: string;
  marca: string;
  codGrupo: number;
  grupo: string;
  taxaGiro: number;
  diasCobertura: number;
  estoque: number;
  vendidoMes: number;
  vendidoAno: number;
  margemContribuicao: number;
  statusBCG: string; // 'star' | 'cash_cow' | 'question_mark' | 'dog'
}

export interface FiltroHierarquico {
  empresas: Array<{ codigo: number; nome: string }>;
  marcas: Array<{ codigo: string; nome: string }>;
  vendedores: Array<{ codigo: number; nome: string }>;
  grupos: Array<{ codigo: number; nome: string }>;
  produtos: Array<{ codigo: number; nome: string }>;
}
