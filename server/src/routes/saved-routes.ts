import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const MAX_ROUTES = 24

const saveBodySchema = z.object({
  route: z.record(z.unknown()),
})

export async function savedRoutesRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [app.authenticate] },
    async (request) => {
      const userId = request.user.sub
      const rows = await prisma.savedRoute.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: MAX_ROUTES,
      })
      const routes = rows
        .map((row) => {
          try {
            return JSON.parse(row.data) as Record<string, unknown>
          } catch {
            return null
          }
        })
        .filter((r): r is Record<string, unknown> => r !== null)
      return { routes }
    },
  )

  app.post(
    '/',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = saveBodySchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: parsed.error.flatten(),
        })
      }

      const userId = request.user.sub
      const route = parsed.data.route as Record<string, unknown>
      const routeId =
        typeof route.id === 'string' ? route.id : `route-${Date.now()}`

      const existing = await prisma.savedRoute.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      const duplicate = existing.some((row) => {
        try {
          const r = JSON.parse(row.data) as { stops?: { id: string }[] }
          const stops = route.stops as { id: string }[] | undefined
          if (!stops?.length || !r.stops?.length) return false
          if (stops.length !== r.stops.length) return false
          return stops.every((s, i) => s.id === r.stops![i]?.id)
        } catch {
          return false
        }
      })

      if (duplicate) {
        return reply.code(409).send({
          code: 'ROUTE_EXISTS',
          message: 'Route already saved',
        })
      }

      const payload = {
        ...route,
        id: routeId,
        savedAt: Date.now(),
      }

      const created = await prisma.savedRoute.create({
        data: {
          id: routeId,
          userId,
          data: JSON.stringify(payload),
        },
      })

      const overflow = await prisma.savedRoute.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: MAX_ROUTES,
        select: { id: true },
      })
      if (overflow.length) {
        await prisma.savedRoute.deleteMany({
          where: { id: { in: overflow.map((r) => r.id) } },
        })
      }

      return {
        route: JSON.parse(created.data) as Record<string, unknown>,
      }
    },
  )

  app.put(
    '/:routeId',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = saveBodySchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: parsed.error.flatten(),
        })
      }

      const { routeId } = request.params as { routeId: string }
      const userId = request.user.sub
      const route = parsed.data.route as Record<string, unknown>

      const row = await prisma.savedRoute.findFirst({
        where: { id: routeId, userId },
      })
      if (!row) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Route not found',
        })
      }

      let savedAt = Date.now()
      try {
        const prev = JSON.parse(row.data) as { savedAt?: number }
        if (typeof prev.savedAt === 'number') savedAt = prev.savedAt
      } catch {
        /* keep new savedAt */
      }

      const payload = {
        ...route,
        id: routeId,
        savedAt,
      }

      const updated = await prisma.savedRoute.update({
        where: { id: routeId },
        data: { data: JSON.stringify(payload) },
      })

      return {
        route: JSON.parse(updated.data) as Record<string, unknown>,
      }
    },
  )

  app.delete(
    '/:routeId',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { routeId } = request.params as { routeId: string }
      const userId = request.user.sub

      const row = await prisma.savedRoute.findFirst({
        where: { id: routeId, userId },
      })
      if (!row) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Route not found',
        })
      }

      await prisma.savedRoute.delete({ where: { id: routeId } })
      return { ok: true }
    },
  )
}
