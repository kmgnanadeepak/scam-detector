import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  website: {
    type: String,
    trim: true,
    lowercase: true
  },
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  scamReportsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  verifiedRecruiters: {
    type: Number,
    default: 0,
    min: 0
  },
  domainAge: {
    type: Number,
    default: 0,
    min: 0
  },
  industry: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  headquarters: {
    type: String,
    trim: true
  },
  employeeCount: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

companySchema.index({ companyName: 'text', website: 'text' });

companySchema.methods.calculateTrustScore = function() {
  let score = 50;
  
  score -= this.scamReportsCount * 5;
  score += this.verifiedRecruiters * 10;
  
  if (this.domainAge > 5) score += 10;
  else if (this.domainAge > 2) score += 5;
  
  if (this.website && this.website.includes('https')) score += 5;
  
  this.trustScore = Math.max(0, Math.min(100, score));
  return this.trustScore;
};

companySchema.pre('save', function(next) {
  if (this.isModified('scamReportsCount') || this.isModified('verifiedRecruiters') || this.isModified('domainAge')) {
    this.calculateTrustScore();
  }
  next();
});

export default mongoose.model('Company', companySchema);
