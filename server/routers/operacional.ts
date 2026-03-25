/**
 * Visao Operacional Router
 * 
 * Procedures para estoque, giro, alertas, Pareto
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { executeQuery } from '../oracle-helpers';

const dateRangeSchema = z.object({
  dataInicio: z.date(),
  dataFim: z.date(),
  codemp: z.number().optional(),
});

export const operacionalRouter = router({
  /**
   * Retorna analise de estoque com alertas
   */
  getEstoqueComAlertas: protectedProcedure
    .input(dateRangeSchema.extend({ limite: z.number().default(100) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            EST.CODPROD,
            PRO.DESCRPROD AS produto,
            PRO.MARCA,
            GRU.DESCRGRUPOPROD AS grupo,
            EST.ESTOQUE,
            EST.RESERVADO,
            (EST.ESTOQUE - EST.RESERVADO) AS disponivel,
            GIR.TAXA_GIRO AS taxaGiro,
            GIR.DIAS_COBERTURA AS diasCobertura,
            CASE
              WHEN GIR.DIAS_COBERTURA > 90 THEN 'PARADO'
              WHEN GIR.DIAS_COBERTURA < 10 THEN 'RUPTURA'
              ELSE 'NORMAL'
            END AS statusAlerta
          FROM TGFEST EST
          JOIN TGFPRO PRO ON EST.CODPROD = PRO.CODPROD
          JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
          LEFT JOIN TGFGIR GIR ON EST.CODPROD = GIR.CODPROD AND EST.CODEMP = GIR.CODEMP
          WHERE EST.ESTOQUE > 0
            ${input.codemp ? 'AND EST.CODEMP = :codemp' : ''}
          ORDER BY 
            CASE
              WHEN GIR.DIAS_COBERTURA > 90 THEN 1
              WHEN GIR.DIAS_COBERTURA < 10 THEN 2
              ELSE 3
            END ASC,
            GIR.DIAS_COBERTURA DESC
          FETCH FIRST :limite ROWS ONLY
        `;

        const params = {
          limite: input.limite,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Operacional] Erro ao buscar estoque com alertas:', error);
        throw error;
      }
    }),

  /**
   * Retorna produtos parados (mais de 90 dias)
   */
  getProdutosParados: protectedProcedure
    .input(dateRangeSchema.extend({ dias: z.number().default(90) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            EST.CODPROD,
            PRO.DESCRPROD AS produto,
            PRO.MARCA,
            EST.ESTOQUE,
            GIR.DIAS_COBERTURA AS diasParado,
            EST.ESTOQUE * CUS.CUSMED AS valorEstocado
          FROM TGFEST EST
          JOIN TGFPRO PRO ON EST.CODPROD = PRO.CODPROD
          LEFT JOIN TGFGIR GIR ON EST.CODPROD = GIR.CODPROD AND EST.CODEMP = GIR.CODEMP
          LEFT JOIN TGFCUS CUS ON EST.CODPROD = CUS.CODPROD AND EST.CODEMP = CUS.CODEMP
          WHERE EST.ESTOQUE > 0
            AND GIR.DIAS_COBERTURA > :dias
            ${input.codemp ? 'AND EST.CODEMP = :codemp' : ''}
          ORDER BY GIR.DIAS_COBERTURA DESC
        `;

        const params = {
          dias: input.dias,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Operacional] Erro ao buscar produtos parados:', error);
        throw error;
      }
    }),

  /**
   * Retorna produtos em risco de ruptura (menos de 10 dias)
   */
  getProdutosRuptura: protectedProcedure
    .input(dateRangeSchema.extend({ dias: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            EST.CODPROD,
            PRO.DESCRPROD AS produto,
            PRO.MARCA,
            EST.ESTOQUE,
            EST.RESERVADO,
            (EST.ESTOQUE - EST.RESERVADO) AS disponivel,
            GIR.DIAS_COBERTURA AS diasCobertura,
            ROUND(GIR.TAXA_GIRO, 2) AS taxaGiro
          FROM TGFEST EST
          JOIN TGFPRO PRO ON EST.CODPROD = PRO.CODPROD
          LEFT JOIN TGFGIR GIR ON EST.CODPROD = GIR.CODPROD AND EST.CODEMP = GIR.CODEMP
          WHERE GIR.DIAS_COBERTURA < :dias
            AND GIR.TAXA_GIRO > 0
            ${input.codemp ? 'AND EST.CODEMP = :codemp' : ''}
          ORDER BY GIR.DIAS_COBERTURA ASC
        `;

        const params = {
          dias: input.dias,
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Operacional] Erro ao buscar produtos em ruptura:', error);
        throw error;
      }
    }),

  /**
   * Retorna grafico de Pareto (80/20)
   */
  getPareto: protectedProcedure
    .input(dateRangeSchema.extend({ tipo: z.enum(['produto', 'cliente', 'vendedor']) }))
    .query(async ({ input }) => {
      try {
        let query = '';
        const params: any = {
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          ...(input.codemp && { codemp: input.codemp }),
        };

        switch (input.tipo) {
          case 'produto':
            query = `
              SELECT
                PRO.DESCRPROD AS descricao,
                SUM(ITE.QTDNEG * ITE.VLRUNIT) AS faturamento,
                ROUND(SUM(ITE.QTDNEG * ITE.VLRUNIT) / (SELECT SUM(QTDNEG * VLRUNIT) FROM TGFITE ITE2 JOIN TGFCAB CAB2 ON ITE2.NUNOTA = CAB2.NUNOTA WHERE CAB2.DTNEG BETWEEN :dataInicio AND :dataFim AND CAB2.TIPMOV IN ('V', 'D')) * 100, 2) AS percentual
              FROM TGFCAB CAB
              JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA
              JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
                ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
              GROUP BY PRO.DESCRPROD
              ORDER BY faturamento DESC
            `;
            break;

          case 'cliente':
            query = `
              SELECT
                PAR.RAZAOSOCIAL AS descricao,
                SUM(CAB.VLRNOTA) AS faturamento,
                ROUND(SUM(CAB.VLRNOTA) / (SELECT SUM(VLRNOTA) FROM TGFCAB WHERE DTNEG BETWEEN :dataInicio AND :dataFim AND TIPMOV IN ('V', 'D')) * 100, 2) AS percentual
              FROM TGFCAB CAB
              JOIN TGFPAR PAR ON CAB.CODPARC = PAR.CODPARC
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
                ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
              GROUP BY PAR.RAZAOSOCIAL
              ORDER BY faturamento DESC
            `;
            break;

          case 'vendedor':
            query = `
              SELECT
                VEN.APELIDO AS descricao,
                SUM(CAB.VLRNOTA) AS faturamento,
                ROUND(SUM(CAB.VLRNOTA) / (SELECT SUM(VLRNOTA) FROM TGFCAB WHERE DTNEG BETWEEN :dataInicio AND :dataFim AND TIPMOV IN ('V', 'D')) * 100, 2) AS percentual
              FROM TGFCAB CAB
              JOIN TGFVEN VEN ON CAB.CODVEND = VEN.CODVEND
              WHERE CAB.DTNEG BETWEEN :dataInicio AND :dataFim
                AND CAB.TIPMOV IN ('V', 'D')
                ${input.codemp ? 'AND CAB.CODEMP = :codemp' : ''}
              GROUP BY VEN.APELIDO
              ORDER BY faturamento DESC
            `;
            break;
        }

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Operacional] Erro ao buscar Pareto:', error);
        throw error;
      }
    }),

  /**
   * Retorna KPIs de estoque
   */
  getKPIsEstoque: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            COUNT(DISTINCT EST.CODPROD) AS totalProdutos,
            SUM(EST.ESTOQUE) AS totalEstoque,
            SUM(EST.ESTOQUE - EST.RESERVADO) AS totalDisponivel,
            SUM(EST.RESERVADO) AS totalReservado,
            COUNT(DISTINCT CASE WHEN GIR.DIAS_COBERTURA > 90 THEN EST.CODPROD END) AS produtosParados,
            COUNT(DISTINCT CASE WHEN GIR.DIAS_COBERTURA < 10 THEN EST.CODPROD END) AS produtosRuptura,
            ROUND(AVG(GIR.TAXA_GIRO), 2) AS mediaGiro,
            ROUND(AVG(GIR.DIAS_COBERTURA), 2) AS mediaCobertura
          FROM TGFEST EST
          LEFT JOIN TGFGIR GIR ON EST.CODPROD = GIR.CODPROD AND EST.CODEMP = GIR.CODEMP
          WHERE EST.ESTOQUE > 0
            ${input.codemp ? 'AND EST.CODEMP = :codemp' : ''}
        `;

        const params = {
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Operacional] Erro ao buscar KPIs de estoque:', error);
        throw error;
      }
    }),

  /**
   * Retorna analise de giro por marca
   */
  getGiroPorMarca: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            PRO.MARCA,
            COUNT(DISTINCT EST.CODPROD) AS totalProdutos,
            ROUND(AVG(GIR.TAXA_GIRO), 2) AS mediaGiro,
            ROUND(AVG(GIR.DIAS_COBERTURA), 2) AS mediaCobertura,
            SUM(EST.ESTOQUE) AS totalEstoque
          FROM TGFEST EST
          JOIN TGFPRO PRO ON EST.CODPROD = PRO.CODPROD
          LEFT JOIN TGFGIR GIR ON EST.CODPROD = GIR.CODPROD AND EST.CODEMP = GIR.CODEMP
          WHERE EST.ESTOQUE > 0
            ${input.codemp ? 'AND EST.CODEMP = :codemp' : ''}
          GROUP BY PRO.MARCA
          ORDER BY mediaGiro DESC
        `;

        const params = {
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Operacional] Erro ao buscar giro por marca:', error);
        throw error;
      }
    }),
});
