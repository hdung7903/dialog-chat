import type { MiddlewareHandler } from 'hono'

export const errorMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    await next()
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
}


