import { Hono } from 'hono'
import { detectIntentController } from '../controllers/dialogflow.controller.js'
import { swaggerRoutes } from '../swagger.js'

export const routes = new Hono()

routes.get('/', (c) => c.text('OK'))
routes.post('/api/detect-intent', detectIntentController)
routes.route('/', swaggerRoutes)


