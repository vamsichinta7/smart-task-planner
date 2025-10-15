const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true
  },
  goal: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNING'
  },
  aiAnalysis: {
    goalClarity: Number,
    complexityLevel: String,
    estimatedTotalTime: Number,
    keyChallenges: [String],
    successCriteria: [String]
  },
  tags: [String],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Calculate progress based on completed tasks
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ projectId: this._id });

  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
  const progress = Math.round((completedTasks.length / tasks.length) * 100);

  this.progress = progress;
  await this.save();

  return progress;
};

module.exports = mongoose.model('Project', projectSchema);