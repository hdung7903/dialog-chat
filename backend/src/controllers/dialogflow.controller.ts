import type { Context } from 'hono'
import { DialogflowService } from '../services/dialogflow.service.js'

const service = new DialogflowService()

export async function detectIntentController(c: Context) {
  const projectId = process.env.DIALOGFLOW_PROJECT_ID
  if (!projectId) {
    return c.json({ error: 'DIALOGFLOW_PROJECT_ID not set' }, 500)
  }

  const body = await c.req.json<{ text: string; sessionId?: string; languageCode?: string }>()
  if (!body?.text) {
    return c.json({ error: 'text is required' }, 400)
  }

  const sessionId = body.sessionId || crypto.randomUUID()

  const data = await service.detectIntent({
    projectId,
    sessionId,
    text: body.text,
    languageCode: body.languageCode
  })

  return c.json({ sessionId, ...data })
}


