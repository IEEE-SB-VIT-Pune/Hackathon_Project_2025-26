import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    startDate: Date,
    endDate: Date,

    registrationDeadline: Date,
    prototypeDeadline: Date,
    finalDeadline: Date,
    presentationDate: Date,
    resultDate: Date,

    minTeamSize: {
      type: Number,
      default: 1, 
    },
    maxTeamSize: {
      type: Number,
      default: 4, 
    },

    prizePool: String, // Legacy field - kept for backward compatibility
    
    // Dynamic Prize Distribution
    prizes: [
      {
        position: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    judgingCriteria: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          description: { type: String, trim: true },
          weight: { type: Number, default: 1 },
        }
      ],
      default: [
        { name: "Innovation", weight: 1 },
        { name: "Technical Implementation", weight: 1 },
        { name: "Problem Relevance", weight: 1 },
        { name: "Presentation", weight: 1 },
        { name: "Feasibility", weight: 1 }
      ]
    },

    browniePoints: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          description: { type: String, trim: true },
          weight: { type: Number, default: 1 },
        }
      ],
      default: [
        { name: "C1", description: "Working Demo", weight: 6 },
        { name: "C2", description: "Open Source Code", weight: 5 },
        { name: "C3", description: "Deployed Application", weight: 4 },
        { name: "C4", description: "Impressive UX/UI", weight: 4 },
        { name: "C5", description: "Scalability", weight: 3 },
        { name: "C6", description: "Use of DeepTech", weight: 3 },
        { name: "C7", description: "Sponsors Track Used", weight: 2 },
        { name: "C8", description: "Good Pitch Deck", weight: 1 }
      ]
    },

    image: String, 
    rules: String,
    terms: String,

    status: {
      type: String,
      enum: ['draft', 'open', 'ongoing', 'closed'],
      default: 'draft',
    },

    // Isko 'judgeUserId' hi rakha hai kyunki assignJudge controller yahi maangta hai
    judges: [
      {
        judgeUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        assignedAt: Date,
      },
    ],

    // Isko wapas 'organizerUserId' kar diya hai taaki populate crash na ho
    organizers: [
      {
        organizerUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        assignedAt: Date,
      },
    ],

    // Problem Statements for hackathon
    problemStatements: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Rounds for hackathon
    rounds: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        submissionRequirements: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Hackathon = mongoose.model('Hackathon', hackathonSchema);
export default Hackathon;