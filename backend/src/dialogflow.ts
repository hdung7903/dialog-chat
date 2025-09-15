import dialogflow from '@google-cloud/dialogflow'
import { v4 as uuid } from 'uuid'

export type DetectIntentParams = {
  projectId: string
  sessionId?: string
  text: string
  languageCode?: string
}

export async function detectIntentText(params: DetectIntentParams) {
  const { projectId, text } = params
  const sessionId = params.sessionId ?? uuid()
  const languageCode = params.languageCode ?? 'en-US'

  const sessionClient = new dialogflow.SessionsClient()
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId)

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode
      }
    }
  } as const

  const [response] = await sessionClient.detectIntent(request)

  const fulfillmentText = response.queryResult?.fulfillmentText ?? ''
  const confidence = response.queryResult?.intentDetectionConfidence ?? 0
  const intentDisplayName = response.queryResult?.intent?.displayName ?? null

  return {
    sessionId,
    fulfillmentText,
    confidence,
    intentDisplayName,
    raw: response
  }
}


