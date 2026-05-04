import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a room title'],
    trim: true,
  },
  mode: {
    type: String,
    enum: ['General GD', 'Debate', 'Interview'],
    default: 'General GD',
  },
  description: {
    type: String,
    trim: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'live',
  },
  scheduledStartTime: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  aiSettings: {
    moderatorEnabled: { type: Boolean, default: true },
    participantEnabled: { type: Boolean, default: false },
  },
  summary: {
    type: String,
  },
  duration: {
    type: Number, // in seconds
  },
  participationStats: [{
    name: String,
    time: Number,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Room', roomSchema);
