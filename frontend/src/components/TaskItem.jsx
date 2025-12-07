import React, { useState } from 'react';
import { formatRelativeDate, isOverdue } from '../utils/dateUtils';
import { getPriorityColor, getStatusColor } from '../utils/taskUtils';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { status: newStatus });
  };

  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="task-item editing">
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className="edit-input"
        />
        <textarea
          value={editedTask.description || ''}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          className="edit-textarea"
          placeholder="Description..."
        />
        <div className="edit-actions">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${getStatusColor(task.status)} ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
      <div className="task-checkbox">
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={() => handleStatusChange(task.status === 'done' ? 'todo' : 'done')}
        />
      </div>

      <div className="task-content">
        <h3 className={task.status === 'done' ? 'completed' : ''}>{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}

        <div className="task-meta">
          {task.category && <span className="task-category">{task.category}</span>}
          <span className={`task-priority ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="task-due-date">
              {formatRelativeDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit">✏️</button>
        <button className="btn-icon" onClick={() => onDelete(task.id)} title="Delete">🗑️</button>
      </div>
    </div>
  );
};

export default TaskItem;
