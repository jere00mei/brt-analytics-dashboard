/**
 * Limites e Giro Router
 * 
 * Procedures para liberacao de limites e analise de giro de produtos
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { executeQuery } from '../oracle-helpers';

const dateRangeSchema = z.object({
  dataInicio: z.date(),
  dataFim: z.date(),
  codemp: z.number().optional(),
});

export const limitesGiroRouter = router({
  /**
   * Retorna limites pendentes com alertas visuais
   */
  getLimitesPendentes: protectedProcedure
    .input(dateRangeSchema.extend({ status: z.enum(['P', 'L', 'N']).optional() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            LIB.NUCHAVE,
            LIB.CODEMP,
            EMP.RAZAOSOCIAL AS empresa,
            LIB.CODPARC,
            PAR.RAZAOSOCIAL AS cliente,
            LIB.DESCRICAO AS motivo,
            LIB.USBLOQUEIO,
            USU.NOMEUSU AS usuarioBloqueio,
            LIB.DHBLOQUEIO AS dataBloqueio,
            LIB.STATUS,
            SUM(FIN.VLRDESDOB) AS valor,
            TRUNC(SYSDATE) - TRUNC(LIB.DHBLOQUEIO) AS diasPendente,
            CASE
              WHEN SUM(FIN.VLRDESDOB) > 10000 AND TRUNC(SYSDATE) - TRUNC(LIB.DHBLOQUEIO) > 2 THEN 'CRITICO'
              WHEN SUM(FIN.VLRDESDOB) > 10000 THEN 'ALTO'
              WHEN TRUNC(SYSDATE) - TRUNC(LIB.DHBLOQUEIO) > 2 THEN 'ANTIGO'
              ELSE 'NORMAL'
            END AS nivelAlerta
          FROM TGFLIB LIB
          JOIN TSIEMP EMP ON LIB.CODEMP = EMP.CODEMP
          JOIN TGFPAR PAR ON LIB.CODPARC = PAR.CODPARC
          JOIN TSUUSU USU ON LIB.USBLOQUEIO = USU.CODUSU
          LEFT JOIN TGFFIN FIN ON LIB.NUCHAVE = FIN.NUCHAVE
          WHERE LIB.DHBLOQUEIO BETWEEN :dataInicio AND :dataFim
            ${input.status ? 'AND LIB.STATUS = :status' : ''}
            ${input.codemp ? 'AND LIB.CODEMP = :codemp' : ''}
          GROUP BY LIB.NUCHAVE, LIB.CODEMP, EMP.RAZAOSOCIAL, LIB.CODPARC, PAR.RAZAOSOCIAL, 
                   LIB.DESCRICAO, LIB.USBLOQUEIO, USU.NOMEUSU, LIB.DHBLOQUEIO, LIB.STATUS
          ORDER BY nivelAlerta DESC, diasPendente DESC
        `;

        const params = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          ...(input.status && { status: input.status }),
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Limites] Erro ao buscar limites pendentes:', error);
        throw error;
      }
    }),

  /**
   * Retorna top 10 clientes com limite bloqueado
   */
  getTopClientesBloqueados: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            PAR.CODPARC,
            PAR.RAZAOSOCIAL AS cliente,
            COUNT(DISTINCT LIB.NUCHAVE) AS totalBloqueios,
            SUM(FIN.VLRDESDOB) AS valorBloqueado,
            MAX(LIB.DHBLOQUEIO) AS ultimoBloqueio
          FROM TGFLIB LIB
          JOIN TGFPAR PAR ON LIB.CODPARC = PAR.CODPARC
          LEFT JOIN TGFFIN FIN ON LIB.NUCHAVE = FIN.NUCHAVE
          WHERE LIB.DHBLOQUEIO BETWEEN :dataInicio AND :dataFim
            AND LIB.STATUS = 'P'
            ${input.codemp ? 'AND LIB.CODEMP = :codemp' : ''}
          GROUP BY PAR.CODPARC, PAR.RAZAOSOCIAL
          ORDER BY valorBloqueado DESC
          FETCH FIRST :limite ROWS ONLY
        `;

        const params = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          limite: input.limite,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Limites] Erro ao buscar top clientes bloqueados:', error);
        throw error;
      }
    }),

  /**
   * Retorna KPIs de liberacao de limites
   */
  getKPIsLimites: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            COUNT(DISTINCT CASE WHEN LIB.STATUS = 'P' THEN LIB.NUCHAVE END) AS totalPendentes,
            SUM(CASE WHEN LIB.STATUS = 'P' THEN FIN.VLRDESDOB ELSE 0 END) AS valorPendente,
            COUNT(DISTINCT CASE WHEN LIB.STATUS = 'L' THEN LIB.NUCHAVE END) AS totalLiberados,
            SUM(CASE WHEN LIB.STATUS = 'L' THEN FIN.VLRDESDOB ELSE 0 END) AS valorLiberado,
            COUNT(DISTINCT CASE WHEN LIB.STATUS = 'N' THEN LIB.NUCHAVE END) AS totalNegados,
            ROUND(AVG(CASE WHEN LIB.STATUS IN ('L', 'N') THEN TRUNC(LIB.DHALTER) - TRUNC(LIB.DHBLOQUEIO) END), 2) AS tempoMedioResolucao
          FROM TGFLIB LIB
          LEFT JOIN TGFFIN FIN ON LIB.NUCHAVE = FIN.NUCHAVE
          WHERE LIB.DHBLOQUEIO BETWEEN :dataInicio AND :dataFim
            ${input.codemp ? 'AND LIB.CODEMP = :codemp' : ''}
        `;

        const params = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Limites] Erro ao buscar KPIs de limites:', error);
        throw error;
      }
    }),

  /**
   * Retorna analise de giro de produtos
   */
  getAnaliseGiro: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            GIR.CODPROD,
            PRO.DESCRPROD AS produto,
            PRO.MARCA,
            GRU.DESCRGRUPOPROD AS grupo,
            GIR.TAXA_GIRO AS taxaGiro,
            GIR.DIAS_COBERTURA AS diasCobertura,
            EST.ESTOQUE,
            EST.ESTOQUE - EST.RESERVADO AS disponivel,
            GIR1.QUANTIDADE AS vendidoMes,
            ROUND((GIR.TAXA_GIRO * EST.ESTOQUE) / NULLIF(GIR1.QUANTIDADE, 0), 2) AS margemContribuicao,
            CASE
              WHEN GIR.TAXA_GIRO > 2 AND GIR.DIAS_COBERTURA < 30 THEN 'STAR'
              WHEN GIR.TAXA_GIRO > 2 AND GIR.DIAS_COBERTURA >= 30 THEN 'CASH_COW'
              WHEN GIR.TAXA_GIRO <= 2 AND GIR.DIAS_COBERTURA < 30 THEN 'QUESTION_MARK'
              ELSE 'DOG'
            END AS statusBCG
          FROM TGFGIR GIR
          JOIN TGFPRO PRO ON GIR.CODPROD = PRO.CODPROD
          JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
          JOIN TGFEST EST ON GIR.CODPROD = EST.CODPROD AND GIR.CODEMP = EST.CODEMP
          LEFT JOIN TGFGIR1 GIR1 ON GIR.CODPROD = GIR1.CODPROD AND GIR.CODEMP = GIR1.CODEMP
          WHERE GIR.CODEMP = :codemp
            AND EST.ESTOQUE > 0
          ORDER BY GIR.TAXA_GIRO DESC
        `;

        const params = {
          codemp: input.codemp || 1,
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Giro] Erro ao buscar analise de giro:', error);
        throw error;
      }
    }),

  /**
   * Retorna ranking de produtos por giro
   */
  getRankingGiro: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(20) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            GIR.CODPROD,
            PRO.DESCRPROD AS produto,
            PRO.MARCA,
            ROUND(GIR.TAXA_GIRO, 2) AS taxaGiro,
            GIR.DIAS_COBERTURA AS diasCobertura,
            GIR1.QUANTIDADE AS vendidoMes,
            EST.ESTOQUE,
            ROUND((GIR.TAXA_GIRO * EST.ESTOQUE), 2) AS scoreGiro
          FROM TGFGIR GIR
          JOIN TGFPRO PRO ON GIR.CODPROD = PRO.CODPROD
          JOIN TGFEST EST ON GIR.CODPROD = EST.CODPROD AND GIR.CODEMP = EST.CODEMP
          LEFT JOIN TGFGIR1 GIR1 ON GIR.CODPROD = GIR1.CODPROD AND GIR.CODEMP = GIR1.CODEMP
          WHERE GIR.CODEMP = :codemp
            AND EST.ESTOQUE > 0
          ORDER BY GIR.TAXA_GIRO DESC
          FETCH FIRST :limite ROWS ONLY
        `;

        const params = {
          codemp: input.codemp || 1,
          limite: input.limite,
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Giro] Erro ao buscar ranking de giro:', error);
        throw error;
      }
    }),
});
