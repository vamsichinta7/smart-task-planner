import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalInput from './components/GoalInput';
import TaskDashboard from './components/TaskDashboard';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Footer from './components/Footer';
import './App.css';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function AppContent() {
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  // Set axios auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const handleGoalSubmit = async (goalData) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Analyze goal with AI
      const aiResponse = await axios.post('/api/ai/analyze-goal', {
        goal: goalData.goal,
        context: goalData.context
      });
console.log('AI Response:', aiResponse.data); 
console.log('First task:', aiResponse.data.tasks[0]);

      // Step 2: Create project
      const projectResponse = await axios.post('/api/projects', {
        title: goalData.title || 'AI Generated Project',
        goal: goalData.goal,
        deadline: goalData.deadline,
        priority: 'HIGH',
        aiAnalysis: aiResponse.data.analysis
      });

      const project = projectResponse.data;
      setCurrentProject(project);

      // Step 3: Create tasks in bulk
const tasksToCreate = aiResponse.data.tasks.map((task, index) => ({
  ...task,
  projectId: project._id,
  order: index,
  estimatedHours: task.estimated_hours // ✅ This adds the field
}));



 console.log('Final tasks to send:', tasksToCreate);


      const tasksResponse = await axios.post('/api/tasks/bulk', {
        projectId: project._id,
        tasks: tasksToCreate
      });
      console.log('Payload to /api/tasks/bulk:', {
  projectId: project._id,
  tasks: tasksToCreate
});

      console.log('Tasks from backend:', tasksResponse.data); 

      setTasks(tasksResponse.data);

    } catch (error) {
      console.error('Error processing goal:', error);
      setError(error.response?.data?.error || 'Failed to process goal');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, updates);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.response?.data?.error || 'Failed to update task');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">Smart Task Planner</h1>
          {user && (
            <div className="user-info">
              <span>Welcome User!</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {!currentProject ? (
          <GoalInput onSubmit={handleGoalSubmit} />
        ) : (
          <TaskDashboard
            project={currentProject}
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onNewProject={() => {
              setCurrentProject(null);
              setTasks([]);
            }}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;