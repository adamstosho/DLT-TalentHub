const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  talent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a talent can't save the same job twice
savedJobSchema.index({ talent: 1, job: 1 }, { unique: true });

// Index for querying saved jobs by talent
savedJobSchema.index({ talent: 1, createdAt: -1 });

module.exports = mongoose.model('SavedJob', savedJobSchema); 