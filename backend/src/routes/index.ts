import { Hono } from 'hono'
import { swaggerRoutes } from '../swagger.js'
import { chatRoutes } from './chat.route.js'
import { dialogRoutes } from './dialog.route.js'
import { authRoutes } from './auth.route.js'
import { googleAuthRoutes } from './google-auth.route.js'

export const routes = new Hono()

routes.get('/', (c) => c.text('OK'))
// Mount Swagger routes directly at the root level for better visibility
routes.route('/', swaggerRoutes)
// Mount chat routes
routes.route('/api/chat', chatRoutes)
// Mount dialog routes
routes.route('/api', dialogRoutes)
// Mount auth routes
routes.route('/api/auth', authRoutes)
// Mount Google auth routes
routes.route('/api/auth', googleAuthRoutes)

