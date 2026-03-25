/**
 * Visao Comercial Router
 * 
 * Procedures para vendas, funil de conversao, heatmap de atividades
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { executeQuery } from '../oracle-helpers';

const dateRangeSchema = z.object({
  dataInicio: z.date(),
  dataFim: z.date(),
  codemp: z.number().optional(),
});

export const comercialRouter = router({
  /**
   * Retorna vendas por empresa, marca, vendedor, grupo e produto
   */
  getVendasPorDimensao: protectedProcedure
    .input(
      dateRangeSchema.extend({
        dimensao: z.enum(['empresa', 'marca', 'vendedor', 'grupo', 'produto']),
        limite: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = '';
        const params: any = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          limite: input.limite,
          ...(input.codemp && { codemp: input.codemp }),
        };

        switch (input.dimensao) {
          case 'empresa':
            query = `
              SELECT
                EMP.CODEMP,
                EMP.RAZAOSOCIAL AS descricao,
                SUM(CAB.VLRNOTA) AS faturamento,
                COUNT(DISTINCT CAB.NUNOTA) AS totalNotas,
                COUNT(DISTINCT CAB.CODPARC) AS totalClientes
              FROM TGFCAB CAB
              JOIN TSIEMP EMP ON CAB.CODEMP = EMP.CODEMP
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
              GROUP BY EMP.CODEMP, EMP.RAZAOSOCIAL
              ORDER BY faturamento DESC
              FETCH FIRST :limite ROWS ONLY
            `;
            break;

          case 'marca':
            query = `
              SELECT
                PRO.MARCA,
                PRO.MARCA AS descricao,
                SUM(CAB.VLRNOTA) AS faturamento,
                COUNT(DISTINCT CAB.NUNOTA) AS totalNotas,
                COUNT(DISTINCT ITE.CODPROD) AS totalProdutos
              FROM TGFCAB CAB
              JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
              JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
                ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
              GROUP BY PRO.MARCA
              ORDER BY faturamento DESC
              FETCH FIRST :limite ROWS ONLY
            `;
            break;

          case 'vendedor':
            query = `
              SELECT
                VEN.CODVEND,
                VEN.APELIDO AS descricao,
                SUM(CAB.VLRNOTA) AS faturamento,
                COUNT(DISTINCT CAB.NUNOTA) AS totalNotas,
                COUNT(DISTINCT CAB.CODPARC) AS totalClientes
              FROM TGFCAB CAB
              JOIN TGFVEN VEN ON CAB.CODVEND = VEN.CODVEND
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
                ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
              GROUP BY VEN.CODVEND, VEN.APELIDO
              ORDER BY faturamento DESC
              FETCH FIRST :limite ROWS ONLY
            `;
            break;

          case 'grupo':
            query = `
              SELECT
                GRU.CODGRUPOPROD,
                GRU.DESCRGRUPOPROD AS descricao,
                SUM(CAB.VLRNOTA) AS faturamento,
                COUNT(DISTINCT CAB.NUNOTA) AS totalNotas,
                COUNT(DISTINCT ITE.CODPROD) AS totalProdutos
              FROM TGFCAB CAB
              JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
              JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
              JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
                ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
              GROUP BY GRU.CODGRUPOPROD, GRU.DESCRGRUPOPROD
              ORDER BY faturamento DESC
              FETCH FIRST :limite ROWS ONLY
            `;
            break;

          case 'produto':
            query = `
              SELECT
                PRO.CODPROD,
                PRO.DESCRPROD AS descricao,
                SUM(ITE.QTDNEG) AS quantidade,
                SUM(ITE.QTDNEG * ITE.VLRUNIT) AS faturamento,
                COUNT(DISTINCT CAB.NUNOTA) AS totalNotas
              FROM TGFCAB CAB
              JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
              JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
                ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
              GROUP BY PRO.CODPROD, PRO.DESCRPROD
              ORDER BY faturamento DESC
              FETCH FIRST :limite ROWS ONLY
            `;
            break;
        }

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Comercial] Erro ao buscar vendas por dimensao:', error);
        throw error;
      }
    }),

  /**
   * Retorna funil de conversao (leads, oportunidades, vendas)
   */
  getFunilConversao: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            'Oportunidades' AS etapa,
            COUNT(DISTINCT CASE WHEN CAB.TIPMOV = 'P' THEN CAB.NUNOTA END) AS quantidade,
            SUM(CASE WHEN CAB.TIPMOV = 'P' THEN CAB.VLRNOTA ELSE 0 END) AS valor
          FROM TGFCAB CAB
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          UNION ALL
          SELECT
            'Vendas Fechadas' AS etapa,
            COUNT(DISTINCT CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN CAB.NUNOTA END) AS quantidade,
            SUM(CASE WHEN CAB.TIPMOV IN ('V', 'D') THEN CAB.VLRNOTA ELSE 0 END) AS valor
          FROM TGFCAB CAB
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
        `;

        const params = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Comercial] Erro ao buscar funil de conversao:', error);
        throw error;
      }
    }),

  /**
   * Retorna heatmap de vendas por dia da semana e hora
   */
  getHeatmapAtividades: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            TO_CHAR(CAB.DTNEG, 'D') AS diaSemana,
            TO_CHAR(CAB.DTNEG, 'YYYY-MM-DD') AS data,
            COUNT(DISTINCT CAB.NUNOTA) AS quantidade,
            SUM(CAB.VLRNOTA) AS faturamento
          FROM TGFCAB CAB
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY TO_CHAR(CAB.DTNEG, 'D'), TO_CHAR(CAB.DTNEG, 'YYYY-MM-DD')
          ORDER BY data ASC
        `;

        const params = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Comercial] Erro ao buscar heatmap de atividades:', error);
        throw error;
      }
    }),

  /**
   * Retorna analise de clientes por vendedor
   */
  getClientesPorVendedor: protectedProcedure
    .input(dateRangeSchema.extend({ codvend: z.number() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            PAR.CODPARC,
            PAR.RAZAOSOCIAL AS cliente,
            COUNT(DISTINCT CAB.NUNOTA) AS totalNotas,
            SUM(CAB.VLRNOTA) AS faturamento,
            MAX(CAB.DTNEG) AS ultimaCompra
          FROM TGFCAB CAB
          JOIN TGFPAR PAR ON CAB.CODPARC = PAR.CODPARC
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            AND CAB.CODVEND = :codvend
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY PAR.CODPARC, PAR.RAZAOSOCIAL
          ORDER BY faturamento DESC
        `;

        const params = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          codvend: input.codvend,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Comercial] Erro ao buscar clientes por vendedor:', error);
        throw error;
      }
    }),

  /**
   * Retorna analise de produtos mais vendidos
   */
  getProdutosMaisVendidos: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(20) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            PRO.CODPROD,
            PRO.DESCRPROD AS produto,
            PRO.MARCA,
            SUM(ITE.QTDNEG) AS quantidade,
            SUM(ITE.QTDNEG * ITE.VLRUNIT) AS faturamento,
            ROUND(SUM(ITE.QTDNEG * ITE.VLRUNIT) / SUM(ITE.QTDNEG), 2) AS precoMedio
          FROM TGFCAB CAB
          JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
          JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
          WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
            AND CAB.TIPMOV IN ('V', 'D')
            ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
          GROUP BY PRO.CODPROD, PRO.DESCRPROD, PRO.MARCA
          ORDER BY quantidade DESC
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
        console.error('[Comercial] Erro ao buscar produtos mais vendidos:', error);
        throw error;
      }
    }),
});
