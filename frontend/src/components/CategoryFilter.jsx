import React, { useState } from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory, onAddCategory }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      const success = onAddCategory(newCategory.trim());
      if (success) {
        setNewCategory('');
        setShowAddForm(false);
      } else {
        alert('Category already exists');
      }
    }
  };

  return (
    <div className="category-filter">
      <div className="category-chips">
        <button
          className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          All Tasks
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
        <button
          className="category-chip add-category"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          + Add
        </button>
      </div>

      {showAddForm && (
        <form className="add-category-form" onSubmit={handleAddCategory}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            autoFocus
          />
          <button type="submit" className="btn-small">Add</button>
          <button
            type="button"
            className="btn-small"
            onClick={() => {
              setShowAddForm(false);
              setNewCategory('');
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default CategoryFilter;
