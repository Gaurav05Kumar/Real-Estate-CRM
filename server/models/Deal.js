import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stage: {
    type: String,
    enum: ['inquiry', 'negotiation', 'agreement', 'closed', 'lost'],
    default: 'inquiry'
  },
  stageHistory: [{
    stage: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  dealValue: {
    type: Number,
    required: true
  },
  commission: {
    percentage: { type: Number, default: 2 },
    amount: Number
  },
  closingDate: Date,
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  activities: [{
    type: { type: String, enum: ['call', 'email', 'meeting', 'note'] },
    description: String,
    date: { type: Date, default: Date.now },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  source: {
    type: String,
    enum: ['lead', 'client', 'direct'],
    default: 'lead'
  },
  lostReason: String,
  closedReason: String
}, {
  timestamps: true
});

export default mongoose.model('Deal', dealSchema);