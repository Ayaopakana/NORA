import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import Fastify from 'fastify'
import { registerAuthenticate } from './plugins/auth.js'
import { ensureSeedData } from './lib/seed.js'
import { authRoutes } from './routes/auth.js'
import { healthRoutes } from './routes/health.js'
import { placesRoutes } from './routes/places.js'
import { savedRoutesRoutes } from './routes/saved-routes.js'
import { socialRoutes } from './routes/social.js'
import { usersRoutes } from './routes/users.js'
import { mapRoutes } from './routes/map.js'

const PORT = Number(process.env.PORT) || 3001
const JWT_SECRET = process.env.JWT_SECRET ?? 'nora-dev-secret-change-me'
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',')
  .map((s) => s.trim())
  .filter(Boolean)

async function main() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: CORS_ORIGINS?.length ? CORS_ORIGINS : true,
    credentials: true,
  })

  await app.register(jwt, { secret: JWT_SECRET })
  registerAuthenticate(app)

  await ensureSeedData()

  await app.register(healthRoutes)
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(usersRoutes, { prefix: '/users' })
  await app.register(savedRoutesRoutes, { prefix: '/routes' })
  await app.register(socialRoutes, { prefix: '/social' })
  await app.register(placesRoutes, { prefix: '/places' })
  await app.register(mapRoutes)

  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`NORA API http://localhost:${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
