import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'land', 'apartment', 'villa', 'plot'],
    required: true
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  area: {
    value: Number,
    unit: { type: String, enum: ['sqft', 'sqm', 'acre', 'bigha'], default: 'sqft' }
  },
  bedrooms: Number,
  bathrooms: Number,
  floors: Number,
  yearBuilt: Number,
  amenities: [{
    type: String,
    enum: ['parking', 'garden', 'pool', 'gym', 'security', 'lift', 'power-backup', 'water-supply', 'furnished', 'ac', 'heating']
  }],
  images: [{
    url: String,
    isPrimary: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'under-offer'],
    default: 'available'
  },
  listedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    name: String,
    phone: String,
    email: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for searching
propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

export default mongoose.model('Property', propertySchema);