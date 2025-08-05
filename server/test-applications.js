const mongoose = require('mongoose');
const Application = require('./models/Application');
const Job = require('./models/Job');
const User = require('./models/User');
require('dotenv').config();

async function testApplications() {
  try {
    // Connect to MongoDB
    let mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      mongoURI = 'mongodb://localhost:27017/dlt-talenthub';
      console.log('No MongoDB URI provided, using default local URI for development');
    }
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if there are any applications
    const applicationCount = await Application.countDocuments();
    console.log(`Total applications: ${applicationCount}`);

    // Check if there are any jobs
    const jobCount = await Job.countDocuments();
    console.log(`Total jobs: ${jobCount}`);

    // Check if there are any users
    const userCount = await User.countDocuments();
    console.log(`Total users: ${userCount}`);

    // List all applications with details
    const applications = await Application.find()
      .populate('job', 'title company')
      .populate('applicant', 'firstName lastName email')
      .populate('talent', 'skills')
      .sort({ createdAt: -1 });

    console.log('\nAll applications:');
    applications.forEach((app, index) => {
      console.log(`${index + 1}. Application ID: ${app._id}`);
      console.log(`   Job: ${app.job?.title || 'N/A'} (${app.job?.company?.name || 'N/A'})`);
      console.log(`   Applicant: ${app.applicant?.firstName || 'N/A'} ${app.applicant?.lastName || 'N/A'} (${app.applicant?.email || 'N/A'})`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Created: ${app.createdAt}`);
      console.log('');
    });

    // Check recruiter's applications
    const recruiters = await User.find({ role: 'recruiter' });
    console.log('\nRecruiters:');
    recruiters.forEach((recruiter, index) => {
      console.log(`${index + 1}. ${recruiter.firstName} ${recruiter.lastName} (${recruiter.email})`);
    });

    // For each recruiter, check their jobs and applications
    for (const recruiter of recruiters) {
      console.log(`\n=== Applications for ${recruiter.firstName} ${recruiter.lastName} ===`);
      
      const recruiterJobs = await Job.find({ recruiter: recruiter._id });
      console.log(`Jobs posted: ${recruiterJobs.length}`);
      
      if (recruiterJobs.length > 0) {
        const jobIds = recruiterJobs.map(job => job._id);
        const recruiterApplications = await Application.find({
          job: { $in: jobIds }
        })
        .populate('job', 'title company')
        .populate('applicant', 'firstName lastName email')
        .sort({ createdAt: -1 });

        console.log(`Applications received: ${recruiterApplications.length}`);
        
        recruiterApplications.forEach((app, index) => {
          console.log(`  ${index + 1}. ${app.applicant?.firstName} ${app.applicant?.lastName} applied to ${app.job?.title} (${app.status})`);
        });
      }
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testApplications(); 