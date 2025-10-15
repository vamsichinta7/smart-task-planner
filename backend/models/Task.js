const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
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
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'],
    default: 'TODO'
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  aiGenerated: {
    type: Boolean,
    default: true
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  dependencies: [String],
  tags: [String],
  resources: [{
    name: String,
    type: String,
    url: String
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save hook to set completion date
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'COMPLETED' && !this.completionDate) {
    this.completionDate = new Date();
  }
  next();
});

// Post-save hook to update project progress
taskSchema.post('save', async function(doc) {
  if (this.isModified('status')) {
    const Project = mongoose.model('Project');
    const project = await Project.findById(doc.projectId);
    if (project) {
      await project.calculateProgress();
    }
  }
});

module.exports = mongoose.model('Task', taskSchema);