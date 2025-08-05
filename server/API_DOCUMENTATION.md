# DLT TalentHub API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Talents](#talent-endpoints)
   - [Jobs](#job-endpoints)
   - [Recruiters](#recruiter-endpoints)
   - [Admin](#admin-endpoints)
   - [Notifications](#notification-endpoints)

## Overview

DLT TalentHub API is a RESTful service that provides endpoints for managing a talent marketplace platform focused on DLT (Distributed Ledger Technology) opportunities in Africa.

### Features
- User authentication and authorization
- Talent profile management
- Job posting and applications
- Recruiter dashboard
- Admin panel
- Real-time notifications

## Authentication

The API uses JWT (JSON Web Token) for authentication.

### Getting a Token
1. Register or login to receive an access token
2. Include the token in the Authorization header: `Bearer <token>`

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Use the refresh endpoint to get new access tokens

## Base URL

**Development:** `http://localhost:5000/api`
**Production:** `https://your-domain.com/api`

## Error Handling

### Standard Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Endpoints

### Authentication Endpoints

#### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "role": "talent"
}
```

**Response (201):**
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
      "isActive": true,
      "createdAt": "2023-07-26T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
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

#### Get Current User
**GET** `/auth/me`

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
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
      "avatar": "https://cloudinary.com/avatar.jpg",
      "bio": "DLT enthusiast",
      "location": "Lagos, Nigeria",
      "phone": "+2348012345678"
    }
  }
}
```

#### Refresh Token
**POST** `/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Logout
**POST** `/auth/logout`

Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### User Endpoints

#### Update Profile
**PUT** `/users/profile`

Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Passionate about blockchain technology",
  "location": "Lagos, Nigeria",
  "phone": "+2348012345678"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "bio": "Passionate about blockchain technology",
      "location": "Lagos, Nigeria",
      "phone": "+2348012345678",
      "updatedAt": "2023-07-26T10:00:00.000Z"
    }
  }
}
```

#### Upload Avatar
**POST** `/users/avatar`

Upload user profile picture.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `multipart/form-data`
- `avatar`: Image file (JPG, PNG, max 5MB)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "avatar": "https://cloudinary.com/avatar.jpg"
  }
}
```

#### Get User Profile
**GET** `/users/:userId`

Get public user profile by ID.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "avatar": "https://cloudinary.com/avatar.jpg",
      "bio": "DLT enthusiast",
      "location": "Lagos, Nigeria",
      "role": "talent"
    }
  }
}
```

### Talent Endpoints

#### Get Talent Profile
**GET** `/talents/profile`

Get current user's talent profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "talent": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "skills": [
        {
          "name": "Blockchain Development",
          "level": "advanced",
          "yearsOfExperience": 3
        }
      ],
      "experience": [
        {
          "title": "Blockchain Developer",
          "company": "CryptoCorp",
          "startDate": "2020-01-01",
          "endDate": "2023-01-01",
          "description": "Developed smart contracts"
        }
      ],
      "education": [
        {
          "degree": "Computer Science",
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
        "min": 50000,
        "max": 80000,
        "currency": "USD"
      }
    }
  }
}
```

#### Update Talent Profile
**PUT** `/talents/profile`

Update talent profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "skills": [
    {
      "name": "Solidity",
      "level": "advanced",
      "yearsOfExperience": 2
    }
  ],
  "experience": [
    {
      "title": "Smart Contract Developer",
      "company": "DeFi Startup",
      "startDate": "2021-01-01",
      "endDate": "2023-01-01",
      "description": "Built DeFi protocols"
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

#### Upload CV
**POST** `/talents/cv`

Upload talent CV/resume.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `multipart/form-data`
- `cv`: Document file (PDF, DOC, max 5MB)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "cv": "https://cloudinary.com/cv.pdf"
  }
}
```

#### Search Talents
**GET** `/talents/search`

Search for talents with filters.

**Query Parameters:**
- `q`: Search query
- `skills`: Comma-separated skills
- `location`: Location filter
- `availability`: available, busy, unavailable
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "talents": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "firstName": "John",
        "lastName": "Doe",
        "skills": ["Solidity", "React"],
        "location": "Lagos, Nigeria",
        "availability": "available"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### Job Endpoints

#### Create Job
**POST** `/jobs`

