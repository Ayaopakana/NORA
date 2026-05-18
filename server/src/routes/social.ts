import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { toPublicProfile } from '../lib/public-profile.js'

const peerParamSchema = z.object({ peerId: z.string().min(1) })
const messageBodySchema = z.object({ text: z.string().min(1).max(4000) })

async function friendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: { userId },
    select: { friendId: true },
  })
  return rows.map((r) => r.friendId)
}

async function ensureChatWelcome(userId: string, peerId: string, peerNickname: string) {
  const count = await prisma.chatMessage.count({
    where: { userId, peerId },
  })
  if (count > 0) return

  await prisma.chatMessage.create({
    data: {
      userId,
      peerId,
      fromId: peerId,
      text: `Привет! Я ${peerNickname}. Рада знакомству через NORA 👋`,
    },
  })
}

export async function socialRoutes(app: FastifyInstance) {
  app.get(
    '/friends',
    { preHandler: [app.authenticate] },
    async (request) => {
      const ids = await friendIds(request.user.sub)
      return { ids }
    },
  )

  app.get(
    '/requests/outgoing',
    { preHandler: [app.authenticate] },
    async (request) => {
      const rows = await prisma.friendRequest.findMany({
        where: { fromId: request.user.sub },
        select: { toId: true },
      })
      return { ids: rows.map((r) => r.toId) }
    },
  )

  app.get(
    '/requests/incoming',
    { preHandler: [app.authenticate] },
    async (request) => {
      const rows = await prisma.friendRequest.findMany({
        where: { toId: request.user.sub },
        select: { fromId: true },
      })
      return { ids: rows.map((r) => r.fromId) }
    },
  )

  app.post(
    '/requests',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = z.object({ peerId: z.string() }).safeParse(request.body)
      if (!body.success) {
        return reply.code(400).send({ code: 'VALIDATION_ERROR' })
      }

      const userId = request.user.sub
      const { peerId } = body.data
      if (peerId === userId) {
        return reply.code(400).send({ code: 'INVALID_PEER' })
      }

      const peer = await prisma.user.findUnique({ where: { id: peerId } })
      if (!peer) {
        return reply.code(404).send({ code: 'NOT_FOUND', message: 'User not found' })
      }

      const already = await prisma.friendship.findUnique({
        where: { userId_friendId: { userId, friendId: peerId } },
      })
      if (already) {
        return reply.code(409).send({ code: 'ALREADY_FRIENDS' })
      }

      await prisma.friendRequest.upsert({
        where: { fromId_toId: { fromId: userId, toId: peerId } },
        create: { fromId: userId, toId: peerId },
        update: {},
      })

      return { ok: true }
    },
  )

  app.delete(
    '/requests/outgoing/:peerId',
    { preHandler: [app.authenticate] },
    async (request) => {
      const { peerId } = peerParamSchema.parse(request.params)
      await prisma.friendRequest.deleteMany({
        where: { fromId: request.user.sub, toId: peerId },
      })
      return { ok: true }
    },
  )

  app.post(
    '/requests/:peerId/accept',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { peerId } = peerParamSchema.parse(request.params)
      const userId = request.user.sub

      const req = await prisma.friendRequest.findFirst({
        where: { fromId: peerId, toId: userId },
      })
      if (!req) {
        return reply.code(404).send({ code: 'NOT_FOUND' })
      }

      const peer = await prisma.user.findUnique({ where: { id: peerId } })
      if (!peer) {
        return reply.code(404).send({ code: 'NOT_FOUND' })
      }

      const me = await prisma.user.findUnique({ where: { id: userId } })

      await prisma.$transaction([
        prisma.friendRequest.delete({ where: { id: req.id } }),
        prisma.friendRequest.deleteMany({
          where: {
            OR: [
              { fromId: userId, toId: peerId },
              { fromId: peerId, toId: userId },
            ],
          },
        }),
        prisma.friendship.upsert({
          where: { userId_friendId: { userId, friendId: peerId } },
          create: { userId, friendId: peerId },
          update: {},
        }),
        prisma.friendship.upsert({
          where: { userId_friendId: { userId: peerId, friendId: userId } },
          create: { userId: peerId, friendId: userId },
          update: {},
        }),
      ])

      await ensureChatWelcome(userId, peerId, peer.nickname)
      if (me) {
        await ensureChatWelcome(peerId, userId, me.nickname)
      }

      return { ok: true }
    },
  )

  app.post(
    '/requests/:peerId/reject',
    { preHandler: [app.authenticate] },
    async (request) => {
      const { peerId } = peerParamSchema.parse(request.params)
      await prisma.friendRequest.deleteMany({
        where: { fromId: peerId, toId: request.user.sub },
      })
      return { ok: true }
    },
  )

  app.delete(
    '/friends/:peerId',
    { preHandler: [app.authenticate] },
    async (request) => {
      const { peerId } = peerParamSchema.parse(request.params)
      const userId = request.user.sub
      await prisma.$transaction([
        prisma.friendship.deleteMany({
          where: {
            OR: [
              { userId, friendId: peerId },
              { userId: peerId, friendId: userId },
            ],
          },
        }),
        prisma.friendRequest.deleteMany({
          where: {
            OR: [
              { fromId: userId, toId: peerId },
              { fromId: peerId, toId: userId },
            ],
          },
        }),
      ])
      return { ok: true }
    },
  )

  app.get(
    '/chats',
    { preHandler: [app.authenticate] },
    async (request) => {
      const userId = request.user.sub
      const messages = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { at: 'asc' },
      })

      const byPeer = new Map<
        string,
        { peerId: string; messages: typeof messages }
      >()
      for (const m of messages) {
        let thread = byPeer.get(m.peerId)
        if (!thread) {
          thread = { peerId: m.peerId, messages: [] }
          byPeer.set(m.peerId, thread)
        }
        thread.messages.push(m)
      }

      const threads = [...byPeer.values()].map((t) => ({
        peerId: t.peerId,
        messages: t.messages.map((m) => ({
          id: m.id,
          fromId: m.fromId,
          text: m.text,
          at: m.at.getTime(),
        })),
      }))

      return { threads }
    },
  )

  app.get(
    '/chats/:peerId',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { peerId } = peerParamSchema.parse(request.params)
      const userId = request.user.sub
      const messages = await prisma.chatMessage.findMany({
        where: { userId, peerId },
        orderBy: { at: 'asc' },
      })
      if (!messages.length) {
        const peer = await prisma.user.findUnique({ where: { id: peerId } })
        if (!peer) {
          return reply.code(404).send({ code: 'NOT_FOUND' })
        }
        return { thread: { peerId, messages: [] } }
      }
      return {
        thread: {
          peerId,
          messages: messages.map((m) => ({
            id: m.id,
            fromId: m.fromId,
            text: m.text,
            at: m.at.getTime(),
          })),
        },
      }
    },
  )

  app.post(
    '/chats/:peerId/messages',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { peerId } = peerParamSchema.parse(request.params)
      const parsed = messageBodySchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ code: 'VALIDATION_ERROR' })
      }

      const userId = request.user.sub
      const text = parsed.data.text.trim()
      if (!text) {
        return reply.code(400).send({ code: 'EMPTY_MESSAGE' })
      }

      const peer = await prisma.user.findUnique({ where: { id: peerId } })
      if (!peer) {
        return reply.code(404).send({ code: 'NOT_FOUND' })
      }

      const isFriend = await prisma.friendship.findUnique({
        where: { userId_friendId: { userId, friendId: peerId } },
      })
      if (!isFriend) {
        return reply.code(403).send({ code: 'NOT_FRIENDS' })
      }

      const at = new Date()
      const [outgoing] = await prisma.$transaction([
        prisma.chatMessage.create({
          data: { userId, peerId, fromId: userId, text, at },
        }),
        prisma.chatMessage.create({
          data: { userId: peerId, peerId: userId, fromId: userId, text, at },
        }),
      ])

      return {
        message: {
          id: outgoing.id,
          fromId: outgoing.fromId,
          text: outgoing.text,
          at: outgoing.at.getTime(),
        },
      }
    },
  )
}
