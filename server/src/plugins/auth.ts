import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>
  }
}

export function registerAuthenticate(app: FastifyInstance) {
  app.decorate(
    'authenticate',
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch {
        reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })
      }
    },
  )
}
