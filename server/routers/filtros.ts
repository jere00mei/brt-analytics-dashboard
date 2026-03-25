/**
 * Filtros Hierarquicos Router
 * 
 * Procedures para retornar dados hierarquicos de filtros
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { executeQuery } from '../oracle-helpers';

export const filtrosRouter = router({
  /**
   * Retorna lista de empresas
   */
  getEmpresas: protectedProcedure.query(async () => {
    try {
      const query = `
        SELECT
          CODEMP AS codigo,
          RAZAOSOCIAL AS nome,
          CGC AS cnpj
        FROM TSIEMP
        WHERE ATIVO = 'S'
        ORDER BY RAZAOSOCIAL ASC
      `;

      return await executeQuery(query, {});
    } catch (error) {
      console.error('[Filtros] Erro ao buscar empresas:', error);
      throw error;
    }
  }),

  /**
   * Retorna lista de marcas
   */
  getMarcas: protectedProcedure
    .input(z.object({ codemp: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT DISTINCT
            PRO.MARCA AS codigo,
            PRO.MARCA AS nome
          FROM TGFPRO PRO
          WHERE PRO.MARCA IS NOT NULL
            AND PRO.MARCA != ''
          ORDER BY PRO.MARCA ASC
        `;

        return await executeQuery(query, {});
      } catch (error) {
        console.error('[Filtros] Erro ao buscar marcas:', error);
        throw error;
      }
    }),

  /**
   * Retorna lista de vendedores
   */
  getVendedores: protectedProcedure
    .input(z.object({ codemp: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            CODVEND AS codigo,
            APELIDO AS nome
          FROM TGFVEN
          WHERE ATIVO = 'S'
            ${input.codemp ? 'AND CODEMP = :codemp' : ''}
          ORDER BY APELIDO ASC
        `;

        const params = {
          ...(input.codemp && { codemp: input.codemp }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Filtros] Erro ao buscar vendedores:', error);
        throw error;
      }
    }),

  /**
   * Retorna lista de grupos de produtos
   */
  getGrupos: protectedProcedure.query(async () => {
    try {
      const query = `
        SELECT
          CODGRUPOPROD AS codigo,
          DESCRGRUPOPROD AS nome
        FROM TGFGRU
        WHERE ATIVO = 'S'
        ORDER BY DESCRGRUPOPROD ASC
      `;

      return await executeQuery(query, {});
    } catch (error) {
      console.error('[Filtros] Erro ao buscar grupos:', error);
      throw error;
    }
  }),

  /**
   * Retorna lista de produtos
   */
  getProdutos: protectedProcedure
    .input(
      z.object({
        codgrupoprod: z.number().optional(),
        marca: z.string().optional(),
        codemp: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            CODPROD AS codigo,
            DESCRPROD AS nome,
            MARCA,
            CODGRUPOPROD
          FROM TGFPRO
          WHERE ATIVO = 'S'
            ${input.codgrupoprod ? 'AND CODGRUPOPROD = :codgrupoprod' : ''}
            ${input.marca ? 'AND MARCA = :marca' : ''}
          ORDER BY DESCRPROD ASC
        `;

        const params = {
          ...(input.codgrupoprod && { codgrupoprod: input.codgrupoprod }),
          ...(input.marca && { marca: input.marca }),
        };

        return await executeQuery(query, params);
      } catch (error) {
        console.error('[Filtros] Erro ao buscar produtos:', error);
        throw error;
      }
    }),

  /**
   * Retorna lista de clientes
   */
  getClientes: protectedProcedure
    .input(z.object({ codvend: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT
            CODPARC AS codigo,
            RAZAOSOCIAL AS nome,
            NOMEPARC AS nomeFantasia
          FROM TGFPAR
          WHERE ATIVO = 'S'
            AND TIPPARC = 'C'
          ORDER BY RAZAOSOCIAL ASC
        `;

        return await executeQuery(query, {});
      } catch (error) {
        console.error('[Filtros] Erro ao buscar clientes:', error);
        throw error;
      }
    }),

  /**
   * Retorna estrutura hierarquica completa de filtros
   */
  getHierarquiaCompleta: protectedProcedure.query(async () => {
    try {
      const [empresas, marcas, vendedores, grupos, clientes] = await Promise.all([
        executeQuery(
          `SELECT CODEMP AS codigo, RAZAOSOCIAL AS nome FROM TSIEMP WHERE ATIVO = 'S' ORDER BY RAZAOSOCIAL`,
          {}
        ),
        executeQuery(
          `SELECT DISTINCT MARCA AS codigo, MARCA AS nome FROM TGFPRO WHERE MARCA IS NOT NULL ORDER BY MARCA`,
          {}
        ),
        executeQuery(
          `SELECT CODVEND AS codigo, APELIDO AS nome FROM TGFVEN WHERE ATIVO = 'S' ORDER BY APELIDO`,
          {}
        ),
        executeQuery(
          `SELECT CODGRUPOPROD AS codigo, DESCRGRUPOPROD AS nome FROM TGFGRU WHERE ATIVO = 'S' ORDER BY DESCRGRUPOPROD`,
          {}
        ),
        executeQuery(
          `SELECT CODPARC AS codigo, RAZAOSOCIAL AS nome FROM TGFPAR WHERE ATIVO = 'S' AND TIPPARC = 'C' ORDER BY RAZAOSOCIAL`,
          {}
        ),
      ]);

      return {
        empresas,
        marcas,
        vendedores,
        grupos,
        clientes,
      };
    } catch (error) {
      console.error('[Filtros] Erro ao buscar hierarquia completa:', error);
      throw error;
    }
  }),
});
