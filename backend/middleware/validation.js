const Joi = require('joi');

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(50).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const validateProject = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('').max(1000),
    goal: Joi.string().min(5).required(),
    deadline: Joi.date().allow(null),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    status: Joi.string().valid('PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED'),
    tags: Joi.array().items(Joi.string()),
    aiAnalysis: Joi.object().allow(null)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const validateTask = (req, res, next) => {
  const schema = Joi.object({
    projectId: Joi.string().required(),
    parentTaskId: Joi.string().allow(null),
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('').max(1000),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'),
    estimatedHours: Joi.number().min(0),
    actualHours: Joi.number().min(0),
    startDate: Joi.date().allow(null),
    dueDate: Joi.date().allow(null),
    dependencies: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    resources: Joi.array().items(Joi.object({
      name: Joi.string(),
      type: Joi.string(),
      url: Joi.string().uri().allow('')
    })),
    order: Joi.number()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = {
  validateUser,
  validateProject,
  validateTask
};