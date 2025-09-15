import { cors } from 'hono/cors'
import type { MiddlewareHandler } from 'hono'

export const corsMiddleware: MiddlewareHandler = cors()

