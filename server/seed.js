const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Team = require('./src/models/Team');
const Project = require('./src/models/Project');
const Contribution = require('./src/models/Contribution');
const AIAnalysis = require('./src/models/AIAnalysis');

// Load environment variables from the .env file in the current directory
dotenv.config();

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file. Please check your server/.env file.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Starting database seeding...');

    // 1. Clear existing data
    await User.deleteMany({});
    await Team.deleteMany({});
    await Project.deleteMany({});
    await Contribution.deleteMany({});
    await AIAnalysis.deleteMany({});

    // 2. Create Users
    const password = await bcrypt.hash('password123', 12);
    const users = await User.insertMany([
      { name: 'Alex Rivera', email: 'alex@example.com', password, role: 'student', contributionStreak: 5 },
      { name: 'Sarah Chen', email: 'sarah@example.com', password, role: 'student', contributionStreak: 3 },
      { name: 'John Doe', email: 'john@example.com', password, role: 'student', contributionStreak: 1 }
    ]);

    // 3. Create Team
    const team = await Team.create({
      name: 'Alpha Squad',
      description: 'Building the next gen AI platform',
      inviteCode: 'ALPHA2024',
      members: [
        { user: users[0]._id, role: 'leader' },
        { user: users[1]._id, role: 'member' },
        { user: users[2]._id, role: 'member' }
      ]
    });

    // 4. Create Project
    const project = await Project.create({
      title: 'Project Phoenix',
      description: 'An AI-powered collaboration tool for students designed to analyze contributions ethically.',
      team: team._id,
      createdBy: users[0]._id,
      status: 'active',
      techStack: ['Node.js', 'React', 'MongoDB', 'FastAPI'],
      startDate: new Date()
    });

    // 5. Create Sample Contributions
    const contributionsList = await Contribution.insertMany([
      {
        user: users[0]._id,
        project: project._id,
        team: team._id,
        description: 'Implemented the backend API for user registration and JWT authentication with custom error handling.',
        category: 'backend',
        hoursSpent: 4,
        githubLink: 'https://github.com/alex/phoenix/commit/123'
      },
      {
        user: users[1]._id,
        project: project._id,
        team: team._id,
        description: 'Designed the glassmorphism UI for the dashboard and integrated Recharts for real-time analytics.',
        category: 'frontend',
        hoursSpent: 6
      }
    ]);

    // 6. Create AI Analysis for contributions
    const analyses = await AIAnalysis.insertMany([
      {
        contribution: contributionsList[0]._id,
        user: users[0]._id,
        project: project._id,
        technicalDifficulty: 8,
        effortScore: 7,
        qualityScore: 9,
        feedback: 'Excellent work on the security layer. The JWT implementation follows best practices and enhances project safety.',
        skillsDetected: ['Node.js', 'Security', 'JWT']
      },
      {
        contribution: contributionsList[1]._id,
        user: users[1]._id,
        project: project._id,
        technicalDifficulty: 6,
        effortScore: 9,
        qualityScore: 8,
        feedback: 'The UI is visually stunning and responsive. High attention to detail in glassmorphism effects and animations.',
        skillsDetected: ['React', 'CSS', 'UI/UX']
      }
    ]);

    // Link AI Analysis back to contributions
    contributionsList[0].aiAnalysis = analyses[0]._id;
    contributionsList[1].aiAnalysis = analyses[1]._id;
    await contributionsList[0].save();
    await contributionsList[1].save();

    console.log('✅ Seeding complete!');
    console.log('-----------------------------------');
    console.log('User 1: alex@example.com / password123');
    console.log('User 2: sarah@example.com / password123');
    console.log('User 3: john@example.com / password123');
    console.log('-----------------------------------');
    
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedData();
