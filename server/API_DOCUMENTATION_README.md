# DLT TalentHub API Documentation

## Overview

This directory contains the complete OpenAPI 3.0 specification and Swagger documentation for the DLT TalentHub API. The documentation is designed to be comprehensive, interactive, and easy to use.

## Files Structure

```
server/
├── swagger.yaml              # Complete OpenAPI 3.0 specification
├── swagger-config.js         # Swagger configuration and setup
├── public/
│   └── index.html           # Landing page for API documentation
└── API_DOCUMENTATION_README.md  # This file
```

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Talent, Recruiter, Admin)
- Token refresh mechanism
- Password reset functionality

### 👥 User Management
- User registration and profile management
- Avatar upload and management
- User search and filtering
- Role-based permissions

### 💼 Job Management
- Create, read, update, delete job postings
- Job search with advanced filtering
- Job applications and status management
- Featured and urgent job highlighting

### 🎯 Talent Management
- Comprehensive talent profiles
- Skills and experience tracking
- CV upload and management
- Advanced talent search and matching

### 📊 Recruiter Dashboard
- Job posting management
- Application tracking
- Talent search for specific jobs
- Statistics and analytics

### 🔧 Admin Panel
- User management and moderation
- Job moderation and approval
- System statistics and metrics
- Platform-wide notifications

### 🔔 Notifications
- Real-time notification system
- Notification management
- Read/unread status tracking

## API Endpoints

### System Endpoints
- `GET /health` - Health check endpoint

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user profile

### User Management Endpoints
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload avatar
- `DELETE /api/users/avatar` - Delete avatar
- `GET /api/users/search` - Search users
- `GET /api/users/{userId}` - Get user by ID

### Talent Endpoints
- `GET /api/talents/profile` - Get talent profile
- `PUT /api/talents/profile` - Update talent profile
- `POST /api/talents/cv` - Upload CV
- `DELETE /api/talents/cv` - Delete CV
- `GET /api/talents/search` - Search talents
- `GET /api/talents/skills/{skillName}` - Find talents by skill
- `GET /api/talents/available` - Get available talents
- `GET /api/talents/{talentId}` - Get talent by ID

### Recruiter Endpoints
- `GET /api/recruiters/dashboard` - Get recruiter dashboard
- `GET /api/recruiters/jobs` - Get recruiter's jobs
- `GET /api/recruiters/applications` - Get applications
- `GET /api/recruiters/stats` - Get recruiter statistics
- `GET /api/recruiters/search-talents` - Search talents for job

### Job Endpoints
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/search` - Search jobs
- `GET /api/jobs/category/{category}` - Get jobs by category
- `GET /api/jobs/urgent` - Get urgent jobs
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/{jobId}` - Get job by ID
- `PUT /api/jobs/{jobId}` - Update job
- `DELETE /api/jobs/{jobId}` - Delete job
- `POST /api/jobs/{jobId}/apply` - Apply to job
- `GET /api/jobs/{jobId}/applications` - Get job applications
- `PUT /api/jobs/applications/{applicationId}/status` - Update application status

### Admin Endpoints
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{userId}/status` - Update user status
- `DELETE /api/admin/users/{userId}` - Delete user
- `GET /api/admin/jobs` - Get all jobs
- `PUT /api/admin/jobs/{jobId}/status` - Update job status
- `DELETE /api/admin/jobs/{jobId}` - Delete job
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/metrics` - Get system metrics
- `GET /api/admin/notifications` - Get system notifications

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/{notificationId}/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/{notificationId}` - Delete notification

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for database)

### Installation

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/talenthub
   JWT_SECRET=your-jwt-secret-key
   JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

### Accessing the Documentation

1. **Main Documentation Portal**
   - URL: `http://localhost:5000`
   - Features: Landing page with links to documentation

2. **Swagger UI Documentation**
   - URL: `http://localhost:5000/api-docs`
   - Features: Interactive API documentation with testing capabilities

3. **OpenAPI Specification**
   - URL: `http://localhost:5000/api-docs.json`
   - Features: Raw OpenAPI 3.0 specification in JSON format

## Authentication

### JWT Token Usage
Most endpoints require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token
1. Register a new user: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Use the returned `accessToken` in subsequent requests

### Token Refresh
When the access token expires, use the refresh token:
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<your-refresh-token>"
}
```

## Rate Limiting

The API implements rate limiting:
- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers
- **Exceeded**: Returns 429 Too Many Requests status

## Error Handling

All error responses follow a consistent format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Testing the API

### Using Swagger UI
1. Navigate to `http://localhost:5000/api-docs`
2. Click "Authorize" and enter your JWT token
3. Explore endpoints and test them directly from the UI

### Using Postman
1. Import the OpenAPI specification from `/api-docs.json`
2. Set up environment variables for base URL and tokens
3. Use the collection to test all endpoints

### Using curl
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "talent"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Use token for authenticated requests
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Development

### Adding New Endpoints
1. Add the endpoint to the appropriate route file
2. Add OpenAPI documentation comments above the route
3. Update the `swagger.yaml` file if needed
4. Test the endpoint in Swagger UI

### Updating Documentation
1. Modify the `swagger.yaml` file for schema changes
2. Update route comments for endpoint changes
3. Test the documentation in Swagger UI
4. Update this README if needed

## Support

For questions or issues with the API documentation:
- Email: support@dlt-talenthub.com
- GitHub Issues: [Repository Issues](https://github.com/dlt-talenthub/issues)

## License

This API documentation is licensed under the MIT License. See the LICENSE file for details. 