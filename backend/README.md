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
MONGODB_URI=mongodb://localhost:27017/dialog-chat
```

3) MongoDB Setup

Ensure MongoDB is installed and running. The application will connect to MongoDB using the URI specified in the `.env` file.

4) Run dev server
```
npm run dev
```

Endpoints

- POST `/api/detect-intent`
  - body: `{ "text": string, "sessionId"?: string, "languageCode"?: string }`
  - returns: `{ "sessionId": string, "fulfillmentText": string, ... }`

- GET `/api/chat/history/{sessionId}`
  - returns: Array of chat messages for the specified session

Database Scripts

- Seed sample data: `npm run db:seed`
- Clear all data: `npm run db:clear`

Swagger / OpenAPI

- OpenAPI JSON: `GET /openapi.json`
- Swagger Documentation: `GET /docs`
- Swagger UI: `GET /docs`
