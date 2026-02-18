# Backend Setup (Firebase)

## 1. Configure Firebase credentials

Copy `.env.example` to `.env` and set one of these:

- `FIREBASE_SERVICE_ACCOUNT_PATH` to your service account JSON file path
- OR inline `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

## 2. Start API server

```bash
npm run start:api
```

The API runs on `http://localhost:3001`.

## 3. Start Angular app

```bash
npm start
```

The frontend calls the API at `http://localhost:3001/api`.

## Implemented endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/transactions/:userId`
- `POST /api/transactions/:userId`
- `PUT /api/transactions/:userId/:transactionId`
- `DELETE /api/transactions/:userId/:transactionId`
