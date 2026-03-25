/**
 * Visão Financeira Router
 * 
 * Procedures para DRE, metas, receitas vs despesas
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { executeQuery } from '../oracle-helpers';

const dateRangeSchema = z.object({
  dataInicio: z.date(),
  dataFim: z.date(),
  codemp: z.number(),
});

export const financeiroRouter = router({
  /**
   * Retorna DRE simplificada por empresa
   */
  getDRE: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            :codemp AS codemp,
            SUM(CASE WHEN CAB.TIPMOV = 'V' THEN CAB.VLRNOTA ELSE 0 END) AS receita,
            SUM(CASE WHEN CAB.TIPMOV = 'V' THEN NVL(CUS.CUSMED, 0) * ITE.QTDNEG ELSE 0 END) AS cmv,
            (SUM(CASE WHEN CAB.TIPMOV = 'V' THEN CAB.VLRNOTA ELSE 0 END) - 
             SUM(CASE WHEN CAB.TIPMOV = 'V' THEN NVL(CUS.CUSMED, 0) * ITE.QTDNEG ELSE 0 END)) AS margemBruta,
            SUM(CASE WHEN FIN.RECDESP = -1 THEN FIN.VLRDESDOB ELSE 0 END) AS despesas,
            (SUM(CASE WHEN CAB.TIPMOV = 'V' THEN CAB.VLRNOTA ELSE 0 END) - 
             SUM(CASE WHEN CAB.TIPMOV = 'V' THEN NVL(CUS.CUSMED, 0) * ITE.QTDNEG ELSE 0 END) -
             SUM(CASE WHEN FIN.RECDESP = -1 THEN FIN.VLRDESDOB ELSE 0 END)) AS lucro
          FROM TGFCAB CAB
          LEFT JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
          LEFT JOIN TGFCUS CUS ON ITE.CODPROD = CUS.CODPROD AND CAB.CODEMP = CUS.CODEMP
          LEFT JOIN TGFFIN FIN ON CAB.NUNOTA = FIN.NUNOTA
          WHERE CAB.CODEMP = :codemp
            AND CAB.DTNEG BETWEEN :dataInicio AND :dataFim
        `;

        const params = {
          codemp: input.codemp,
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Financeiro] Erro ao buscar DRE:', error);
        throw error;
      }
    }),

  /**
   * Retorna receitas vs despesas ao longo do tempo
   */
  getReceitaVsDespesa: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            TRUNC(CAB.DTNEG, 'MM') AS mes,
            SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN CAB.VLRNOTA ELSE 0 END) AS receita,
            SUM(CASE WHEN FIN.RECDESP = -1 THEN FIN.VLRDESDOB ELSE 0 END) AS despesa,
            SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN CAB.VLRNOTA ELSE 0 END) -
            SUM(CASE WHEN FIN.RECDESP = -1 THEN FIN.VLRDESDOB ELSE 0 END) AS liquido
          FROM TGFCAB CAB
          LEFT JOIN TGFFIN FIN ON CAB.NUNOTA = FIN.NUNOTA
          WHERE CAB.CODEMP = :codemp
            AND CAB.DTNEG BETWEEN :dataInicio AND :dataFim
          GROUP BY TRUNC(CAB.DTNEG, 'MM')
          ORDER BY mes ASC
        `;

        const params = {
          codemp: input.codemp,
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Financeiro] Erro ao buscar receita vs despesa:', error);
        throw error;
      }
    }),

  /**
   * Retorna atingimento de meta de lucro
   */
  getAtingimentoMeta: protectedProcedure
    .input(
      dateRangeSchema.extend({
        metaLucro: z.number(),
        metaReceita: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            :metaReceita AS metaReceita,
            :metaLucro AS metaLucro,
            SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN CAB.VLRNOTA ELSE 0 END) AS receitaRealizada,
            SUM(NVL(CAB.VLRLUCRO, 0)) AS lucroRealizado,
            ROUND((SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN CAB.VLRNOTA ELSE 0 END) / :metaReceita) * 100, 2) AS percentualReceita,
            ROUND((SUM(NVL(CAB.VLRLUCRO, 0)) / :metaLucro) * 100, 2) AS percentualLucro
          FROM TGFCAB CAB
          WHERE CAB.CODEMP = :codemp
            AND CAB.DTNEG BETWEEN :dataInicio AND :dataFim
        `;

        const params = {
          codemp: input.codemp,
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          metaReceita: input.metaReceita,
          metaLucro: input.metaLucro,
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Financeiro] Erro ao buscar atingimento de meta:', error);
        throw error;
      }
    }),

  /**
   * Retorna KPIs por empresa (vendedores, clientes)
   */
  getKPIsPorEmpresa: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            COUNT(DISTINCT CAB.CODVEND) AS totalVendedores,
            COUNT(DISTINCT CAB.CODPARC) AS totalClientes,
            COUNT(DISTINCT CAB.NUNOTA) AS totalNotas,
            AVG(CAB.VLRNOTA) AS ticketMedio,
            SUM(CAB.VLRNOTA) AS faturamentoTotal
          FROM TGFCAB CAB
          WHERE CAB.CODEMP = :codemp
            AND CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
        `;

        const params = {
          codemp: input.codemp,
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Financeiro] Erro ao buscar KPIs por empresa:', error);
        throw error;
      }
    }),

  /**
   * Retorna analise de inadimplencia
   */
  getInadimplencia: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            COUNT(*) AS totalTitulos,
            SUM(CASE WHEN FIN.DTVENC < TRUNC(SYSDATE) THEN 1 ELSE 0 END) AS titulosVencidos,
            SUM(CASE WHEN FIN.DTVENC >= TRUNC(SYSDATE) THEN 1 ELSE 0 END) AS titulosAVencer,
            SUM(FIN.VLRDESDOB) AS valorTotal,
            SUM(CASE WHEN FIN.DTVENC < TRUNC(SYSDATE) THEN FIN.VLRDESDOB ELSE 0 END) AS valorVencido,
            ROUND(AVG(TRUNC(SYSDATE) - TRUNC(FIN.DTVENC)), 2) AS diasMedioAtraso
          FROM TGFFIN FIN
          WHERE FIN.CODEMP = :codemp
            AND FIN.DTNEG BETWEEN :dataInicio AND :dataFim
            AND FIN.RECDESP = 1
            AND FIN.STATUS NOT IN ('B', 'P')
        `;

        const params = {
          codemp: input.codemp,
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Financeiro] Erro ao buscar inadimplencia:', error);
        throw error;
      }
    }),
});
