# DLT TalentHub API Testing Guide

## Overview

This guide provides comprehensive instructions for testing the DLT TalentHub API endpoints. It includes setup instructions, testing scenarios, and best practices.

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (local or Atlas)
3. **Postman** or similar API testing tool
4. **Server running** on `http://localhost:5000`

## Setup Instructions

### 1. Environment Setup

Create a `.env` file in the server directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/dlt-talenthub
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dlt-talenthub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@dlt-talenthub.com

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Start the Server

```bash
npm run dev
```

## Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Select the `DLT_TalentHub_API.postman_collection.json` file
4. Set up environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (will be set after login)

### Authentication Flow

#### 1. Register a New User

**Request:**
```http
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "role": "talent"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "talent",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User

**Request:**
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "talent"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Set Token Variable

After login, copy the token from the response and set it as the `token` variable in Postman.

## Testing Scenarios

### Scenario 1: Talent Profile Management

#### 1.1 Update Talent Profile

**Request:**
```http
PUT {{baseUrl}}/talents/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "skills": [
    {
      "name": "Solidity",
      "level": "advanced",
      "yearsOfExperience": 2
    },
    {
      "name": "React",
      "level": "intermediate",
      "yearsOfExperience": 1
    }
  ],
  "experience": [
    {
      "title": "Smart Contract Developer",
      "company": "DeFi Startup",
      "startDate": "2021-01-01",
      "endDate": "2023-01-01",
      "description": "Built DeFi protocols and smart contracts"
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "institution": "University of Lagos",
      "fieldOfStudy": "Computer Science",
      "startDate": "2016-09-01",
      "endDate": "2020-06-01"
    }
  ],
  "availability": {
    "status": "available",
    "startDate": "2023-08-01"
  },
  "salary": {
    "min": 60000,
    "max": 90000,
    "currency": "USD"
  }
}
```

#### 1.2 Upload CV

**Request:**
```http
POST {{baseUrl}}/talents/cv
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

cv: [Select PDF file]
```

### Scenario 2: Job Management

#### 2.1 Create Job (Recruiter)

First, register as a recruiter:

```http
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@cryptocorp.com",
  "password": "SecurePassword123!",
  "role": "recruiter"
}
```

Then create a job:

**Request:**
```http
POST {{baseUrl}}/jobs
Authorization: Bearer {{recruiter_token}}
Content-Type: application/json

{
  "title": "Senior Blockchain Developer",
  "description": "We are looking for an experienced blockchain developer to join our team. You will be responsible for developing smart contracts and DeFi protocols.",
  "company": {
    "name": "CryptoCorp",
    "logo": "https://cloudinary.com/logo.png",
    "website": "https://cryptocorp.com"
  },
  "type": "full-time",
  "category": "Development",
  "location": {
    "type": "remote",
    "address": "Remote"
  },
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "skills": ["Solidity", "React", "Node.js", "Web3.js"],
  "requirements": [
    "5+ years of blockchain development experience",
    "Experience with DeFi protocols",
    "Strong knowledge of smart contract security",
    "Experience with Ethereum and other blockchains"
  ]
}
```

#### 2.2 Apply to Job (Talent)

**Request:**
```http
POST {{baseUrl}}/jobs/{{job_id}}/apply
Authorization: Bearer {{talent_token}}
Content-Type: application/json

