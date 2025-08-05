# DLT TalentHub

A comprehensive talent marketplace platform connecting African tech professionals with global opportunities in web2, web3, UI/UX, and all technology domains.

## 🌟 Introduction

DLT TalentHub is a modern, full-stack web application designed to bridge the gap between African tech talent and global job opportunities. The platform serves as a comprehensive marketplace where tech professionals can showcase their skills and companies can find the perfect candidates for their projects.

## 🎯 Problem We Solve

- **Limited Access**: African tech professionals often struggle to find quality job opportunities
- **Geographic Barriers**: Remote work opportunities are not easily discoverable
- **Skill Mismatch**: Companies find it difficult to identify qualified African talent
- **Fragmented Market**: No centralized platform for tech recruitment in Africa

## ✨ Main Features

### For Tech Professionals (Talents)
- **Profile Creation**: Build detailed professional profiles with skills, experience, and portfolio
- **Job Discovery**: Browse and search for relevant job opportunities
- **Application Management**: Track job applications and interview status
- **Skill Showcase**: Highlight technical skills, certifications, and projects
- **CV Upload**: Upload and manage professional resumes
- **Notifications**: Real-time updates on job applications and opportunities

### For Recruiters & Companies
- **Job Posting**: Create and manage detailed job listings
- **Talent Search**: Find qualified candidates using advanced filters
- **Application Review**: Manage and review job applications
- **Company Profiles**: Showcase company culture and opportunities
- **Direct Messaging**: Communicate directly with candidates
- **Analytics Dashboard**: Track job performance and application metrics

### For Administrators
- **User Management**: Oversee all platform users and accounts
- **Content Moderation**: Ensure quality and compliance
- **Platform Analytics**: Monitor platform usage and performance
- **System Configuration**: Manage platform settings and features

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework for production
- **React 19** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form state management
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Cloudinary** - File upload and management
- **Nodemailer** - Email notifications
- **Swagger** - API documentation

### Development Tools
- **Git** - Version control
- **npm/yarn** - Package management
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DLT-TALENT-HUB
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the server directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   BASE_URL=http://localhost:5000

   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/dlt-talenthub

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=15m
   REFRESH_SECRET=your-super-secret-refresh-key
   REFRESH_EXPIRES_IN=7d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start the development servers**

   Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

   Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 📖 How to Use the Application

### For New Users

1. **Registration**
   - Visit the homepage and click "Join as Talent" or "Hire Talent"
   - Fill in your personal information (name, email, password)
   - Choose your role: Talent (job seeker) or Recruiter (employer)
   - Complete your profile with additional details

2. **Profile Setup**
   - **Talents**: Add your skills, work experience, education, and upload your CV
   - **Recruiters**: Add company information, logo, and company description

### For Tech Professionals (Talents)

1. **Browse Jobs**
   - Use the search bar to find jobs by keywords, location, or job type
   - Filter jobs by experience level, salary range, or remote work options
   - Save interesting jobs to your favorites

2. **Apply for Jobs**
   - Click on a job listing to view full details
   - Review job requirements and company information
   - Click "Apply Now" and submit your application
   - Track your application status in your dashboard

3. **Manage Your Profile**
   - Keep your skills and experience up to date
   - Upload a professional photo and updated CV
   - Set your availability and preferred work arrangements

### For Recruiters

1. **Post Jobs**
   - Go to your dashboard and click "Post New Job"
   - Fill in job details: title, description, requirements, salary
   - Set application deadline and job type (full-time, part-time, contract)
   - Publish the job listing

2. **Review Applications**
   - Check your dashboard for new applications
   - Review candidate profiles and CVs
   - Shortlist candidates and schedule interviews
   - Send messages to candidates directly

3. **Manage Your Company**
   - Update company information and logo
   - Add team members and set permissions
   - View analytics on job performance

### For Administrators

1. **User Management**
   - Monitor all registered users
   - Approve or suspend user accounts
   - Handle user reports and disputes

2. **Content Moderation**
   - Review job postings for compliance
   - Monitor user-generated content
   - Ensure platform quality standards

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd server
npm start
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
DLT-TALENT-HUB/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages and components
│   ├── components/          # Reusable UI components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API client
│   ├── public/             # Static assets
│   └── types/              # TypeScript type definitions
├── server/                 # Node.js/Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── validators/         # Input validation
└── README.md              # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](http://localhost:5000/api-docs) for backend endpoints
2. Review the existing issues in the repository
3. Create a new issue with detailed information about your problem

## 🔮 Future Enhancements

- **Mobile Application**: Native iOS and Android apps
- **AI-Powered Matching**: Smart job-candidate matching algorithms
- **Video Interviews**: Integrated video calling for remote interviews
- **Skill Assessments**: Automated technical skill testing
- **Payment Integration**: Secure payment processing for premium features
- **Multi-language Support**: Support for multiple African languages

---

**Built with ❤️ for the African tech community** 