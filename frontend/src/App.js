import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api/axios';
import GoalInput from './components/GoalInput';
import TaskDashboard from './components/TaskDashboard';
import LoadingScreen from './components/LoadingScreen';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Footer from './components/Footer';
import './App.css';



function AppContent() {
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token, loading: authLoading, logout } = useAuth();



  const handleGoalSubmit = async (goalData) => {
    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated through AuthContext
      if (!user || !token) {
        console.error('No auth token found. Please log in before generating a task plan.');
        setError('Not authenticated. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      // Step 1: Analyze goal with AI
      const aiResponse = await api.post('/api/ai/analyze-goal', {
        goal: goalData.goal,
        context: goalData.context
      });
console.log('AI Response:', aiResponse.data); 
console.log('First task:', aiResponse.data.tasks[0]);

      // Step 2: Create project
      const projectResponse = await api.post('/api/projects', {
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


      const tasksResponse = await api.post('/api/tasks/bulk', {
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
      
      if (error.response?.status === 401) {
        setError('Authentication expired. Please refresh the page and try again.');
      } else if (error.message?.includes('Network Error') || !error.response) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(error.response?.data?.error || 'Failed to process goal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const response = await api.put(`/api/tasks/${taskId}`, updates);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.response?.data?.error || 'Failed to update task');
    }
  };

  if (loading || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">Smart Task Planner</h1>
          {user && (
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
              <button onClick={logout} className="logout-btn">
                Sign Out
              </button>
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

        {!user && authLoading ? (
          <LoadingScreen type="auth" message="Connecting to AI system..." />
        ) : !user ? (
          <Login />
        ) : !currentProject ? (
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