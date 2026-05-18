import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ERR } from '../lib/errors.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
import { seedIncomingForUser } from '../lib/seed.js'
import { toApiUser } from '../lib/user-mapper.js'

const zonesSchema = z.record(
  z.string(),
  z.object({
    lng: z.number(),
    lat: z.number(),
  }),
)

const registerExtrasSchema = z
  .object({
    countryOrigin: z.string().optional(),
    countryCurrent: z.string().optional(),
    cityIntent: z.string().optional(),
    userStatus: z.string().optional(),
    mbti: z.string().optional(),
    zones: zonesSchema.optional(),
    initialMood: z.string().optional(),
    dailyBudgetIndex: z.number().int().min(0).max(3).optional(),
    moodNote: z.string().optional(),
    budgetComfort: z.string().optional(),
    birthYear: z.number().int().nullable().optional(),
    routine: z.object({ slots: z.array(z.unknown()) }).optional(),
  })
  .optional()

const registerBodySchema = z.object({
  name: z.string().min(2),
  nickname: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(4),
  avatarUrl: z.string().nullable().optional(),
  extras: registerExtrasSchema,
})

const loginBodySchema = z.object({
  email: z.string().email(),
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

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const parsed = registerBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({
        code: 'VALIDATION_ERROR',
        message: parsed.error.flatten(),
      })
    }

    const { name, nickname, email, password, avatarUrl, extras } = parsed.data
    const normalizedEmail = email.trim().toLowerCase()

    if (nickname.trim().length < 2) {
      return sendErr(reply, ERR.nickTooShort())
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      return sendErr(reply, ERR.emailExists())
    }

    const passwordHash = await hashPassword(password)
    const row = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        nickname: nickname.trim(),
        avatarUrl: avatarUrl ?? null,
        moodNote: extras?.moodNote?.trim() ?? '',
        budgetComfort: extras?.budgetComfort ?? '',
        cityIntent: extras?.cityIntent?.trim() ?? '',
        mbti: extras?.mbti ?? '',
        countryOrigin: extras?.countryOrigin ?? '',
        countryCurrent: extras?.countryCurrent ?? '',
        userStatus: extras?.userStatus ?? '',
        zones: JSON.stringify(extras?.zones ?? {}),
        dailyBudgetIndex: extras?.dailyBudgetIndex ?? 1,
        initialMood: extras?.initialMood ?? '',
        birthYear: extras?.birthYear ?? null,
        routine: JSON.stringify(extras?.routine ?? { slots: [] }),
        settings: { create: {} },
      },
    })

    await seedIncomingForUser(row.id)

    const user = toApiUser(row)
    const token = await reply.jwtSign({ sub: row.id })
    return { token, user }
  })

  app.post('/login', async (request, reply) => {
    const parsed = loginBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({
        code: 'VALIDATION_ERROR',
        message: parsed.error.flatten(),
      })
    }

    const { email, password } = parsed.data
    const normalizedEmail = email.trim().toLowerCase()
    const row = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!row || !(await verifyPassword(password, row.passwordHash))) {
      return sendErr(reply, ERR.invalidCredentials())
    }

    const user = toApiUser(row)
    const token = await reply.jwtSign({ sub: row.id })
    return { token, user }
  })

  app.get(
    '/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub
      const row = await prisma.user.findUnique({ where: { id: userId } })
      if (!row) {
        return sendErr(reply, ERR.notFound())
      }
      return { user: toApiUser(row) }
    },
  )
}
