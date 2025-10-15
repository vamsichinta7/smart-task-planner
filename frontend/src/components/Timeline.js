import React from 'react';

// Expects: tasks = [ { title, estimated_hours, priority, ... } ]
export default function Timeline({ tasks }) {
  if (!tasks || !tasks.length) return null;

  return (
    <div className="glass-card p-4 mb-4">
      <h4 className="text-white mb-2">Project Timeline</h4>
      <ul className="list-none p-0 m-0">
        {tasks.map((task, idx) => (
          <li
            key={idx}
            style={{
              marginBottom: '8px',
              borderLeft: `4px solid ${
                task.priority === 'CRITICAL' ? '#ef4444'
                : task.priority === 'HIGH' ? '#f59e42'
                : task.priority === 'MEDIUM' ? '#fde68a'
                : '#10b981'
              }`,
              paddingLeft: '10px'
            }}
          >
            <span style={{ color: '#fff', fontWeight: 500 }}>{task.title}</span>
            <span style={{ color: '#93c5fd', marginLeft: 8 }}>{task.estimated_hours}h</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
