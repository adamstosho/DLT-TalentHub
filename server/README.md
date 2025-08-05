# DLT TalentHub Backend

A comprehensive Node.js/Express backend for the DLT TalentHub platform, connecting talents with job opportunities in the DLT Africa ecosystem.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user profile management with avatar uploads
- **Talent Profiles**: Detailed talent profiles with skills, experience, and education
- **Job Management**: Full CRUD operations for job postings and applications
- **Recruiter Dashboard**: Tools for recruiters to manage jobs and applications
- **Admin Panel**: Comprehensive admin tools for platform management
- **File Uploads**: Secure file uploads with Cloudinary integration
- **Email Notifications**: Automated email notifications using Nodemailer
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Security**: Rate limiting, input validation, XSS protection, and more

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DLT_TalentHub/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the server directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   BASE_URL=http://localhost:5000

   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/dlt-talenthub
   MONGO_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/dlt-talenthub

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=15m
   REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   REFRESH_EXPIRES_IN=7d

   # Cloudinary Configuration (for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email Configuration (for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Security
   BCRYPT_ROUNDS=12
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🗄️ Database

### Seed Data
Populate the database with sample data:
```bash
npm run seed
```

This will create:
- Admin user (admin@dlt-talenthub.com / Admin123!)
- Sample talents
- Sample recruiters
- Sample jobs

### Database Models
- **User**: Base user model with authentication
- **Talent**: Extended profile for talents
- **Job**: Job postings with detailed information
- **Application**: Job applications
- **Notification**: User notifications

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register/Login** to get access and refresh tokens
2. **Include token** in Authorization header: `Bearer <token>`
3. **Refresh token** when access token expires

### User Roles
- **talent**: Can apply to jobs, manage profile
- **recruiter**: Can post jobs, manage applications
- **admin**: Full platform access

## 📁 Project Structure

```
server/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── validators/      # Input validation
├── tests/           # Test files
├── seed/            # Database seeding
├── uploads/         # File uploads (temporary)
├── logs/            # Application logs
└── server.js        # Main application file
```

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run check-format
```

### Environment Variables
- Copy `env.example` to `.env`
- Update values for your environment
- Never commit `.env` files

### Logging
- Uses Winston for structured logging
- Logs stored in `logs/` directory
- Console output in development

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB URI
- [ ] Set strong JWT secrets
- [ ] Configure Cloudinary credentials
- [ ] Set up email service
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Users
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `DELETE /api/users/avatar` - Delete avatar
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/search` - Search users

### Talents
- `GET /api/talents/profile` - Get talent profile
- `PUT /api/talents/profile` - Update talent profile
- `POST /api/talents/cv` - Upload CV
- `DELETE /api/talents/cv` - Delete CV
- `GET /api/talents/search` - Search talents
- `GET /api/talents/skill/:skill` - Get talents by skill

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:jobId` - Get job details
- `PUT /api/jobs/:jobId` - Update job
- `DELETE /api/jobs/:jobId` - Delete job
- `POST /api/jobs/:jobId/apply` - Apply to job
- `GET /api/jobs/search` - Search jobs

### Recruiters
- `GET /api/recruiters/dashboard` - Recruiter dashboard
- `GET /api/recruiters/jobs` - Get recruiter's jobs
- `GET /api/recruiters/applications` - Get applications
- `GET /api/recruiters/stats` - Get recruiter stats

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/status` - Update user status
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/jobs` - Get all jobs
- `PUT /api/admin/jobs/:jobId/status` - Update job status

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api-docs` 