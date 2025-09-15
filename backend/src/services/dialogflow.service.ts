import dialogflow from '@google-cloud/dialogflow'

export type DetectIntentInput = {
  projectId: string
  sessionId: string
  text: string
  languageCode?: string
}

export type DetectIntentOutput = {
  fulfillmentText: string
  confidence: number
  intentDisplayName: string | null
}

export class DialogflowService {
  private readonly client: dialogflow.SessionsClient

  constructor() {
    this.client = new dialogflow.SessionsClient()
  }

  async detectIntent(input: DetectIntentInput): Promise<DetectIntentOutput> {
    const languageCode = input.languageCode ?? 'en-US'
    const sessionPath = this.client.projectAgentSessionPath(input.projectId, input.sessionId)

    const [response] = await this.client.detectIntent({
      session: sessionPath,
      queryInput: {
        text: { text: input.text, languageCode }
      }
    })

    return {
      fulfillmentText: response.queryResult?.fulfillmentText ?? '',
      confidence: response.queryResult?.intentDetectionConfidence ?? 0,
      intentDisplayName: response.queryResult?.intent?.displayName ?? null
    }
  }
}


