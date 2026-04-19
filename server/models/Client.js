import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['buyer', 'seller', 'both'],
    default: 'buyer'
  },
  source: {
    type: String,
    enum: ['lead', 'referral', 'website', 'advertisement', 'other'],
    default: 'lead'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  preferences: {
    propertyType: [String],
    budget: {
      min: Number,
      max: Number
    },
    location: String,
    bedrooms: Number
  },
  interactions: [{
    type: {
      type: String,
      enum: ['call', 'email', 'sms', 'meeting', 'visit', 'note']
    },
    description: String,
    date: { type: Date, default: Date.now },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  visitedProperties: [{
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    date: { type: Date, default: Date.now },
    notes: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

// Index for searching
clientSchema.index({ name: 'text', email: 'text', phone: 'text' });

export default mongoose.model('Client', clientSchema);