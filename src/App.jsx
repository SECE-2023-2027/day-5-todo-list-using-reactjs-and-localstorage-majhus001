import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCalendar, FiFlag, FiCheck, FiX } from 'react-icons/fi';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [searchTerm, setSearchTerm] = useState('');

  // Load todos from localStorage on initial render
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input,
        completed: false,
        dueDate: dueDate || null,
        priority: priority,
        createdAt: new Date().toISOString()
      }]);
      setInput('');
      setDueDate('');
      setPriority('medium');
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setDueDate(todo.dueDate || '');
    setPriority(todo.priority || 'medium');
  };

  const saveEdit = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { 
        ...todo, 
        text: editText,
        dueDate: dueDate || null,
        priority: priority
      } : todo
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    // Filter by status
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    
    // Filter by search term if it exists
    if (searchTerm) {
      return todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  // Sort todos: incomplete first, then by priority (high > medium > low), then by due date
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <h1 className="text-3xl font-bold text-white">Todo List</h1>
          <p className="text-blue-100 mt-1">Get things done, one task at a time</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-grow relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="What needs to be done?"
                className="w-full px-5 py-3 border-0 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={addTodo}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center bg-gray-100 rounded-lg p-2">
              <FiCalendar className="text-gray-500 ml-2 mr-3" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 text-sm text-gray-700"
              />
            </div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-gray-100 border-0 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search todos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Active ({activeTodosCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Completed ({completedTodosCount})
            </button>
          </div>

          <ul className="divide-y divide-gray-200 mb-6">
            {sortedTodos.length === 0 ? (
              <li className="py-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-gray-500">No tasks found. Add a new task above!</p>
              </li>
            ) : (
              sortedTodos.map(todo => (
                <li key={todo.id} className="py-4">
                  {editingId === todo.id ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center bg-gray-100 rounded-lg p-2">
                          <FiCalendar className="text-gray-500 ml-2 mr-3" />
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-transparent border-0 focus:ring-0 text-sm text-gray-700"
                          />
                        </div>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="bg-gray-100 border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="mt-1 h-5 w-5 text-blue-500 rounded focus:ring-blue-400"
                      />
                      <div className="ml-3 flex-grow">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                          >
                            {todo.text}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(todo)}
                              className="text-blue-500 hover:text-blue-700 focus:outline-none p-1"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-red-500 hover:text-red-700 focus:outline-none p-1"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {todo.dueDate && (
                            <span className="flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              <FiCalendar className="mr-1" />
                              {new Date(todo.dueDate).toLocaleDateString()}
                              {new Date(todo.dueDate) < new Date() && !todo.completed && (
                                <span className="ml-1 text-red-500">(overdue)</span>
                              )}
                            </span>
                          )}
                          {todo.priority && (
                            <span className={`flex items-center text-xs px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>
                              <FiFlag className="mr-1" />
                              {todo.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>

          {todos.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                {activeTodosCount} {activeTodosCount === 1 ? 'item' : 'items'} left
              </span>
              <div className="flex gap-3">
                <button
                  onClick={clearCompleted}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Clear completed
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all tasks?')) {
                      setTodos([]);
                    }
                  }}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Delete all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}