import { Hono } from 'hono'

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Dialog Chat API',
    version: '1.0.0'
  },
  servers: [
    { url: 'http://localhost:' + (process.env.PORT ?? 3000) }
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
        dom_id: '#swagger-ui'
      })
    </script>
  </body>
  </html>`))


