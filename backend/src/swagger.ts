import { Hono } from 'hono'

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Dialog Chat API',
    version: '1.0.0'
  },
  servers: [
    { url: 'http://localhost:' + (process.env.PORT ?? 3000)+ '/api/' }
  ],
  paths: {
    '/api/detect-intent': {
      post: {
        summary: 'Detect intent via Dialogflow',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  sessionId: { type: 'string' },
                  languageCode: { type: 'string' }
                },
                required: ['text']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: { type: 'string' },
                    fulfillmentText: { type: 'string' },
                    confidence: { type: 'number' },
                    intentDisplayName: { type: ['string', 'null'] }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/chat/history/{sessionId}': {
      get: {
        summary: 'Get chat history for a session',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Session ID to retrieve chat history for'
          }
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string' },
                      text: { type: 'string' },
                      fulfillmentText: { type: 'string' },
                      intentDisplayName: { type: ['string', 'null'] },
                      confidence: { type: 'number' },
                      timestamp: { type: 'string', format: 'date-time' },
                      languageCode: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
} as const

export const swaggerRoutes = new Hono()

swaggerRoutes.get('/openapi.json', (c) => c.json(openApiSpec))

swaggerRoutes.get('/docs', (c) => c.html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis
        ]
      })
    </script>
  </body>
  </html>`))


