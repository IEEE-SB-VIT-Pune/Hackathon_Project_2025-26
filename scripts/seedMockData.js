/**
 * seedMockData.js
 * Seeds the mock hackathon, team, and problem statements into MongoDB.
 * Run with: node scripts/seedMockData.js
 *
 * This creates the same data the frontend mock intercepts for "hack123" / "team123",
 * so you can switch from mock mode to real DB mode without changing anything else.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hackathon from '../models/Hackathon.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import ProblemStatement from '../models/ProblemStatement.js';
import ProblemMetadata from '../models/ProblemMetadata.js';
import embeddingService from '../services/embeddingService.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hackathon_ai';

const PROBLEMS = [
  {
    title: 'AI-Powered Crop Disease Detection',
    description: 'Build a machine learning model to detect crop diseases from images using computer vision and deep learning. The system should work on mobile devices with React Native frontend.',
    source: 'platform',
    domains: ['AI', 'Agriculture'],
    requiredSkills: ['Machine Learning', 'Python', 'React Native', 'TensorFlow'],
    difficulty: 'hard',
    keywords: ['crop', 'disease', 'detection', 'CNN'],
  },
  {
    title: 'Smart Traffic Management System',
    description: 'Develop a real-time traffic monitoring and signal optimization system using IoT sensors and Node.js backend with MongoDB for data storage and a React dashboard.',
    source: 'platform',
    domains: ['IoT', 'Smart City'],
    requiredSkills: ['Node.js', 'MongoDB', 'React', 'IoT'],
    difficulty: 'medium',
    keywords: ['traffic', 'IoT', 'real-time', 'optimization'],
  },
  {
    title: 'Personalized E-Learning Platform',
    description: 'Create an adaptive learning platform using machine learning to personalize content delivery. Built with React frontend, Node.js API, and MongoDB database.',
    source: 'platform',
    domains: ['EdTech', 'AI'],
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Machine Learning'],
    difficulty: 'medium',
    keywords: ['learning', 'adaptive', 'personalization', 'education'],
  },
  {
    title: 'Blockchain-Based Land Registry',
    description: 'Implement a tamper-proof land registry system using blockchain technology with Solidity smart contracts and a React-based web interface.',
    source: 'SIH',
    domains: ['Blockchain', 'GovTech'],
    requiredSkills: ['Solidity', 'React', 'Web3.js', 'Ethereum'],
    difficulty: 'hard',
    keywords: ['blockchain', 'land', 'registry', 'smart contract'],
  },
  {
    title: 'Healthcare Appointment Booking System',
    description: 'Build a full-stack healthcare appointment management system with React frontend, Node.js REST API, MongoDB database, and real-time notifications.',
    source: 'platform',
    domains: ['HealthTech', 'Web'],
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'WebSockets'],
    difficulty: 'easy',
    keywords: ['healthcare', 'appointment', 'booking', 'notifications'],
  },
  {
    title: 'NLP-Based Legal Document Summarizer',
    description: 'Develop an NLP pipeline to automatically summarize lengthy legal documents using transformer models. Python backend with a React interface for document upload and review.',
    source: 'SIH',
    domains: ['LegalTech', 'NLP'],
    requiredSkills: ['Python', 'NLP', 'React', 'Transformers'],
    difficulty: 'hard',
    keywords: ['NLP', 'summarization', 'legal', 'transformer'],
  },
  {
    title: 'Real-Time Disaster Alert System',
    description: 'Create a disaster management platform that aggregates data from multiple sources, uses machine learning for prediction, and delivers alerts via a Node.js backend with MongoDB.',
    source: 'platform',
    domains: ['Disaster Management', 'AI'],
    requiredSkills: ['Node.js', 'MongoDB', 'Machine Learning', 'REST APIs'],
    difficulty: 'medium',
    keywords: ['disaster', 'alert', 'prediction', 'real-time'],
  },
  {
    title: 'Student Mental Health Chatbot',
    description: 'Build an empathetic AI chatbot for student mental health support using NLP and sentiment analysis. React frontend with a Node.js backend and MongoDB for session storage.',
    source: 'platform',
    domains: ['HealthTech', 'AI'],
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'NLP', 'Machine Learning'],
    difficulty: 'medium',
    keywords: ['chatbot', 'mental health', 'NLP', 'sentiment'],
  },
  {
    title: 'Supply Chain Transparency Platform',
    description: 'Design a supply chain tracking system using QR codes and a React dashboard backed by Node.js and MongoDB to ensure product authenticity and traceability.',
    source: 'external',
    domains: ['Supply Chain', 'Web'],
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'QR Codes'],
    difficulty: 'easy',
    keywords: ['supply chain', 'tracking', 'QR', 'transparency'],
  },
  {
    title: 'AI Resume Screening Tool',
    description: 'Build an automated resume screening system using machine learning and NLP to rank candidates. Node.js backend, MongoDB storage, React frontend for HR dashboard.',
    source: 'platform',
    domains: ['HRTech', 'AI'],
    requiredSkills: ['Machine Learning', 'NLP', 'Node.js', 'MongoDB', 'React'],
    difficulty: 'medium',
    keywords: ['resume', 'screening', 'NLP', 'ranking', 'HR'],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Create a placeholder user for team leader
  let user = await User.findOne({ email: 'mock@codecrafters.dev' });
  if (!user) {
    user = await User.create({
      name: 'Mock Leader',
      email: 'mock@codecrafters.dev',
      password: 'mockpassword',
      skills: ['React', 'Node.js', 'MongoDB', 'Machine Learning'],
    });
    console.log('Created mock user:', user._id);
  }

  // Create hackathon
  let hackathon = await Hackathon.findOne({ title: 'IEEE Smart India Hackathon 2025' });
  if (!hackathon) {
    hackathon = await Hackathon.create({
      title: 'IEEE Smart India Hackathon 2025',
      description: 'Build innovative solutions for real-world problems using cutting-edge technology.',
      status: 'open',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-03'),
      prizePool: '₹10,00,000',
      createdBy: user._id,
    });
    console.log('Created hackathon:', hackathon._id);
  }

  // Create team
  let team = await Team.findOne({ name: 'CodeCrafters', hackathonId: hackathon._id });
  if (!team) {
    team = await Team.create({
      name: 'CodeCrafters',
      hackathonId: hackathon._id,
      leader: user._id,
      members: [],
    });
    console.log('Created team:', team._id);
  }

  // Create problems
  for (const p of PROBLEMS) {
    const existing = await ProblemStatement.findOne({ title: p.title, hackathonId: hackathon._id });
    if (existing) continue;

    const problem = await ProblemStatement.create({
      hackathonId: hackathon._id,
      source: p.source,
      title: p.title,
      description: p.description,
    });

    await ProblemMetadata.create({
      problemId: problem._id,
      domains: p.domains,
      requiredSkills: p.requiredSkills,
      difficulty: p.difficulty,
      keywords: p.keywords,
    });

    await embeddingService.generateAndSaveEmbedding(problem._id, p.description);
    console.log('Seeded problem:', p.title);
  }

  console.log('\n✅ Seed complete.');
  console.log(`   Hackathon ID : ${hackathon._id}`);
  console.log(`   Team ID      : ${team._id}`);
  console.log('   Use these IDs in the UI when connected to real MongoDB.\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
