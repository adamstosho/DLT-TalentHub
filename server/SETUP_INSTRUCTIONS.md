# DLT TalentHub Backend Setup Instructions

## Quick Setup for Development

### 1. Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
# Option 1: MongoDB Atlas (Recommended for development)
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/dlt-talenthub?retryWrites=true&w=majority

# Option 2: Local MongoDB (if you have MongoDB installed)
# MONGO_URI=mongodb://localhost:27017/dlt-talenthub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Cloudinary Configuration (optional for development)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Bcrypt rounds for password hashing
BCRYPT_ROUNDS=12
```

### 2. Database Setup

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Replace `your-username`, `your-password`, and `your-cluster` in the MONGO_URI

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/dlt-talenthub` as your MONGO_URI

### 3. Install Dependencies
```bash
cd server
npm install
```

### 4. Start the Server
```bash
npm run dev
```

### 5. Test the API
- Health check: `http://localhost:5000/health`
- API Documentation: `http://localhost:5000/api-docs`
- Main portal: `http://localhost:5000`

## Current Issue Resolution

The server has been updated to handle database connection failures gracefully:

1. **Database Connection**: The server will attempt to connect to MongoDB but won't crash if it fails
2. **API Endpoints**: All database-dependent endpoints will return a 503 error with a clear message if the database is unavailable
3. **Health Check**: The `/health` endpoint now shows database connection status

## Testing Without Database

If you want to test the frontend without setting up a database:

1. The server will start successfully
2. API endpoints will return: `{"status": "error", "message": "Database is not available. Please try again later.", "code": "DATABASE_UNAVAILABLE"}`
3. You can still access the Swagger documentation at `/api-docs`

## Next Steps

1. Set up MongoDB (Atlas recommended for ease)
2. Create the `.env` file with your database credentials
3. Restart the server
4. Test the registration endpoint

The frontend should now work properly once the database is connected! 