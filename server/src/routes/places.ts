import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const reviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
})

const prefBodySchema = z.object({
  value: z.enum(['like', 'dislike']).nullable(),
})

export async function placesRoutes(app: FastifyInstance) {
  app.get('/:placeId/reviews', async (request) => {
    const { placeId } = request.params as { placeId: string }
    const rows = await prisma.placeReview.findMany({
      where: { placeId },
      include: { user: { select: { nickname: true } } },
      orderBy: { at: 'desc' },
    })

    const reviews = rows.map((r) => ({
      id: r.id,
      placeId: r.placeId,
      userId: r.userId,
      nickname: r.user.nickname,
      rating: r.rating,
      text: r.text,
      at: r.at.getTime(),
    }))

    const avg =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
          ) / 10
        : null

    return { reviews, avg }
  })

  app.post(
    '/:placeId/reviews',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { placeId } = request.params as { placeId: string }
      const parsed = reviewBodySchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ code: 'VALIDATION_ERROR' })
      }

      const userId = request.user.sub
      const existing = await prisma.placeReview.findUnique({
        where: { userId_placeId: { userId, placeId } },
      })
      if (existing) {
        return reply.code(409).send({ code: 'ALREADY_REVIEWED' })
      }

      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return reply.code(404).send({ code: 'NOT_FOUND' })
      }

      const row = await prisma.placeReview.create({
        data: {
          placeId,
          userId,
          rating: parsed.data.rating,
          text: parsed.data.text.trim(),
        },
      })

      return {
        review: {
          id: row.id,
          placeId: row.placeId,
          userId: row.userId,
          nickname: user.nickname,
          rating: row.rating,
          text: row.text,
          at: row.at.getTime(),
        },
      }
    },
  )

  app.get(
    '/:placeId/preference',
    { preHandler: [app.authenticate] },
    async (request) => {
      const { placeId } = request.params as { placeId: string }
      const row = await prisma.placePreference.findUnique({
        where: {
          userId_placeId: {
            userId: request.user.sub,
            placeId,
          },
        },
      })
      return { value: row?.value ?? null }
    },
  )

  app.put(
    '/:placeId/preference',
    { preHandler: [app.authenticate] },
    async (request) => {
      const { placeId } = request.params as { placeId: string }
      const parsed = prefBodySchema.safeParse(request.body)
      if (!parsed.success) {
        return { value: null }
      }

      const userId = request.user.sub
      const { value } = parsed.data

      if (value === null) {
        await prisma.placePreference.deleteMany({
          where: { userId, placeId },
        })
        return { value: null }
      }

      await prisma.placePreference.upsert({
        where: { userId_placeId: { userId, placeId } },
        create: { userId, placeId, value },
        update: { value },
      })

      return { value }
    },
  )

  app.get(
    '/preferences/disliked',
    { preHandler: [app.authenticate] },
    async (request) => {
      const rows = await prisma.placePreference.findMany({
        where: { userId: request.user.sub, value: 'dislike' },
        select: { placeId: true },
      })
      return { ids: rows.map((r) => r.placeId) }
    },
  )

  app.get(
    '/preferences/liked',
    { preHandler: [app.authenticate] },
    async (request) => {
      const rows = await prisma.placePreference.findMany({
        where: { userId: request.user.sub, value: 'like' },
        select: { placeId: true },
      })
      return { ids: rows.map((r) => r.placeId) }
    },
  )
}
