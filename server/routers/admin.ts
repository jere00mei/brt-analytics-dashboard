import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, userPermissions, dashboards, rolePermissions } from "../../drizzle/schema";
import { eq, and, like } from "drizzle-orm";

export const adminRouter = router({
  // ==================== USUÁRIOS ====================

  /**
   * Listar todos os usuários com paginação e busca
   */
  listUsers: adminProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        return {
          page: typeof obj.page === "number" ? obj.page : 1,
          limit: typeof obj.limit === "number" ? obj.limit : 10,
          search: typeof obj.search === "string" ? obj.search : "",
          role: typeof obj.role === "string" ? obj.role : "",
        };
      }
      return { page: 1, limit: 10, search: "", role: "" };
    })
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const offset = (input.page - 1) * input.limit;
      let query: any = db.select().from(users);

      if (input.search) {
        query = query.where(
          like(users.email, `%${input.search}%`)
        );
      }

      if (input.role) {
        query = query.where(eq(users.role, input.role as any));
      }

      const result = await query.limit(input.limit).offset(offset);
      const totalResult = await db.select().from(users);

      return {
        data: result,
        total: totalResult.length,
        page: input.page,
        limit: input.limit,
      };
    }),

  /**
   * Obter detalhes de um usuário com suas permissões
   */
  getUserWithPermissions: adminProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        return { userId: typeof obj.userId === "number" ? obj.userId : 0 };
      }
      return { userId: 0 };
    })
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      const permissions = await db
        .select()
        .from(userPermissions)
        .where(eq(userPermissions.userId, input.userId));

      return {
        user: user[0],
        permissions,
      };
    }),

  /**
   * Atualizar informações do usuário
   */
  updateUser: adminProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        return {
          userId: typeof obj.userId === "number" ? obj.userId : 0,
          name: typeof obj.name === "string" ? obj.name : "",
          email: typeof obj.email === "string" ? obj.email : "",
          role: typeof obj.role === "string" ? obj.role : "user",
        };
      }
      return { userId: 0, name: "", email: "", role: "user" };
    })
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const updated = await db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          role: input.role as any,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId));

      // Log de auditoria
      await db.insert(require("../../drizzle/schema").auditLog).values({
        userId: ctx.user.id,
        action: "UPDATE_USER",
        resource: `user_${input.userId}`,
        details: JSON.stringify({ name: input.name, email: input.email, role: input.role }),
      });

      return { success: true };
    }),

  /**
   * Deletar usuário
   */
  deleteUser: adminProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        return { userId: typeof obj.userId === "number" ? obj.userId : 0 };
      }
      return { userId: 0 };
    })
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Não permitir deletar o próprio usuário
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não pode deletar sua própria conta",
        });
      }

      // Deletar permissões do usuário
      await db
        .delete(userPermissions)
        .where(eq(userPermissions.userId, input.userId));

      // Deletar usuário
      await db.delete(users).where(eq(users.id, input.userId));

      // Log de auditoria
      await db.insert(require("../../drizzle/schema").auditLog).values({
        userId: ctx.user.id,
        action: "DELETE_USER",
        resource: `user_${input.userId}`,
        details: JSON.stringify({ deletedUserId: input.userId }),
      });

      return { success: true };
    }),

  // ==================== PERMISSÕES ====================

  /**
   * Obter todos os dashboards disponíveis
   */
  getDashboards: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(dashboards).where(eq(dashboards.isActive, "Y"));
  }),

  /**
   * Atualizar permissões de um usuário para um dashboard
   */
  updateUserPermission: adminProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        return {
          userId: typeof obj.userId === "number" ? obj.userId : 0,
          dashboardId: typeof obj.dashboardId === "number" ? obj.dashboardId : 0,
          canView: typeof obj.canView === "string" ? obj.canView : "Y",
          canEdit: typeof obj.canEdit === "string" ? obj.canEdit : "N",
          canDelete: typeof obj.canDelete === "string" ? obj.canDelete : "N",
          canExport: typeof obj.canExport === "string" ? obj.canExport : "N",
        };
      }
      return {
        userId: 0,
        dashboardId: 0,
        canView: "Y",
        canEdit: "N",
        canDelete: "N",
        canExport: "N",
      };
    })
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verificar se a permissão já existe
      const existing = await db
        .select()
        .from(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, input.userId),
            eq(userPermissions.dashboardId, input.dashboardId)
          )
        )
        .limit(1);

      if (existing.length) {
        // Atualizar permissão existente
        await db
          .update(userPermissions)
          .set({
            canView: input.canView as any,
            canEdit: input.canEdit as any,
            canDelete: input.canDelete as any,
            canExport: input.canExport as any,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userPermissions.userId, input.userId),
              eq(userPermissions.dashboardId, input.dashboardId)
            )
          );
      } else {
        // Criar nova permissão
        await db.insert(userPermissions).values({
          userId: input.userId,
          dashboardId: input.dashboardId,
          canView: input.canView as any,
          canEdit: input.canEdit as any,
          canDelete: input.canDelete as any,
          canExport: input.canExport as any,
          grantedBy: ctx.user.id,
        });
      }

      // Log de auditoria
      await db.insert(require("../../drizzle/schema").auditLog).values({
        userId: ctx.user.id,
        action: "UPDATE_PERMISSION",
        resource: `user_${input.userId}_dashboard_${input.dashboardId}`,
        details: JSON.stringify({
          canView: input.canView,
          canEdit: input.canEdit,
          canDelete: input.canDelete,
          canExport: input.canExport,
        }),
      });

      return { success: true };
    }),

  /**
   * Remover permissão de um usuário para um dashboard
   */
  removeUserPermission: adminProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        return {
          userId: typeof obj.userId === "number" ? obj.userId : 0,
          dashboardId: typeof obj.dashboardId === "number" ? obj.dashboardId : 0,
        };
      }
      return { userId: 0, dashboardId: 0 };
    })
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .delete(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, input.userId),
            eq(userPermissions.dashboardId, input.dashboardId)
          )
        );

      // Log de auditoria
      await db.insert(require("../../drizzle/schema").auditLog).values({
        userId: ctx.user.id,
        action: "REMOVE_PERMISSION",
        resource: `user_${input.userId}_dashboard_${input.dashboardId}`,
        details: JSON.stringify({ removedDashboard: input.dashboardId }),
      });

      return { success: true };
    }),

  /**
   * Obter permissões de um usuário para todos os dashboards
   */
  getUserDashboardPermissions: adminProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        return { userId: typeof obj.userId === "number" ? obj.userId : 0 };
      }
      return { userId: 0 };
    })
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const allDashboards = await db
        .select()
        .from(dashboards)
        .where(eq(dashboards.isActive, "Y"));

      const userPerms = await db
        .select()
        .from(userPermissions)
        .where(eq(userPermissions.userId, input.userId));

      return allDashboards.map((dashboard) => {
        const perm = userPerms.find((p) => p.dashboardId === dashboard.id);
        return {
          dashboard,
          permission: perm || null,
        };
      });
    }),

  /**
   * Obter log de auditoria
   */
  getAuditLog: adminProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        return {
          page: typeof obj.page === "number" ? obj.page : 1,
          limit: typeof obj.limit === "number" ? obj.limit : 50,
          action: typeof obj.action === "string" ? obj.action : "",
        };
      }
      return { page: 1, limit: 50, action: "" };
    })
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const offset = (input.page - 1) * input.limit;
      const auditLog = require("../../drizzle/schema").auditLog;

      let query: any = db.select().from(auditLog);

      if (input.action) {
        query = query.where(like(auditLog.action, `%${input.action}%`));
      }

      const result = await query
        .orderBy((col: any) => col.createdAt)
        .limit(input.limit)
        .offset(offset);

      const total = await db.select().from(auditLog);

      return {
        data: result,
        total: total.length,
        page: input.page,
        limit: input.limit,
      };
    }),
});
