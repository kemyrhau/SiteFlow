import { z } from "zod";
import crypto from "crypto";
import { router, publicProcedure } from "../trpc/trpc";
import {
  STANDARD_PROJECT_GROUPS,
  createProjectGroupSchema,
  updateProjectGroupSchema,
  addGroupMemberByEmailSchema,
} from "@siteflow/shared";
import { sendInvitasjonsEpost } from "../services/epost";

export const gruppeRouter = router({
  // Hent alle grupper for et prosjekt med medlemmer
  hentForProsjekt: publicProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.projectGroup.findMany({
        where: { projectId: input.projectId },
        include: {
          members: {
            include: {
              projectMember: {
                include: {
                  user: true,
                  enterprise: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Idempotent opprettelse av standardgrupper
  opprettStandardgrupper: publicProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const opprettet = [];

      for (const gruppe of STANDARD_PROJECT_GROUPS) {
        const eksisterende = await ctx.prisma.projectGroup.findUnique({
          where: {
            projectId_slug: {
              projectId: input.projectId,
              slug: gruppe.slug,
            },
          },
        });

        if (!eksisterende) {
          const ny = await ctx.prisma.projectGroup.create({
            data: {
              projectId: input.projectId,
              name: gruppe.name,
              slug: gruppe.slug,
              category: gruppe.category,
              permissions: gruppe.permissions,
              isDefault: true,
            },
          });
          opprettet.push(ny);
        }
      }

      return opprettet;
    }),

  // Opprett egendefinert gruppe
  opprett: publicProcedure
    .input(createProjectGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const slug =
        input.slug ??
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9æøå]+/g, "-")
          .replace(/^-|-$/g, "");

      return ctx.prisma.projectGroup.create({
        data: {
          projectId: input.projectId,
          name: input.name,
          slug,
          category: input.category,
          permissions: [],
          isDefault: false,
        },
        include: {
          members: {
            include: {
              projectMember: {
                include: { user: true, enterprise: true },
              },
            },
          },
        },
      });
    }),

  // Oppdater gruppenavn
  oppdater: publicProcedure
    .input(updateProjectGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.projectGroup.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  // Slett gruppe (kun egendefinerte, ikke isDefault)
  slett: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const gruppe = await ctx.prisma.projectGroup.findUniqueOrThrow({
        where: { id: input.id },
      });

      if (gruppe.isDefault) {
        throw new Error("Kan ikke slette standardgrupper");
      }

      return ctx.prisma.projectGroup.delete({
        where: { id: input.id },
      });
    }),

  // Legg til medlem: finn/opprett bruker → finn/opprett ProjectMember → upsert GroupMember
  leggTilMedlem: publicProcedure
    .input(addGroupMemberByEmailSchema)
    .mutation(async ({ ctx, input }) => {
      // Finn eller opprett bruker
      let user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            name: `${input.firstName} ${input.lastName}`,
            phone: input.phone,
          },
        });
      } else if (!user.name) {
        user = await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            name: `${input.firstName} ${input.lastName}`,
            phone: input.phone ?? user.phone,
          },
        });
      }

      // Finn eller opprett ProjectMember
      let projectMember = await ctx.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: input.projectId,
          },
        },
      });

      if (!projectMember) {
        projectMember = await ctx.prisma.projectMember.create({
          data: {
            userId: user.id,
            projectId: input.projectId,
            role: "member",
          },
        });
      }

      // Upsert GroupMember
      const gruppeMedlem = await ctx.prisma.projectGroupMember.upsert({
        where: {
          groupId_projectMemberId: {
            groupId: input.groupId,
            projectMemberId: projectMember.id,
          },
        },
        update: {},
        create: {
          groupId: input.groupId,
          projectMemberId: projectMember.id,
        },
        include: {
          projectMember: {
            include: { user: true, enterprise: true },
          },
        },
      });

      // Send invitasjons-e-post hvis brukeren ikke har logget inn (ingen Account)
      const harKonto = await ctx.prisma.account.findFirst({
        where: { userId: user.id },
      });

      if (!harKonto && ctx.userId) {
        try {
          const token = crypto.randomBytes(32).toString("base64url");
          const utloper = new Date();
          utloper.setDate(utloper.getDate() + 7);

          const prosjekt = await ctx.prisma.project.findUniqueOrThrow({
            where: { id: input.projectId },
            select: { name: true },
          });

          const inviterer = await ctx.prisma.user.findUniqueOrThrow({
            where: { id: ctx.userId },
            select: { name: true },
          });

          // Sjekk om det allerede finnes en ventende invitasjon for denne e-posten og prosjektet
          const eksisterendeInvitasjon = await ctx.prisma.projectInvitation.findFirst({
            where: {
              email: user.email,
              projectId: input.projectId,
              status: "pending",
            },
          });

          if (!eksisterendeInvitasjon) {
            await ctx.prisma.projectInvitation.create({
              data: {
                email: user.email,
                token,
                projectId: input.projectId,
                role: "member",
                groupId: input.groupId,
                invitedByUserId: ctx.userId,
                expiresAt: utloper,
              },
            });

            await sendInvitasjonsEpost({
              til: user.email,
              invitasjonstoken: token,
              prosjektNavn: prosjekt.name,
              invitertAvNavn: inviterer.name ?? "En kollega",
            });
          }
        } catch (error) {
          console.error("Kunne ikke sende invitasjons-e-post:", error);
        }
      }

      return gruppeMedlem;
    }),

  // Fjern medlem fra gruppe
  fjernMedlem: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.projectGroupMember.delete({
        where: { id: input.id },
      });
    }),
});
