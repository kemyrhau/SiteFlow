import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc/trpc";
import { documentStatusSchema } from "@siteflow/shared";
import { isValidStatusTransition } from "@siteflow/shared";
import { TRPCError } from "@trpc/server";

export const oppgaveRouter = router({
  // Hent alle oppgaver for et prosjekt
  hentForProsjekt: publicProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        status: documentStatusSchema.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.task.findMany({
        where: {
          creatorEnterprise: { projectId: input.projectId },
          ...(input.status ? { status: input.status } : {}),
        },
        include: {
          template: true,
          creator: true,
          creatorEnterprise: true,
          responderEnterprise: true,
          _count: { select: { images: true, transfers: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    }),

  // Hent én oppgave med alle detaljer
  hentMedId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.task.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          creator: true,
          creatorEnterprise: true,
          responderEnterprise: true,
          drawing: true,
          images: true,
          transfers: {
            include: { sender: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  // Opprett ny oppgave
  opprett: protectedProcedure
    .input(
      z.object({
        creatorEnterpriseId: z.string().uuid(),
        responderEnterpriseId: z.string().uuid(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        dueDate: z.string().datetime().optional(),
        templateId: z.string().uuid().optional(),
        drawingId: z.string().uuid().optional(),
        positionX: z.number().min(0).max(100).optional(),
        positionY: z.number().min(0).max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        let nummer: number | undefined;

        if (input.templateId) {
          // Finn malens prefix for autonummerering
          const mal = await tx.reportTemplate.findUniqueOrThrow({
            where: { id: input.templateId },
            select: { prefix: true },
          });

          if (mal.prefix) {
            const maks = await tx.task.aggregate({
              where: {
                templateId: input.templateId,
                number: { not: null },
              },
              _max: { number: true },
            });
            nummer = (maks._max.number ?? 0) + 1;
          }
        }

        return tx.task.create({
          data: {
            templateId: input.templateId,
            creatorUserId: ctx.userId,
            creatorEnterpriseId: input.creatorEnterpriseId,
            responderEnterpriseId: input.responderEnterpriseId,
            title: input.title,
            description: input.description,
            priority: input.priority,
            number: nummer,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            drawingId: input.drawingId,
            positionX: input.positionX,
            positionY: input.positionY,
            status: "draft",
          },
        });
      });
    }),

  // Oppdater oppgave
  oppdater: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        dueDate: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.task.update({
        where: { id },
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });
    }),

  // Endre status
  endreStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nyStatus: documentStatusSchema,
        senderId: z.string().uuid(),
        kommentar: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const oppgave = await ctx.prisma.task.findUniqueOrThrow({
        where: { id: input.id },
      });

      if (!isValidStatusTransition(oppgave.status, input.nyStatus)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Ugyldig statusovergang fra "${oppgave.status}" til "${input.nyStatus}"`,
        });
      }

      return ctx.prisma.$transaction(async (tx) => {
        const oppdatert = await tx.task.update({
          where: { id: input.id },
          data: { status: input.nyStatus },
        });

        await tx.documentTransfer.create({
          data: {
            taskId: input.id,
            senderId: input.senderId,
            fromStatus: oppgave.status,
            toStatus: input.nyStatus,
            comment: input.kommentar,
          },
        });

        return oppdatert;
      });
    }),
});
