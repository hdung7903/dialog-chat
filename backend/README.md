Setup

1) Install dependencies
```
npm install
```

2) Configure environment

Create a `.env` file with:
```
DIALOGFLOW_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=absolute-path-to-service-account.json
PORT=3000
```

3) Run dev server
```
npm run dev
```

Endpoints

- POST `/api/detect-intent`
  - body: `{ "text": string, "sessionId"?: string, "languageCode"?: string }`
  - returns: `{ "sessionId": string, "fulfillmentText": string, ... }`

Swagger / OpenAPI

- OpenAPI JSON: `GET /openapi.json`
- Swagger UI: `GET /docs`
