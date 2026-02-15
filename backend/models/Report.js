import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  reporterEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  reportType: {
    type: String,
    enum: ['scam', 'fraud', 'misleading', 'spam', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  evidence: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }
}, {
  timestamps: true
});

reportSchema.index({ reportType: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

reportSchema.statics.getScamReportCount = async function(companyName) {
  return await this.countDocuments({
    companyName: companyName,
    reportType: { $in: ['scam', 'fraud'] },
    status: { $in: ['verified', 'under_review'] }
  });
};

export default mongoose.model('Report', reportSchema);
