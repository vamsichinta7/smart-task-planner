const mongoose = require('mongoose');

const aiSessionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputGoal: {
    type: String,
    required: true
  },
  processedPrompt: {
    type: String,
    required: true
  },
  llmResponse: {
    type: String,
    required: true
  },
  tasksGenerated: {
    type: Number,
    default: 0
  },
  processingTimeMs: {
    type: Number
  },
  modelUsed: {
    type: String,
    default: 'gpt-4'
  },
  tokensUsed: {
    type: Number
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AISession', aiSessionSchema);