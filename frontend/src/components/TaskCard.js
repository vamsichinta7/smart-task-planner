import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './TaskCard.css';

const TaskCard = ({ task, onStatusChange, onPriorityChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return '#6b7280';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'COMPLETED': return '#22c55e';
      case 'REVIEW': return '#a855f7';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleStatusClick = () => {
    const statusFlow = {
      'TODO': 'IN_PROGRESS',
      'IN_PROGRESS': 'COMPLETED',
      'COMPLETED': 'TODO'
    };
    onStatusChange(task._id, statusFlow[task.status] || 'TODO');
  };

  return (
    <motion.div
      className={`task-card ${task.status.toLowerCase()}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="task-card-header">
        <div className="task-meta">
          <div
            className="priority-indicator"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          />
          <select
            value={task.priority}
            onChange={(e) => onPriorityChange(task._id, e.target.value)}
            className="priority-select"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <button
          className="status-btn"
          onClick={handleStatusClick}
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status === 'TODO' && '○'}
          {task.status === 'IN_PROGRESS' && '◐'}
          {task.status === 'COMPLETED' && '●'}
          {task.status === 'REVIEW' && '◯'}
        </button>
      </div>

      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>

        {task.description && (
          <p className={`task-description ${isExpanded ? 'expanded' : ''}`}>
            {task.description}
          </p>
        )}

        {task.description && task.description.length > 100 && (
          <button
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}

        <div className="task-details">
          {task.estimatedHours && (
            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <span>{task.estimatedHours}h estimated</span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.map(tag => (
                <span key={tag} className="task-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {task.dependencies && task.dependencies.length > 0 && (
            <div className="dependencies">
              <span className="detail-icon">🔗</span>
              <span>{task.dependencies.length} dependencies</span>
            </div>
          )}

          {task.aiConfidence && (
            <div className="ai-confidence">
              <span className="detail-icon">🤖</span>
              <span>{Math.round(task.aiConfidence * 100)}% confidence</span>
            </div>
          )}
        </div>
      </div>

      {task.completionDate && (
        <div className="completion-date">
          Completed on {new Date(task.completionDate).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;