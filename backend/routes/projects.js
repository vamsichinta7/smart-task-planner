const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');

const router = express.Router();

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project with tasks
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: project._id })
      .sort({ order: 1, createdAt: 1 });

    res.json({ project, tasks });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', auth, validateProject, async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      userId: req.user.userId
    };

    const project = new Project(projectData);
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete associated tasks
    await Task.deleteMany({ projectId: req.params.id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Create project AND save AI-generated tasks
router.post('/with-tasks', auth, async (req, res) => {
  try {
    const { project: projectData, tasks: aiTasks } = req.body;

    // Validate
    if (!projectData || !aiTasks || !Array.isArray(aiTasks)) {
      return res.status(400).json({ error: 'Project and tasks are required' });
    }

    // 1. Create project
    const project = new Project({
      ...projectData,
      userId: req.user.userId
    });
    await project.save();

    // 2. Save tasks
    const tasksToSave = aiTasks.map(task => ({
      projectId: project._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimatedHours: task.estimated_hours, // ✅ This maps the AI field to your DB
      dependencies: task.dependencies,
      tags: task.tags,
      resources: task.resources_needed?.map(name => ({ name })),
      aiConfidence: task.ai_confidence,
      aiGenerated: true
    }));

    await Task.insertMany(tasksToSave);

    // 3. Send back response
    res.status(201).json({ project, tasks: tasksToSave });
  } catch (error) {
    console.error('Create project with tasks error:', error);
    res.status(500).json({ error: 'Failed to create project with tasks' });
  }
});

module.exports = router;