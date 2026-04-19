import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'ads', 'call', 'referral', 'walk-in', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'negotiation', 'closed', 'lost'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  budget: {
    min: { type: Number },
    max: { type: Number }
  },
  preferences: {
    propertyType: { type: String, enum: ['residential', 'commercial', 'land', 'apartment'] },
    location: String,
    bedrooms: Number,
    budget: Number
  },
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  followUpDate: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  convertedToClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  convertedToDeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  }
}, {
  timestamps: true
});

// Index for searching
leadSchema.index({ name: 'text', email: 'text', phone: 'text' });

export default mongoose.model('Lead', leadSchema);