{
  "coverLetter": "I am excited to apply for the Senior Blockchain Developer position at CryptoCorp. With my 2+ years of experience in Solidity development and passion for DeFi, I believe I would be a great fit for your team.",
  "expectedSalary": {
    "amount": 90000,
    "currency": "USD"
  },
  "availability": {
    "startDate": "2023-08-01",
    "noticePeriod": "2 weeks"
  }
}
```

### Scenario 3: Search and Discovery

#### 3.1 Search Talents

**Request:**
```http
GET {{baseUrl}}/talents/search?q=blockchain&skills=solidity,react&location=lagos&availability=available&page=1&limit=10
```

#### 3.2 Search Jobs

**Request:**
```http
GET {{baseUrl}}/jobs/search?q=blockchain&category=Development&type=full-time&location=remote&page=1&limit=10
```

### Scenario 4: Admin Operations

#### 4.1 Get Admin Dashboard

First, register as an admin or update a user to admin role in the database.

**Request:**
```http
GET {{baseUrl}}/admin/dashboard
Authorization: Bearer {{admin_token}}
```

#### 4.2 Get All Users

**Request:**
```http
GET {{baseUrl}}/admin/users?role=talent&status=active&page=1&limit=10
Authorization: Bearer {{admin_token}}
```

## Error Testing

### 1. Invalid Authentication

**Request:**
```http
GET {{baseUrl}}/auth/me
Authorization: Bearer invalid-token
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Invalid token"
}
```

### 2. Missing Required Fields

**Request:**
```http
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "email": "john.doe@example.com"
}
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "lastName",
      "message": "Last name is required"
    },
    {
      "field": "password",
      "message": "Password is required"
    }
  ]
}
```

### 3. Rate Limiting

Make 101 requests within 15 minutes to test rate limiting.

**Expected Response:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## File Upload Testing

### 1. Avatar Upload

**Request:**
```http
POST {{baseUrl}}/users/avatar
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

avatar: [Select image file - JPG, PNG, max 5MB]
```

### 2. CV Upload

**Request:**
```http
POST {{baseUrl}}/talents/cv
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

cv: [Select document file - PDF, DOC, max 5MB]
```

## Performance Testing

### 1. Load Testing

Use tools like Apache Bench or Artillery:

```bash
# Test 100 concurrent requests
ab -n 100 -c 10 http://localhost:5000/api/jobs

# Test with authentication
ab -n 100 -c 10 -H "Authorization: Bearer {{token}}" http://localhost:5000/api/talents/profile
```

### 2. Database Performance

Monitor MongoDB performance during heavy operations:

```bash
# Check MongoDB stats
mongo --eval "db.stats()"
```

## Security Testing

### 1. SQL Injection Prevention

**Request:**
```http
GET {{baseUrl}}/talents/search?q="; DROP TABLE users; --
```

**Expected:** Should not execute malicious SQL

### 2. XSS Prevention

**Request:**
```http
POST {{baseUrl}}/talents/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "bio": "<script>alert('XSS')</script>"
}
```

**Expected:** Script tags should be sanitized

### 3. JWT Token Security

Test with expired tokens, malformed tokens, and tokens from different users.

## Automated Testing

### 1. Run Jest Tests

```bash
cd server
npm test
```

### 2. Run Tests with Coverage

```bash
npm run test:coverage
```

### 3. Run Tests in Watch Mode

```bash
npm run test:watch
```

## Best Practices

### 1. Test Data Management

- Use unique email addresses for each test
- Clean up test data after testing
- Use descriptive test names

### 2. Environment Variables

- Never commit real credentials to version control
- Use different environments for testing and production
- Validate environment variables on startup

### 3. Error Handling

- Test both success and error scenarios
- Verify error messages are user-friendly
- Check HTTP status codes are correct

### 4. Performance

- Monitor response times
- Test with realistic data volumes
- Check memory usage during operations

### 5. Security

- Test authentication thoroughly
- Verify authorization rules
- Check input validation
- Test rate limiting

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if server is running
   - Verify port configuration
   - Check firewall settings

2. **Authentication Errors**
   - Verify JWT secret is set
   - Check token expiration
   - Ensure proper token format

3. **Database Connection Issues**
   - Verify MongoDB is running
   - Check connection string
   - Ensure network connectivity

4. **File Upload Failures**
   - Check Cloudinary configuration
   - Verify file size limits
   - Ensure proper file formats

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=* npm run dev
```

### Health Check

Always test the health endpoint first:

```http
GET http://localhost:5000/health
```

## Conclusion

This testing guide covers the essential scenarios for testing the DLT TalentHub API. Regular testing ensures the API remains reliable, secure, and performant. Remember to test in a staging environment before deploying to production. 