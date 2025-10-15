const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');

const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    // Verify project belongs to user
    const project = await Project.findOne({ 
      _id: req.params.projectId, 
      userId: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('dependencies', 'title')
      .sort({ order: 1, createdAt: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new task
router.post('/', auth, validateTask, async (req, res) => {
  try {
    // Verify project belongs to user
    const project = await Project.findOne({ 
      _id: req.body.projectId, 
      userId: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = new Task(req.body);
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Create multiple tasks (for AI generation)
router.post('/bulk', auth, async (req, res) => {
  try {
    const { projectId, tasks } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({ 
      _id: projectId, 
      userId: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Add projectId to each task
    const tasksWithProject = tasks.map(task => ({
      ...task,
      projectId
    }));

    const createdTasks = await Task.insertMany(tasksWithProject);

    res.status(201).json(createdTasks);
  } catch (error) {
    console.error('Bulk create tasks error:', error);
    res.status(500).json({ error: 'Failed to create tasks' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify project belongs to user
    if (task.projectId.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify project belongs to user
    if (task.projectId.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Bulk update task order
router.put('/reorder', auth, async (req, res) => {
  try {
    const { tasks } = req.body; // Array of {id, order}

    const updatePromises = tasks.map(task => 
      Task.findByIdAndUpdate(task.id, { order: task.order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

module.exports = router;