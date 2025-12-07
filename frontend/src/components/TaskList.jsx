import React, { useState } from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import CategoryFilter from './CategoryFilter';
import { filterTasksBySearch, sortByDueDate } from '../utils/taskUtils';

const TaskList = ({ tasks, categories, onAddTask, onUpdateTask, onDeleteTask, onAddCategory }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDate, setNewDate] = useState('');

  const filteredTasks = filterTasksBySearch(
    selectedCategory === 'all'
      ? tasks
      : tasks.filter(t => t.category === selectedCategory),
    searchQuery
  );

  const sortedTasks = sortByDueDate(filteredTasks);

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedTasks(new Set());
    setShowDatePicker(false);
  };

  const handleToggleTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleReschedule = () => {
    if (selectedTasks.size === 0) {
      alert('Please select at least one task to reschedule');
      return;
    }
    setShowDatePicker(true);
  };

  const handleConfirmReschedule = () => {
    if (!newDate) {
      alert('Please select a date');
      return;
    }

    selectedTasks.forEach(taskId => {
      onUpdateTask(taskId, { dueDate: newDate });
    });

    alert(`${selectedTasks.size} task(s) rescheduled to ${newDate}`);
    setSelectedTasks(new Set());
    setShowDatePicker(false);
    setNewDate('');
    setSelectionMode(false);
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>My Tasks</h2>
        <div className="header-actions">
          {!selectionMode && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
          <button
            className={`btn-selection ${selectionMode ? 'active' : ''}`}
            onClick={handleToggleSelectionMode}
          >
            {selectionMode ? 'Cancel Selection' : '📅 Reschedule Tasks'}
          </button>
        </div>
      </div>

      {showForm && (
        <TaskForm
          categories={categories}
          onSubmit={(task) => {
            onAddTask(task);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {selectionMode && (
        <div className="reschedule-controls">
          <div className="reschedule-info">
            <span className="selected-count">{selectedTasks.size} task(s) selected</span>
            <button
              className="btn-reschedule"
              onClick={handleReschedule}
              disabled={selectedTasks.size === 0}
            >
              Choose New Date
            </button>
          </div>
          {showDatePicker && (
            <div className="date-picker-modal">
              <label htmlFor="newDate">Select new due date:</label>
              <input
                type="date"
                id="newDate"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="date-input"
              />
              <div className="modal-actions">
                <button className="btn-confirm" onClick={handleConfirmReschedule}>
                  Confirm Reschedule
                </button>
                <button className="btn-cancel-modal" onClick={() => setShowDatePicker(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="task-controls">
        <input
          type="text"
          placeholder="Search tasks..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCategory={onAddCategory}
        />
      </div>

      <div className="task-list">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create your first task to get started!</p>
          </div>
        ) : (
          sortedTasks.map(task => (
            <div key={task.id} className={`task-list-item-wrapper ${selectionMode ? 'selection-mode' : ''}`}>
              {selectionMode && (
                <div className="selection-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={() => handleToggleTask(task.id)}
                    id={`select-${task.id}`}
                  />
                </div>
              )}
              <TaskItem
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
