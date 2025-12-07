import React from 'react';

const Navbar = ({ currentView, onViewChange, notificationsEnabled, onNotificationToggle }) => {
  const views = [
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'planner', label: 'Daily Planner', icon: '📅' },
    { id: 'brainstorm', label: 'Brainstorm', icon: '💡' },
    { id: 'calendar', label: 'Calendar', icon: '📆' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Task Manager</h1>
      </div>
      <div className="navbar-menu">
        {views.map(view => (
          <button
            key={view.id}
            className={`nav-item ${currentView === view.id ? 'active' : ''}`}
            onClick={() => onViewChange(view.id)}
          >
            <span className="nav-icon">{view.icon}</span>
            <span className="nav-label">{view.label}</span>
          </button>
        ))}
        <button
          className={`nav-item notification-toggle ${notificationsEnabled ? 'active' : ''}`}
          onClick={onNotificationToggle}
          title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
        >
          <span className="nav-icon">{notificationsEnabled ? '🔔' : '🔕'}</span>
          <span className="nav-label">Alerts</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
