import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Shield, 
  Users, 
  Dumbbell, 
  Calendar, 
  Target,
  Wrench,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchItems();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'workouts':
          response = await adminAPI.getWorkouts();
          break;
        case 'programs':
          response = await adminAPI.getPrograms();
          break;
        case 'exercises':
          response = await adminAPI.getExercises();
          break;
        case 'equipment':
          response = await adminAPI.getEquipment();
          break;
        default:
          return;
      }
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setShowModal(true);
    setError('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (activeTab) {
        case 'workouts':
          await adminAPI.deleteWorkout(id);
          break;
        case 'programs':
          await adminAPI.deleteProgram(id);
          break;
        case 'exercises':
          await adminAPI.deleteExercise(id);
          break;
        case 'equipment':
          await adminAPI.deleteEquipment(id);
          break;
      }
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (editingItem) {
        switch (activeTab) {
          case 'workouts':
            response = await adminAPI.updateWorkout(editingItem.id, formData);
            break;
          case 'programs':
            response = await adminAPI.updateProgram(editingItem.id, formData);
            break;
          case 'exercises':
            response = await adminAPI.updateExercise(editingItem.id, formData);
            break;
          case 'equipment':
            response = await adminAPI.updateEquipment(editingItem.id, formData);
            break;
        }
        setItems(prev => prev.map(item => 
          item.id === editingItem.id ? response.data.data : item
        ));
      } else {
        switch (activeTab) {
          case 'workouts':
            response = await adminAPI.createWorkout(formData);
            break;
          case 'programs':
            response = await adminAPI.createProgram(formData);
            break;
          case 'exercises':
            response = await adminAPI.createExercise(formData);
            break;
          case 'equipment':
            response = await adminAPI.createEquipment(formData);
            break;
        }
        setItems(prev => [response.data.data, ...prev]);
      }
      setShowModal(false);
      fetchStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving item');
    }
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case 'workouts':
        return { name: '', description: '', workout_type: 'strength' };
      case 'programs':
        return { name: '', description: '', duration_weeks: '', difficulty: 'intermediate' };
      case 'exercises':
        return { name: '', description: '', category: 'strength', muscle_group: '', difficulty: 'intermediate' };
      case 'equipment':
        return { name: '', description: '', category: 'other' };
      default:
        return {};
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'programs', label: 'Programs', icon: Calendar },
    { id: 'exercises', label: 'Exercises', icon: Target },
    { id: 'equipment', label: 'Equipment', icon: Wrench },
  ];

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">Manage predefined content for all users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                <p className="text-sm text-gray-500">Users</p>
              </div>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.predefinedWorkouts}</p>
                <p className="text-sm text-gray-500">Workouts</p>
              </div>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.predefinedPrograms}</p>
                <p className="text-sm text-gray-500">Programs</p>
              </div>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.publicExercises}</p>
                <p className="text-sm text-gray-500">Exercises</p>
              </div>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.publicEquipment}</p>
                <p className="text-sm text-gray-500">Equipment</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tabs */}
      {activeTab !== 'overview' && (
        <>
          {/* Add Button */}
          <div className="flex justify-end mb-4">
            <button onClick={handleCreate} className="btn-primary gap-2">
              <Plus className="w-5 h-5" />
              Add {activeTab.slice(0, -1)}
            </button>
          </div>

          {/* Items List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No {activeTab} found</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">
                        {activeTab === 'exercises' ? 'Category' : activeTab === 'equipment' ? 'Category' : 'Type'}
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{item.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="badge bg-gray-100 text-gray-700">
                            {item.workout_type || item.category || item.difficulty || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              {activeTab === 'workouts' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.workout_type || 'strength'}
                    onChange={(e) => setFormData({ ...formData, workout_type: e.target.value })}
                    className="input"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="mixed">Mixed</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>
              )}

              {activeTab === 'programs' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                    <input
                      type="number"
                      value={formData.duration_weeks || ''}
                      onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                      className="input"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty || 'intermediate'}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="input"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'exercises' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category || 'strength'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input"
                    >
                      <option value="strength">Strength</option>
                      <option value="cardio">Cardio</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="bodyweight">Bodyweight</option>
                      <option value="machine">Machine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Muscle Group</label>
                    <input
                      type="text"
                      value={formData.muscle_group || ''}
                      onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                      className="input"
                      placeholder="e.g., Chest, Back, Legs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty || 'intermediate'}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="input"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'equipment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category || 'other'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="free_weights">Free Weights</option>
                    <option value="machines">Machines</option>
                    <option value="cardio">Cardio</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="bands_cables">Bands & Cables</option>
                    <option value="accessories">Accessories</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
