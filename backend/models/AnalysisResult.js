import mongoose from 'mongoose';

const analysisResultSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  googleReviews: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    summary: { type: String, trim: true }
  },
  facebookReviews: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    summary: { type: String, trim: true }
  },
  redditReviews: {
    totalMentions: { type: Number, default: 0, min: 0 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    summary: { type: String, trim: true }
  },
  youtubeMentions: {
    totalMentions: { type: Number, default: 0, min: 0 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    summary: { type: String, trim: true }
  },
  trustScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  externalLinks: {
    googleReviewLink: { type: String, trim: true },
    facebookReviewLink: { type: String, trim: true },
    redditSearchLink: { type: String, trim: true },
    youtubeSearchLink: { type: String, trim: true }
  },
  analysisSource: {
    type: String,
    enum: ['manual', 'ocr', 'api'],
    default: 'manual'
  },
  extractedText: {
    type: String,
    trim: true
  },
  uploadedFiles: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  }]
}, {
  timestamps: true
});

analysisResultSchema.index({ companyName: 'text' });
analysisResultSchema.index({ createdAt: -1 });

analysisResultSchema.methods.generateExternalLinks = function() {
  const companyName = encodeURIComponent(this.companyName);
  
  this.externalLinks = {
    googleReviewLink: `https://www.google.com/search?q=${companyName}+reviews`,
    facebookReviewLink: `https://www.facebook.com/search/pages/?q=${companyName}`,
    redditSearchLink: `https://www.reddit.com/search?q=${companyName}`,
    youtubeSearchLink: `https://www.youtube.com/results?search_query=${companyName}`
  };
  
  return this.externalLinks;
};

analysisResultSchema.pre('save', function(next) {
  if (this.isNew) {
    this.generateExternalLinks();
  }
  next();
});

export default mongoose.model('AnalysisResult', analysisResultSchema);
