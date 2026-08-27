# StartupET API Documentation

## Overview

The StartupET API is a RESTful API built with NestJS that provides endpoints for managing the Ethiopian startup ecosystem platform. The API follows a modular architecture with role-based access control.

**Base URL**: `http://localhost:3001/api` (development)
**Authentication**: JWT Bearer Token
**Content-Type**: `application/json`

## Authentication

All endpoints (except auth endpoints) require JWT authentication in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## User Roles

- **ADMIN**: Full system access
- **COMMITTEE**: Can review and assess applications
- **STARTUP**: Can manage own startup and applications
- **ECOSYSTEM_BUILDER**: Can manage ecosystem builder profile

---

## API Endpoints

### Authentication Module (`/api/auth`)

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "STARTUP"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "STARTUP"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "STARTUP"
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### POST `/api/auth/verify-email`
Verify email address with token.

**Request Body:**
```json
{
  "token": "verification_token"
}
```

#### POST `/api/auth/forgot-password`
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication).

#### POST `/api/auth/logout`
Logout user (requires authentication).

---

### Users Module (`/api/users`)

*Requires: ADMIN role for most operations*

#### GET `/api/users`
Get all users with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role

#### GET `/api/users/:id`
Get user by ID.

#### POST `/api/users`
Create new user (ADMIN only).

#### PATCH `/api/users/:id`
Update user (ADMIN only).

#### DELETE `/api/users/:id`
Delete user (ADMIN only).

---

### Startups Module (`/api/startups`)

#### GET `/api/startups`
Get all startups with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sector` (string): Filter by sector
- `stage` (string): Filter by stage

#### GET `/api/startups/sectors`
Get all available startup sectors.

#### GET `/api/startups/stages`
Get all available startup stages.

#### GET `/api/startups/my-startup`
Get current user's startup (requires authentication).

#### GET `/api/startups/:id`
Get startup by ID.

#### POST `/api/startups`
Create new startup.

**Request Body:**
```json
{
  "name": "Tech Startup Ethiopia",
  "description": "Description of startup",
  "foundedDate": "2023-01-01",
  "website": "https://example.com",
  "sector": "Technology",
  "stage": "Seed",
  "userId": "user_uuid"
}
```

#### PATCH `/api/startups/:id`
Update startup (owner or ADMIN only).

#### DELETE `/api/startups/:id`
Delete startup (ADMIN only).

---

### Applications Module (`/api/applications`)

#### GET `/api/applications`
Get applications with filtering.

**Query Parameters:**
- `startupId` (string): Filter by startup ID
- `status` (string): Filter by status (DRAFT, SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED)

#### GET `/api/applications/:id`
Get application by ID.

#### POST `/api/applications`
Create new application.

**Request Body:**
```json
{
  "startupId": "startup_uuid",
  "type": "CERTIFICATION",
  "status": "DRAFT",
  "data": {
    "companyInfo": {},
    "founderInfo": {},
    "productInfo": {}
  }
}
```

#### PATCH `/api/applications/:id`
Update application.

#### POST `/api/applications/:id/submit`
Submit application for review.

#### DELETE `/api/applications/:id`
Delete application.

---

### Assessments Module (`/api/assessments`)

*Requires: COMMITTEE or ADMIN role*

#### GET `/api/assessments`
Get assessments with filtering.

**Query Parameters:**
- `applicationId` (string): Filter by application ID
- `assessorId` (string): Filter by assessor ID

#### GET `/api/assessments/:id`
Get assessment by ID.

#### POST `/api/assessments`
Create new assessment.

**Request Body:**
```json
{
  "applicationId": "application_uuid",
  "assessorId": "assessor_uuid",
  "scores": {
    "criteria1": 8,
    "criteria2": 7,
    "criteria3": 9
  },
  "notes": "Assessment notes",
  "recommendation": "APPROVE"
}
```

#### PATCH `/api/assessments/:id`
Update assessment.

#### POST `/api/assessments/applications/:id/finalize`
Finalize assessment decision (ADMIN only).

**Request Body:**
```json
{
  "decision": "APPROVE",
  "notes": "Final decision notes"
}
```

#### DELETE `/api/assessments/:id`
Delete assessment.

---

### Documents Module (`/api/documents`)

#### GET `/api/documents`
Get documents with filtering.

**Query Parameters:**
- `startupId` (string): Filter by startup ID
- `applicationId` (string): Filter by application ID

#### GET `/api/documents/:id`
Get document by ID.

#### POST `/api/documents`
Upload new document.

**Request Body:**
```json
{
  "name": "Business Plan.pdf",
  "type": "BUSINESS_PLAN",
  "path": "/documents/path/to/file.pdf",
  "startupId": "startup_uuid"
}
```

#### PATCH `/api/documents/:id`
Update document metadata.

#### POST `/api/documents/:id/applications/:applicationId`
Associate document with application.

#### DELETE `/api/documents/:id/applications/:applicationId`
Remove document from application.

#### DELETE `/api/documents/:id`
Delete document.

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Data Models

### User
```json
{
  "id": "uuid",
  "email": "string",
  "fullName": "string",
  "role": "ADMIN|COMMITTEE|STARTUP|ECOSYSTEM_BUILDER",
  "organization": "string",
  "phoneNumber": "string",
  "position": "string",
  "emailVerified": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Startup
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "foundedDate": "datetime",
  "website": "string",
  "logo": "string",
  "sector": "string",
  "stage": "string",
  "userId": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Application
```json
{
  "id": "uuid",
  "startupId": "uuid",
  "type": "string",
  "status": "DRAFT|SUBMITTED|UNDER_REVIEW|ACCEPTED|REJECTED",
  "data": "object",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Assessment
```json
{
  "id": "uuid",
  "applicationId": "uuid",
  "assessorId": "uuid",
  "scores": "object",
  "notes": "string",
  "recommendation": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Document
```json
{
  "id": "uuid",
  "name": "string",
  "type": "string",
  "path": "string",
  "startupId": "uuid",
  "applicationId": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production.

## CORS

The API supports CORS with the following configuration:
- Origin: Configured via `CORS_ORIGIN` environment variable
- Methods: GET, HEAD, PUT, PATCH, POST, DELETE
- Credentials: Supported

## Environment Variables

Required environment variables for the API:

```bash
# Server
PORT=3001
NODE_ENV=development
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d
```

## Development Setup

1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Configure environment variables
4. Generate Prisma client: `npm run prisma:generate`
5. Run database migrations: `npm run prisma:migrate`
6. Start development server: `npm run dev`

## Testing

Run tests with: `npm run test`

## Support

For API support and questions, please refer to the project documentation or create an issue in the repository.
