/**
 * Dashboard Executivo Router
 * 
 * Procedures para KPIs executivos, gráficos de tendência e rankings
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  executeQuery,
  executeQueryScalar,
  KPIData,
  VendaData,
} from '../oracle-helpers';

const dateRangeSchema = z.object({
  dataInicio: z.date(),
  dataFim: z.date(),
  codemp: z.number().optional(),
});

export const dashboardRouter = router({
  /**
   * Retorna KPIs executivos: Faturamento, Lucro, Margem, EBITDA
   */
  getKPIs: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN CAB.VLRNOTA ELSE 0 END) AS faturamentoTotal,
            SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN NVL(CAB.VLRLUCRO, 0) ELSE 0 END) AS lucroLiquido,
            (SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN NVL(CAB.VLRLUCRO, 0) ELSE 0 END) / 
             SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN CAB.VLRNOTA ELSE 0 END)) * 100 AS margemPercentual,
            SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN NVL(CAB.VLRLUCRO, 0) + NVL(CAB.VLRDESPFIN, 0) + NVL(CAB.VLRDESPIMPOST, 0) ELSE 0 END) AS ebitda
          FROM TGFCAB CAB
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
        `;

        const params = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          ...(input.codemp && { codemp: input.codemp }),
        };

        const result = await executeQuery<KPIData>(query, params);
        return result[0] || {
          faturamentoTotal: 0,
          lucroLiquido: 0,
          margemPercentual: 0,
          ebitda: 0,
          faturamentoAnterior: 0,
          lucroAnterior: 0,
        };
      } catch (error) {
        console.error('[Dashboard] Erro ao buscar KPIs:', error);
        throw error;
      }
    }),

  /**
   * Retorna tendência de vendas comparada com período anterior
   */
  getTendenciaVendas: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            TRUNC(CAB.DTNEG, 'MM') AS mes,
            SUM(CAB.VLRNOTA) AS faturamento,
            SUM(NVL(CAB.VLRLUCRO, 0)) AS lucro
          FROM TGFCAB CAB
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY TRUNC(CAB.DTNEG, 'MM')
          ORDER BY mes ASC
        `;

        const params = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Dashboard] Erro ao buscar tendência de vendas:', error);
        throw error;
      }
    }),

  /**
   * Retorna ranking das empresas mais rentáveis
   */
  getRankingEmpresas: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            EMP.CODEMP,
            EMP.RAZAOSOCIAL AS empresa,
            SUM(CAB.VLRNOTA) AS faturamento,
            SUM(NVL(CAB.VLRLUCRO, 0)) AS lucro,
            (SUM(NVL(CAB.VLRLUCRO, 0)) / SUM(CAB.VLRNOTA)) * 100 AS margem
          FROM TGFCAB CAB
          JOIN TSIEMP EMP ON CAB.CODEMP = EMP.CODEMP
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY EMP.CODEMP, EMP.RAZAOSOCIAL
          ORDER BY lucro DESC
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
        console.error('[Dashboard] Erro ao buscar ranking de empresas:', error);
        throw error;
      }
    }),

  /**
   * Retorna ranking de marcas mais rentáveis
   */
  getRankingMarcas: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            PRO.MARCA,
            SUM(CAB.VLRNOTA) AS faturamento,
            SUM(NVL(CAB.VLRLUCRO, 0)) AS lucro,
            (SUM(NVL(CAB.VLRLUCRO, 0)) / SUM(CAB.VLRNOTA)) * 100 AS margem,
            COUNT(DISTINCT ITE.CODPROD) AS totalProdutos
          FROM TGFCAB CAB
          JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
          JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY PRO.MARCA
          ORDER BY lucro DESC
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
        console.error('[Dashboard] Erro ao buscar ranking de marcas:', error);
        throw error;
      }
    }),

  /**
   * Retorna ranking de vendedores mais rentáveis
   */
  getRankingVendedores: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            VEN.CODVEND,
            VEN.APELIDO AS vendedor,
            SUM(CAB.VLRNOTA) AS faturamento,
            SUM(NVL(CAB.VLRLUCRO, 0)) AS lucro,
            (SUM(NVL(CAB.VLRLUCRO, 0)) / SUM(CAB.VLRNOTA)) * 100 AS margem,
            COUNT(DISTINCT CAB.NUNOTA) AS totalNotas
          FROM TGFCAB CAB
          JOIN TGFVEN VEN ON CAB.CODVEND = VEN.CODVEND
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY VEN.CODVEND, VEN.APELIDO
          ORDER BY lucro DESC
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
        console.error('[Dashboard] Erro ao buscar ranking de vendedores:', error);
        throw error;
      }
    }),

  /**
   * Retorna ranking de grupos de produtos mais rentáveis
   */
  getRankingGrupos: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            GRU.CODGRUPOPROD,
            GRU.DESCRGRUPOPROD AS grupo,
            SUM(CAB.VLRNOTA) AS faturamento,
            SUM(NVL(CAB.VLRLUCRO, 0)) AS lucro,
            (SUM(NVL(CAB.VLRLUCRO, 0)) / SUM(CAB.VLRNOTA)) * 100 AS margem,
            COUNT(DISTINCT PRO.CODPROD) AS totalProdutos
          FROM TGFCAB CAB
          JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
          JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
          JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY GRU.CODGRUPOPROD, GRU.DESCRGRUPOPROD
          ORDER BY lucro DESC
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
        console.error('[Dashboard] Erro ao buscar ranking de grupos:', error);
        throw error;
      }
    }),

  /**
   * Retorna ranking de produtos mais rentáveis
   */
  getRankingProdutos: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            PRO.CODPROD,
            PRO.DESCRPROD AS produto,
            PRO.MARCA,
            SUM(ITE.QTDNEG) AS quantidade,
            SUM(ITE.QTDNEG * ITE.VLRUNIT) AS faturamento,
            SUM(NVL(ITE.VLRDESC, 0)) AS desconto,
            (SUM(ITE.QTDNEG * ITE.VLRUNIT) - SUM(NVL(ITE.VLRDESC, 0))) AS lucro
          FROM TGFCAB CAB
          JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
          JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY PRO.CODPROD, PRO.DESCRPROD, PRO.MARCA
          ORDER BY lucro DESC
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
        console.error('[Dashboard] Erro ao buscar ranking de produtos:', error);
        throw error;
      }
    }),

  /**
   * Retorna distribuição de receita por segmento (empresa/marca/vendedor/grupo)
   */
  getDistribuicaoReceita: protectedProcedure
    .input(
      dateRangeSchema.extend({
        segmento: z.enum(['empresa', 'marca', 'vendedor', 'grupo']),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = '';
        const params: any = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          ...(input.codemp && { codemp: input.codemp }),
        };

        switch (input.segmento) {
          case 'empresa':
            query = `
              SELECT
                EMP.RAZAOSOCIAL AS nome,
                SUM(CAB.VLRNOTA) AS valor,
                ROUND((SUM(CAB.VLRNOTA) / (SELECT SUM(VLRNOTA) FROM TGFCAB WHERE DTNEG BETWEEN :dataInicio AND :dataFim AND TIPMOV IN ('V', 'D'))) * 100, 2) AS percentual
              FROM TGFCAB CAB
              JOIN TSIEMP EMP ON CAB.CODEMP = EMP.CODEMP
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
              GROUP BY EMP.RAZAOSOCIAL
            `;
            break;

          case 'marca':
            query = `
              SELECT
                PRO.MARCA AS nome,
                SUM(CAB.VLRNOTA) AS valor,
                ROUND((SUM(CAB.VLRNOTA) / (SELECT SUM(VLRNOTA) FROM TGFCAB WHERE DTNEG BETWEEN :dataInicio AND :dataFim AND TIPMOV IN ('V', 'D'))) * 100, 2) AS percentual
              FROM TGFCAB CAB
              JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
              JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
              GROUP BY PRO.MARCA
            `;
            break;

          case 'vendedor':
            query = `
              SELECT
                VEN.APELIDO AS nome,
                SUM(CAB.VLRNOTA) AS valor,
                ROUND((SUM(CAB.VLRNOTA) / (SELECT SUM(VLRNOTA) FROM TGFCAB WHERE DTNEG BETWEEN :dataInicio AND :dataFim AND TIPMOV IN ('V', 'D'))) * 100, 2) AS percentual
              FROM TGFCAB CAB
              JOIN TGFVEN VEN ON CAB.CODVEND = VEN.CODVEND
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
              GROUP BY VEN.APELIDO
            `;
            break;

          case 'grupo':
            query = `
              SELECT
                GRU.DESCRGRUPOPROD AS nome,
                SUM(CAB.VLRNOTA) AS valor,
                ROUND((SUM(CAB.VLRNOTA) / (SELECT SUM(VLRNOTA) FROM TGFCAB WHERE DTNEG BETWEEN :dataInicio AND :dataFim AND TIPMOV IN ('V', 'D'))) * 100, 2) AS percentual
              FROM TGFCAB CAB
              JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
              JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
              JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
              GROUP BY GRU.DESCRGRUPOPROD
            `;
            break;
        }

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Dashboard] Erro ao buscar distribuição de receita:', error);
        throw error;
      }
    }),
});