Create a new job posting.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Senior Blockchain Developer",
  "description": "We are looking for an experienced blockchain developer...",
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
  "skills": ["Solidity", "React", "Node.js"],
  "requirements": [
    "5+ years of blockchain development",
    "Experience with DeFi protocols"
  ]
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "job": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Senior Blockchain Developer",
      "company": {
        "name": "CryptoCorp"
      },
      "type": "full-time",
      "status": "active",
      "createdAt": "2023-07-26T10:00:00.000Z"
    }
  }
}
```

#### Get All Jobs
**GET** `/jobs`

Get all available jobs with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `type`: Job type filter
- `category`: Category filter
- `location`: Location filter

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "jobs": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Senior Blockchain Developer",
        "company": {
          "name": "CryptoCorp",
          "logo": "https://cloudinary.com/logo.png"
        },
        "type": "full-time",
        "location": {
          "type": "remote"
        },
        "salary": {
          "min": 80000,
          "max": 120000,
          "currency": "USD"
        },
        "createdAt": "2023-07-26T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Get Job Details
**GET** `/jobs/:jobId`

Get detailed job information.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "job": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Senior Blockchain Developer",
      "description": "We are looking for an experienced blockchain developer...",
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
      "skills": ["Solidity", "React", "Node.js"],
      "requirements": [
        "5+ years of blockchain development",
        "Experience with DeFi protocols"
      ],
      "status": "active",
      "views": 150,
      "applications": 12,
      "createdAt": "2023-07-26T10:00:00.000Z"
    }
  }
}
```

#### Apply to Job
**POST** `/jobs/:jobId/apply`

Apply to a job posting.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "coverLetter": "I am excited to apply for this position...",
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

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "application": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "jobId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "talentId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "status": "pending",
      "createdAt": "2023-07-26T10:00:00.000Z"
    }
  }
}
```

### Recruiter Endpoints

#### Get Recruiter Dashboard
**GET** `/recruiters/dashboard`

Get recruiter dashboard statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalJobs": 15,
      "activeJobs": 12,
      "totalApplications": 45,
      "pendingApplications": 8,
      "hiredTalents": 3
    },
    "recentApplications": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "jobTitle": "Senior Blockchain Developer",
        "talentName": "John Doe",
        "status": "pending",
        "appliedAt": "2023-07-26T10:00:00.000Z"
      }
    ]
  }
}
```

#### Get Recruiter's Jobs
**GET** `/recruiters/jobs`

Get all jobs posted by the recruiter.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Job status filter
- `page`: Page number
- `limit`: Results per page

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "jobs": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Senior Blockchain Developer",
        "status": "active",
        "applications": 12,
        "views": 150,
        "createdAt": "2023-07-26T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

### Admin Endpoints

#### Get Admin Dashboard
**GET** `/admin/dashboard`

Get admin dashboard statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalUsers": 1250,
      "totalTalents": 800,
      "totalRecruiters": 150,
      "totalJobs": 300,
      "totalApplications": 1200,
      "activeJobs": 250
    },
    "recentActivity": [
      {
        "type": "user_registration",
        "description": "New talent registered",
        "timestamp": "2023-07-26T10:00:00.000Z"
      }
    ]
  }
}
```

#### Get All Users
**GET** `/admin/users`

Get all users with admin controls.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role`: User role filter
- `status`: User status filter
- `page`: Page number
- `limit`: Results per page

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "talent",
        "isActive": true,
        "createdAt": "2023-07-26T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1250,
      "pages": 125
    }
  }
}
```

### Notification Endpoints

#### Get Notifications
**GET** `/notifications`

Get user notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number
- `limit`: Results per page

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "type": "application_status",
        "title": "Application Update",
        "message": "Your application has been reviewed",
        "isRead": false,
        "createdAt": "2023-07-26T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Mark Notification as Read
**PUT** `/notifications/:notificationId/read`

Mark a notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "notification": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "isRead": true,
      "updatedAt": "2023-07-26T10:00:00.000Z"
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **100 requests per 15 minutes** per IP address
- Rate limit headers are included in responses
- Exceeding limits returns 429 status code

## File Uploads

### Supported Formats
- **Images**: JPG, PNG, GIF (max 5MB)
- **Documents**: PDF, DOC, DOCX (max 5MB)

### Upload Endpoints
- `/users/avatar` - User profile pictures
- `/talents/cv` - Talent resumes/CVs

## Testing

### Health Check
**GET** `/health`

Check if the API is running.

**Response (200):**
```json
{
  "status": "success",
  "message": "DLT TalentHub Server is running",
  "timestamp": "2023-07-26T10:00:00.000Z",
  "environment": "development"
}
```

## Support

For API support and questions:
- Check the server logs for detailed error information
- Ensure all required fields are provided in requests
- Verify authentication tokens are valid and not expired
- Contact the development team for additional assistance 