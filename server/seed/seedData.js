const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Talent = require('../models/Talent');
const Job = require('../models/Job');
const logger = require('../utils/logger');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_URI_PROD 
      : process.env.MONGO_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info('✅ MongoDB Connected for seeding');
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Seed admin user
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@dlt-talenthub.com' });
    if (adminExists) {
      logger.info('Admin user already exists');
      return adminExists;
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@dlt-talenthub.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      emailVerified: true
    });

    logger.info('✅ Admin user created');
    return admin;
  } catch (error) {
    logger.error('Error creating admin user:', error);
  }
};

// Seed sample talents
const seedTalents = async () => {
  try {
    const talents = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Talent123!',
        role: 'talent',
        phone: '+1234567890',
        bio: 'Experienced software developer with expertise in React, Node.js, and MongoDB.',
        location: 'Lagos, Nigeria'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'Talent123!',
        role: 'talent',
        phone: '+1234567891',
        bio: 'UI/UX designer passionate about creating beautiful and functional user experiences.',
        location: 'Nairobi, Kenya'
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@example.com',
        password: 'Talent123!',
        role: 'talent',
        phone: '+1234567892',
        bio: 'Full-stack developer specializing in Python, Django, and React.',
        location: 'Cape Town, South Africa'
      }
    ];

    for (const talentData of talents) {
      const existingUser = await User.findOne({ email: talentData.email });
      if (existingUser) {
        logger.info(`Talent ${talentData.email} already exists`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(talentData.password, 12);
      const user = await User.create({
        ...talentData,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
        emailVerified: true
      });

      // Create talent profile
      await Talent.create({
        user: user._id,
        skills: [
          { name: 'JavaScript', level: 'expert', yearsOfExperience: 5 },
          { name: 'React', level: 'advanced', yearsOfExperience: 4 },
          { name: 'Node.js', level: 'advanced', yearsOfExperience: 4 }
        ],
        experience: [
          {
            title: 'Senior Software Developer',
            company: 'Tech Company',
            location: 'Lagos, Nigeria',
            startDate: new Date('2020-01-01'),
            endDate: null,
            isCurrent: true,
            description: 'Leading development of web applications using React and Node.js'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science',
            institution: 'University of Lagos',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-01'),
            isCurrent: false
          }
        ],
        availability: {
          status: 'available',
          noticePeriod: 30,
          preferredWorkType: ['full-time', 'contract'],
          remotePreference: 'remote'
        },
        salary: {
          currency: 'USD',
          minAmount: 3000,
          maxAmount: 6000,
          period: 'monthly'
        },
        isProfileComplete: true,
        profileCompletionPercentage: 85
      });

      logger.info(`✅ Talent ${talentData.email} created`);
    }
  } catch (error) {
    logger.error('Error creating talents:', error);
  }
};

// Seed sample recruiters
const seedRecruiters = async () => {
  try {
    const recruiters = [
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        password: 'Recruiter123!',
        role: 'recruiter',
        phone: '+1234567893',
        bio: 'HR Manager at TechCorp, specializing in tech recruitment.',
        location: 'Johannesburg, South Africa'
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@startup.com',
        password: 'Recruiter123!',
        role: 'recruiter',
        phone: '+1234567894',
        bio: 'Talent Acquisition Specialist at StartupXYZ.',
        location: 'Accra, Ghana'
      }
    ];

    for (const recruiterData of recruiters) {
      const existingUser = await User.findOne({ email: recruiterData.email });
      if (existingUser) {
        logger.info(`Recruiter ${recruiterData.email} already exists`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(recruiterData.password, 12);
      await User.create({
        ...recruiterData,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
        emailVerified: true
      });

      logger.info(`✅ Recruiter ${recruiterData.email} created`);
    }
  } catch (error) {
    logger.error('Error creating recruiters:', error);
  }
};

// Seed sample jobs
const seedJobs = async () => {
  try {
    const recruiters = await User.find({ role: 'recruiter' }).limit(2);
    if (recruiters.length === 0) {
      logger.info('No recruiters found, skipping job creation');
      return;
    }

    const jobs = [
      {
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer to join our team and help build amazing web applications.',
        company: {
          name: 'TechCorp',
          website: 'https://techcorp.com',
          location: 'Lagos, Nigeria',
          size: 'medium',
          industry: 'Technology'
        },
        recruiter: recruiters[0]._id,
        type: 'full-time',
        category: 'Software Development',
        skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
        requirements: [
          '5+ years of experience with React',
          'Strong JavaScript fundamentals',
          'Experience with TypeScript',
          'Knowledge of Node.js and Express'
        ],
        responsibilities: [
          'Develop and maintain React applications',
          'Collaborate with design and backend teams',
          'Write clean, maintainable code',
          'Participate in code reviews'
        ],
        location: {
          type: 'remote',
          city: 'Lagos',
          country: 'Nigeria'
        },
        salary: {
          min: 4000,
          max: 8000,
          currency: 'USD',
          period: 'monthly'
        },
        experience: {
          min: 5,
          max: 8,
          level: 'senior'
        },
        status: 'active',
        isUrgent: true
      },
      {
        title: 'UI/UX Designer',
        description: 'Join our creative team as a UI/UX designer and help create beautiful, user-friendly interfaces.',
        company: {
          name: 'StartupXYZ',
          website: 'https://startupxyz.com',
          location: 'Nairobi, Kenya',
          size: 'startup',
          industry: 'Technology'
        },
        recruiter: recruiters[1]._id,
        type: 'contract',
        category: 'Design',
        skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
        requirements: [
          '3+ years of UI/UX design experience',
          'Proficiency in Figma and Adobe Creative Suite',
          'Strong portfolio showcasing web and mobile designs',
          'Experience with user research and testing'
        ],
        responsibilities: [
          'Create user-centered designs',
          'Conduct user research and usability testing',
          'Create wireframes, prototypes, and high-fidelity designs',
          'Collaborate with development team'
        ],
        location: {
          type: 'hybrid',
          city: 'Nairobi',
          country: 'Kenya'
        },
        salary: {
          min: 3000,
          max: 6000,
          currency: 'USD',
          period: 'monthly'
        },
        experience: {
          min: 3,
          max: 6,
          level: 'mid'
        },
        status: 'active',
        isFeatured: true
      }
    ];

    for (const jobData of jobs) {
      const existingJob = await Job.findOne({ 
        title: jobData.title, 
        recruiter: jobData.recruiter 
      });
      
      if (existingJob) {
        logger.info(`Job ${jobData.title} already exists`);
        continue;
      }

      await Job.create(jobData);
      logger.info(`✅ Job "${jobData.title}" created`);
    }
  } catch (error) {
    logger.error('Error creating jobs:', error);
  }
};

// Main seeding function
const seedData = async () => {
  try {
    await connectDB();

    logger.info('🌱 Starting data seeding...');

    await seedAdmin();
    await seedTalents();
    await seedRecruiters();
    await seedJobs();

    logger.info('✅ Data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData }; 