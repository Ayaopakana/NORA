import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ERR } from '../lib/errors.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
import { toPublicProfile } from '../lib/public-profile.js'
import { toApiUser } from '../lib/user-mapper.js'

const patchBodySchema = z
  .object({
    name: z.string().min(2).optional(),
    nickname: z.string().min(1).optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().nullable().optional(),
    avatarPrivacy: z.enum(['open', 'preview']).optional(),
    psychotypeId: z.string().optional(),
    moodNote: z.string().optional(),
    budgetComfort: z.string().optional(),
    cityIntent: z.string().optional(),
    mbti: z.string().optional(),
    countryOrigin: z.string().optional(),
    countryCurrent: z.string().optional(),
    userStatus: z.string().optional(),
    zones: z
      .record(
        z.string(),
        z.object({ lng: z.number(), lat: z.number() }),
      )
      .optional(),
    dailyBudgetIndex: z.number().int().min(0).max(3).optional(),
    initialMood: z.string().optional(),
    birthDay: z.number().int().min(1).max(31).nullable().optional(),
    birthMonth: z.number().int().min(1).max(12).nullable().optional(),
    birthYear: z.number().int().nullable().optional(),
    routine: z.object({ slots: z.array(z.unknown()) }).optional(),
  })
  .strict()

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(4),
})

const deleteAccountSchema = z.object({
  password: z.string().min(1),
})

function sendErr(
  reply: { code: (n: number) => { send: (b: unknown) => unknown } },
  err: ReturnType<typeof ERR.invalidCredentials>,
) {
  return reply.code(err.statusCode).send({
    code: err.code,
    message: err.message,
  })
}

const settingsSchema = z.object({
  pushEnabled: z.boolean().optional(),
  importantOnly: z.boolean().optional(),
})

export async function usersRoutes(app: FastifyInstance) {
  app.get('/search', async (request) => {
    const q = String((request.query as { q?: string }).q ?? '')
      .trim()
      .toLowerCase()
    const excludeId = (request.query as { exclude?: string }).exclude

    const users = await prisma.user.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      orderBy: { nickname: 'asc' },
      take: 80,
    })

    let profiles = users.map(toPublicProfile)
    if (q) {
      profiles = profiles.filter(
        (p) =>
          p.nickname.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.interests.some((i) => i.toLowerCase().includes(q)),
      )
    }

    return { profiles }
  })

  app.get('/:userId/profile', async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const row = await prisma.user.findUnique({ where: { id: userId } })
    if (!row) {
      return reply.code(404).send({ code: 'NOT_FOUND' })
    }
    return { profile: toPublicProfile(row) }
  })

  app.get(
    '/me/settings',
    { preHandler: [app.authenticate] },
    async (request) => {
      const row = await prisma.userSettings.findUnique({
        where: { userId: request.user.sub },
      })
      return {
        settings: {
          pushEnabled: row?.pushEnabled ?? true,
          importantOnly: row?.importantOnly ?? false,
        },
      }
    },
  )

  app.patch(
    '/me/settings',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = settingsSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ code: 'VALIDATION_ERROR' })
      }

      const userId = request.user.sub
      const patch = parsed.data
      const row = await prisma.userSettings.upsert({
        where: { userId },
        create: {
          userId,
          pushEnabled: patch.pushEnabled ?? true,
          importantOnly: patch.importantOnly ?? false,
        },
        update: {
          ...(patch.pushEnabled !== undefined
            ? { pushEnabled: patch.pushEnabled }
            : {}),
          ...(patch.importantOnly !== undefined
            ? { importantOnly: patch.importantOnly }
            : {}),
        },
      })

      return {
        settings: {
          pushEnabled: row.pushEnabled,
          importantOnly: row.importantOnly,
        },
      }
    },
  )

  app.patch(
    '/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = patchBodySchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: parsed.error.flatten(),
        })
      }

      const userId = request.user.sub
      const patch = parsed.data
      const data: Record<string, unknown> = {}

      if (patch.name !== undefined) data.name = patch.name.trim()
      if (patch.nickname !== undefined) data.nickname = patch.nickname.trim()
      if (patch.bio !== undefined) data.bio = patch.bio.trim()
      if (patch.avatarUrl !== undefined) data.avatarUrl = patch.avatarUrl
      if (patch.avatarPrivacy !== undefined) data.avatarPrivacy = patch.avatarPrivacy
      if (patch.psychotypeId !== undefined) data.psychotypeId = patch.psychotypeId
      if (patch.moodNote !== undefined) data.moodNote = patch.moodNote.trim()
      if (patch.budgetComfort !== undefined) data.budgetComfort = patch.budgetComfort
      if (patch.cityIntent !== undefined) data.cityIntent = patch.cityIntent.trim()
      if (patch.mbti !== undefined) data.mbti = patch.mbti
      if (patch.countryOrigin !== undefined) data.countryOrigin = patch.countryOrigin
      if (patch.countryCurrent !== undefined) data.countryCurrent = patch.countryCurrent
      if (patch.userStatus !== undefined) data.userStatus = patch.userStatus
      if (patch.zones !== undefined) data.zones = JSON.stringify(patch.zones)
      if (patch.dailyBudgetIndex !== undefined) {
        data.dailyBudgetIndex = patch.dailyBudgetIndex
      }
      if (patch.initialMood !== undefined) data.initialMood = patch.initialMood
      if (patch.birthDay !== undefined) data.birthDay = patch.birthDay
      if (patch.birthMonth !== undefined) data.birthMonth = patch.birthMonth
      if (patch.birthYear !== undefined) data.birthYear = patch.birthYear
      if (patch.routine !== undefined) data.routine = JSON.stringify(patch.routine)

      const row = await prisma.user.update({
        where: { id: userId },
        data,
      })

      return { user: toApiUser(row) }
    },
  )

  app.post(
    '/me/password',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = changePasswordSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: parsed.error.flatten(),
        })
      }

      const userId = request.user.sub
      const row = await prisma.user.findUnique({ where: { id: userId } })
      if (!row) {
        return sendErr(reply, ERR.notFound())
      }

      const { currentPassword, newPassword } = parsed.data
      if (!(await verifyPassword(currentPassword, row.passwordHash))) {
        return sendErr(reply, ERR.wrongPassword())
      }

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: await hashPassword(newPassword) },
      })

      return { ok: true }
    },
  )

  app.delete(
    '/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = deleteAccountSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: parsed.error.flatten(),
        })
      }

      const userId = request.user.sub
      const row = await prisma.user.findUnique({ where: { id: userId } })
      if (!row) {
        return sendErr(reply, ERR.notFound())
      }

      if (!(await verifyPassword(parsed.data.password, row.passwordHash))) {
        return sendErr(reply, ERR.wrongPassword())
      }

      await prisma.user.delete({ where: { id: userId } })
      return { ok: true }
    },
  )
}
