const mongoose = require('mongoose');
const Talent = require('./models/Talent');
const User = require('./models/User');
require('dotenv').config();

async function testTalents() {
  try {
    let mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      mongoURI = 'mongodb://localhost:27017/dlt-talenthub';
      console.log('No MongoDB URI provided, using default local URI for development');
    }
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const talentCount = await Talent.countDocuments();
    console.log(`Total talent profiles: ${talentCount}`);

    const publicTalents = await Talent.countDocuments({ isPublic: true });
    console.log(`Public talent profiles: ${publicTalents}`);

    const completeTalents = await Talent.countDocuments({ isProfileComplete: true });
    console.log(`Complete talent profiles: ${completeTalents}`);

    const allTalents = await Talent.find().populate('user', 'firstName lastName email');
    console.log('\nAll talent profiles:');
    allTalents.forEach((talent, index) => {
      console.log(`${index + 1}. ${talent.user?.firstName} ${talent.user?.lastName} (${talent.user?.email})`);
      console.log(`   - isPublic: ${talent.isPublic}`);
      console.log(`   - isProfileComplete: ${talent.isProfileComplete}`);
      console.log(`   - Skills: ${talent.skills?.length || 0}`);
      console.log(`   - Experience: ${talent.experience?.length || 0}`);
      console.log('');
    });

    if (talentCount === 0) {
      console.log('No talent profiles found. Creating test data...');
      
      const users = await User.find({ role: 'talent' }).limit(5);
      
      if (users.length === 0) {
        console.log('No talent users found. Please create some talent users first.');
        return;
      }

      for (const user of users) {
        const talent = new Talent({
          user: user._id,
          skills: [
            { name: 'React', level: 'advanced', yearsOfExperience: 3 },
            { name: 'Node.js', level: 'intermediate', yearsOfExperience: 2 },
            { name: 'JavaScript', level: 'expert', yearsOfExperience: 5 }
          ],
          experience: [
            {
              title: 'Senior Developer',
              company: 'Tech Corp',
              startDate: new Date('2022-01-01'),
              endDate: new Date('2024-01-01'),
              description: 'Led development team'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Science',
              institution: 'University of Technology',
              fieldOfStudy: 'Computer Science',
              startDate: new Date('2018-09-01'),
              endDate: new Date('2022-05-01')
            }
          ],
          availability: {
            status: 'available',
            noticePeriod: 30
          },
          salary: {
            currency: 'USD',
            minAmount: 60000,
            maxAmount: 90000,
            period: 'yearly'
          },
          isPublic: true,
          isProfileComplete: true
        });

        await talent.save();
        console.log(`Created talent profile for ${user.firstName} ${user.lastName}`);
      }
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testTalents(); 