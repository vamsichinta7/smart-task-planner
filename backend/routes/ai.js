const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Project = require('../models/Project');
const Task = require('../models/Task');
const AISession = require('../models/AISession');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for task breakdown
const SYSTEM_PROMPT = `You are an expert project manager and AI task planner. Your role is to break down user goals into actionable, well-structured tasks with realistic timelines and dependencies.

TASK BREAKDOWN PRINCIPLES:
1. Create specific, measurable, achievable tasks
2. Estimate realistic timelines based on complexity
3. Identify logical dependencies between tasks
4. Prioritize tasks based on criticality and impact
5. Consider resource requirements and constraints
6. Provide buffer time for potential challenges

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "project_analysis": {
    "goal_clarity": 8,
    "complexity_level": "HIGH",
    "estimated_total_time": 320,
    "key_challenges": ["challenge1", "challenge2"],
    "success_criteria": ["criteria1", "criteria2"]
  },
  "tasks": [
    {
      "title": "Task Title",
      "description": "Detailed task description",
      "priority": "HIGH",
      "estimated_hours": 40,
      "dependencies": [],
      "tags": ["tag1", "tag2"],
      "resources_needed": ["resource1"],
      "ai_confidence": 0.9
    }
  ]
}`;

// Mock AI response for fallback
const getMockResponse = (goal) => {
  const mockResponses = {
    "mobile app": {
      project_analysis: {
        goal_clarity: 8,
        complexity_level: "HIGH",
        estimated_total_time: 480,
        key_challenges: ["Tight timeline", "Cross-platform compatibility", "User acquisition"],
        success_criteria: ["App published on stores", "100+ users", "Core features working"]
      },
      tasks: [
        { title: "Project Setup and Planning", description: "Set up development environment, choose tech stack, create project structure", priority: "CRITICAL", estimated_hours: 16, dependencies: [], tags: ["setup", "planning"], resources_needed: ["Development tools"], ai_confidence: 0.95 },
        { title: "UI/UX Design Creation", description: "Create wireframes, mockups, and user flow designs", priority: "HIGH", estimated_hours: 60, dependencies: [], tags: ["design", "ui"], resources_needed: ["Design tools"], ai_confidence: 0.90 },
        { title: "Backend API Development", description: "Build REST API for core functionality", priority: "CRITICAL", estimated_hours: 120, dependencies: [], tags: ["backend", "api"], resources_needed: ["Cloud hosting", "Database"], ai_confidence: 0.85 },
        { title: "Frontend Development", description: "Implement mobile app with core features", priority: "CRITICAL", estimated_hours: 180, dependencies: [], tags: ["frontend", "mobile"], resources_needed: ["Mobile dev tools"], ai_confidence: 0.80 },
        { title: "Testing and QA", description: "Comprehensive testing and bug fixes", priority: "HIGH", estimated_hours: 80, dependencies: [], tags: ["testing", "qa"], resources_needed: ["Testing tools"], ai_confidence: 0.85 },
        { title: "Deployment and Launch", description: "Deploy app and submit to app stores", priority: "CRITICAL", estimated_hours: 24, dependencies: [], tags: ["deployment", "launch"], resources_needed: ["App store accounts"], ai_confidence: 0.75 }
      ]
    },
    "default": {
      project_analysis: { goal_clarity: 7, complexity_level: "MEDIUM", estimated_total_time: 120, key_challenges: ["Time management", "Resource allocation"], success_criteria: ["Goal achieved", "Quality maintained"] },
      tasks: [
        { title: "Initial Planning", description: "Plan and organize the project approach", priority: "HIGH", estimated_hours: 8, dependencies: [], tags: ["planning"], resources_needed: ["Planning tools"], ai_confidence: 0.85 },
        { title: "Research and Analysis", description: "Conduct necessary research for the project", priority: "MEDIUM", estimated_hours: 24, dependencies: [], tags: ["research"], resources_needed: ["Research materials"], ai_confidence: 0.80 },
        { title: "Implementation", description: "Execute the main work of the project", priority: "HIGH", estimated_hours: 60, dependencies: [], tags: ["implementation"], resources_needed: ["Development tools"], ai_confidence: 0.75 },
        { title: "Review and Finalize", description: "Review work and make final adjustments", priority: "MEDIUM", estimated_hours: 16, dependencies: [], tags: ["review"], resources_needed: ["Review tools"], ai_confidence: 0.85 },
        { title: "Documentation and Delivery", description: "Document results and deliver final output", priority: "HIGH", estimated_hours: 12, dependencies: [], tags: ["documentation"], resources_needed: ["Documentation tools"], ai_confidence: 0.90 }
      ]
    }
  };

  const goalLower = goal.toLowerCase();
  if (goalLower.includes('app') || goalLower.includes('mobile') || goalLower.includes('software')) {
    return mockResponses["mobile app"];
  }
  return mockResponses["default"];
};

// Analyze goal and generate tasks
router.post('/analyze-goal', auth, async (req, res) => {
  const startTime = Date.now();
  try {
    const { goal, context = {} } = req.body;

    if (!goal || goal.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a valid goal description' });
    }

    let aiResponse;
    let tokensUsed = 0;

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Goal: ${goal}
Context: ${JSON.stringify(context)}
${SYSTEM_PROMPT}

Please analyze this goal and return a JSON response with project_analysis and tasks as specified.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Raw Gemini response:", text);

        // ✅ Safe JSON extraction
        let jsonString;
        const jsonMatch = text.match(/```json([\s\S]*?)```/i);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1].trim();
        } else {
          // fallback if no backticks
          jsonString = text.replace(/^```\s*/, '').replace(/```$/, '').trim();
        }

        aiResponse = JSON.parse(jsonString);
        tokensUsed = response.usageMetadata?.totalTokenCount || 0;
      } catch (apiError) {
        console.error('Gemini API error:', apiError);
        aiResponse = getMockResponse(goal);
      }
    } else {
      aiResponse = getMockResponse(goal);
    }

    const processingTime = Date.now() - startTime;

    const aiSession = new AISession({
      projectId: null,
      userId: req.user.userId,
      inputGoal: goal,
      processedPrompt: `Goal: ${goal}`,
      llmResponse: JSON.stringify(aiResponse),
      tasksGenerated: aiResponse.tasks?.length || 0,
      processingTimeMs: processingTime,
      tokensUsed,
      success: true
    });

    await aiSession.save();

    res.json({
      success: true,
      aiSessionId: aiSession._id,
      processingTime,
      tokensUsed,
      analysis: aiResponse.project_analysis,
      tasks: aiResponse.tasks
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    try {
      const aiSession = new AISession({
        projectId: null,
        userId: req.user.userId,
        inputGoal: req.body.goal || '',
        processedPrompt: `Goal: ${req.body.goal || ''}`,
        llmResponse: '{}',
        processingTimeMs: Date.now() - startTime,
        success: false,
        errorMessage: error.message
      });
      await aiSession.save();
    } catch (saveError) {
      console.error('Failed to save AI session:', saveError);
    }

    res.status(500).json({
      error: 'Failed to analyze goal',
      message: 'Our AI is currently experiencing issues. Please try again later.'
    });
  }
});

// Get AI session history
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await AISession.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (error) {
    console.error('Get AI sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch AI sessions' });
  }
});

module.exports = router;
