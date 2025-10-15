import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import ProgressChart from './ProgressChart';
import Timeline from './Timeline';
import './TaskDashboard.css';

const TaskDashboard = ({ project, tasks, onTaskUpdate, onNewProject }) => {
  const [view, setView] = useState('board'); // 'board', 'timeline', 'analytics'
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');

  // Calculate project statistics
  console.log('TASKS:', tasks);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedhours || 0), 0);
    const completedHours = tasks
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + Number(t.estimatedhours || 0), 0);

    return {
      total: tasks.length,
      completed,
      inProgress,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      totalHours,
      completedHours,
      remainingHours: totalHours - completedHours
    };
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(task => {
        switch (filter) {
          case 'todo': return task.status === 'TO-DO';
          case 'in-progress': return task.status === 'IN_PROGRESS';
          case 'completed': return task.status === 'COMPLETED';
          case 'high-priority': return ['HIGH', 'CRITICAL'].includes(task.priority);
          default: return true;
        }
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        }
        case 'duration':
          return (Number(b.estimatedhours) || 0) - (Number(a.estimatedhours) || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'order':
        default:
          return (a.order || 0) - (b.order || 0);
      }
    });

    return filtered;
  }, [tasks, filter, sortBy]);

  const handleTaskStatusChange = (taskId, newStatus) => {
    onTaskUpdate(taskId, { 
      status: newStatus,
      completionDate: newStatus === 'COMPLETED' ? new Date() : null
    });
  };

  const handleTaskPriorityChange = (taskId, newPriority) => {
    onTaskUpdate(taskId, { priority: newPriority });
  };

  const exportTasks = () => {
    const csv = [
      ['Title', 'Description', 'Status', 'Priority', 'Estimated Hours', 'Tags'].join(','),
      ...tasks.map(task => [
        task.title,
        task.description || '',
        task.status,
        task.priority,
        task.estimatedhours || 0,
        (task.tags || []).join('; ')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title || 'project'}_tasks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="task-dashboard">
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="project-info">
          <h1 className="project-title">{project.title || 'AI Generated Project'}</h1>
          <p className="project-goal">{project.goal}</p>
        </div>

        <div className="dashboard-actions">
          <button onClick={exportTasks} className="export-btn">
            Export Tasks
          </button>
          <button onClick={onNewProject} className="new-project-btn">
            New Project
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-label">Complete</div>
        </div>
       {/* <div className="stat-card">
          <div className="stat-value">{stats.totalHours}h</div>
          <div className="stat-label">Estimated Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.remainingHours}h</div>
          <div className="stat-label">Remaining</div>
        </div>*/}
      </motion.div>

      {/* Controls */}
      <motion.div
        className="dashboard-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="view-controls">
          <button
            className={`view-btn ${view === 'board' ? 'active' : ''}`}
            onClick={() => setView('board')}
          >
            Board
          </button>
          <button
            className={`view-btn ${view === 'timeline' ? 'active' : ''}`}
            onClick={() => setView('timeline')}
          >
            Timeline
          </button>
          <button
            className={`view-btn ${view === 'analytics' ? 'active' : ''}`}
            onClick={() => setView('analytics')}
          >
            Analytics
          </button>
        </div>

        <div className="filter-controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="high-priority">High Priority</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="order">Default Order</option>
            <option value="priority">Priority</option>
            <option value="duration">Duration</option>
            <option value="status">Status</option>
          </select>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="dashboard-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {view === 'board' && (
          <div className="task-board">
            <div className="task-columns">
              {['TODO', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                <div key={status} className="task-column">
                  <div className="column-header">
                    <h3>{status.replace('_', ' ')}</h3>
                    <span className="task-count">
                      {tasks.filter(t => t.status === status).length}
                    </span>
                  </div>
                  <div className="column-tasks">
                    {filteredTasks
                      .filter(task => task.status === status)
                      .map(task => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onStatusChange={handleTaskStatusChange}
                          onPriorityChange={handleTaskPriorityChange}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'timeline' && (
          <Timeline tasks={filteredTasks} />
        )}

        {view === 'analytics' && (
          <ProgressChart tasks={tasks} stats={stats} />
        )}
      </motion.div>
    </div>
  );
};

export default TaskDashboard;
