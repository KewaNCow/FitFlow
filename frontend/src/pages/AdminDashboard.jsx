import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  AlertCircle,
  Flame,
  Clock,
  TrendingUp,
  Star,
  MapPin,
  Activity,
  UserPlus,
  BarChart3,
  Search,
  GripVertical,
  Timer,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

// Days of the week for program scheduling
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Mapping from plural tab names to singular translation keys
const TAB_TO_SINGULAR = {
  workouts: 'workout',
  programs: 'program',
  exercises: 'exercise',
  equipment: 'equipment'
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  
  // State for workout exercises and program workouts
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [programWorkouts, setProgramWorkouts] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [workoutSearch, setWorkoutSearch] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
  
  // State for enhanced workout/program editing
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0); // For program workout day selection

  useEffect(() => {
    fetchStats();
    fetchAllExercises();
    fetchAllWorkouts();
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

  const fetchAllExercises = async () => {
    try {
      const response = await adminAPI.getExercises();
      setAllExercises(response.data.data || []);
    } catch (error) {
      console.error('Error fetching all exercises:', error);
    }
  };

  const fetchAllWorkouts = async () => {
    try {
      const response = await adminAPI.getWorkouts();
      setAllWorkouts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching all workouts:', error);
    }
  };

  const fetchWorkoutExercises = async (workoutId) => {
    try {
      const response = await adminAPI.getWorkoutExercises(workoutId);
      setWorkoutExercises(response.data.data || []);
    } catch (error) {
      console.error('Error fetching workout exercises:', error);
      setWorkoutExercises([]);
    }
  };

  const fetchProgramWorkouts = async (programId) => {
    try {
      const response = await adminAPI.getProgramWorkouts(programId);
      setProgramWorkouts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching program workouts:', error);
      setProgramWorkouts([]);
    }
  };

  const handleAddExerciseToWorkout = async (exercise) => {
    if (!editingItem?.id) return;
    
    // Check if exercise is cardio type
    const isCardio = exercise.category === 'cardio' || exercise.exercise_type === 'cardio';
    
    try {
      const response = await adminAPI.addWorkoutExercise(editingItem.id, {
        exercise_id: exercise.id,
        // Strength fields
        sets: isCardio ? null : 3,
        reps: isCardio ? null : 10,
        weight: null,
        rest_time: isCardio ? null : 60,
        // Cardio fields
        duration: isCardio ? 30 : null,
        distance: null,
        calories: null,
        intensity: isCardio ? 'moderate' : null,
        notes: null
      });
      setWorkoutExercises(prev => [...prev, response.data.data]);
      setShowExercisePicker(false);
      setExerciseSearch('');
      // Auto-expand the newly added exercise for configuration
      setExpandedExercise(response.data.data.id);
    } catch (error) {
      console.error('Error adding exercise:', error);
      setError(t('admin.errorSaving'));
    }
  };

  // Helper function to check if exercise is cardio
  const isCardioExercise = (exercise) => {
    return exercise.category === 'cardio' || exercise.exercise_type === 'cardio';
  };

  // Update exercise details in a workout
  const handleUpdateExerciseDetails = async (exerciseId, updates) => {
    if (!editingItem) return;
    try {
      const response = await adminAPI.updateWorkoutExercise(editingItem.id, exerciseId, updates);
      setWorkoutExercises(prev => prev.map(ex => 
        ex.id === exerciseId ? response.data.data : ex
      ));
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  // Update program workout (e.g., change day)
  const handleUpdateProgramWorkout = async (workoutId, updates) => {
    if (!editingItem) return;
    try {
      const response = await adminAPI.updateProgramWorkout(editingItem.id, workoutId, updates);
      setProgramWorkouts(prev => prev.map(w => 
        w.id === workoutId ? response.data.data : w
      ));
    } catch (error) {
      console.error('Error updating program workout:', error);
    }
  };

  // Get workouts for a specific day in the program
  const getWorkoutsForDay = (dayIndex) => {
    return programWorkouts.filter(w => w.day_of_week === dayIndex);
  };

  const handleRemoveExerciseFromWorkout = async (exerciseId) => {
    if (!editingItem) return;
    try {
      await adminAPI.removeWorkoutExercise(editingItem.id, exerciseId);
      setWorkoutExercises(prev => prev.filter(e => e.id !== exerciseId));
    } catch (error) {
      console.error('Error removing exercise:', error);
    }
  };

  const handleAddWorkoutToProgram = async (workout) => {
    if (!editingItem?.id) return;
    
    try {
      const response = await adminAPI.addProgramWorkout(editingItem.id, {
        workout_id: workout.id,
        day_of_week: selectedDay,
        notes: null
      });
      setProgramWorkouts(prev => [...prev, response.data.data]);
      setShowWorkoutPicker(false);
      setWorkoutSearch('');
    } catch (error) {
      console.error('Error adding workout:', error);
      setError(t('admin.errorSaving'));
    }
  };

  const handleRemoveWorkoutFromProgram = async (workoutId) => {
    if (!editingItem) return;
    try {
      await adminAPI.removeProgramWorkout(editingItem.id, workoutId);
      setProgramWorkouts(prev => prev.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Error removing workout:', error);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setWorkoutExercises([]);
    setProgramWorkouts([]);
    setExpandedExercise(null);
    setSelectedDay(0);
    setShowModal(true);
    setError('');
  };

  const handleEdit = async (item) => {
    setEditingItem(item);
    setFormData(item);
    setExpandedExercise(null);
    setSelectedDay(0);
    setShowModal(true);
    setError('');
    
    // Fetch related data when editing
    if (activeTab === 'workouts') {
      await fetchWorkoutExercises(item.id);
    } else if (activeTab === 'programs') {
      await fetchProgramWorkouts(item.id);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;

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

    // Client-side validation
    if (!formData.name || formData.name.trim() === '') {
      setError(t('admin.nameRequired'));
      return;
    }

    if (activeTab === 'programs' && (!formData.duration_weeks || formData.duration_weeks < 1)) {
      setError(t('admin.durationRequired'));
      return;
    }

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
        setShowModal(false);
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
        const newItem = response.data.data;
        setItems(prev => [newItem, ...prev]);
        
        // For workouts and programs, stay in modal and switch to edit mode
        // so user can immediately add exercises/workouts
        if (activeTab === 'workouts' || activeTab === 'programs') {
          setEditingItem(newItem);
          setFormData(newItem);
          // Keep modal open - user is now in edit mode
        } else {
          setShowModal(false);
        }
      }
      fetchStats();
    } catch (error) {
      setError(error.response?.data?.message || t('admin.errorSaving'));
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
    { id: 'overview', label: t('admin.overview'), icon: Shield },
    { id: 'workouts', label: t('admin.workouts'), icon: Dumbbell },
    { id: 'programs', label: t('admin.programs'), icon: Calendar },
    { id: 'exercises', label: t('admin.exercises'), icon: Target },
    { id: 'equipment', label: t('admin.equipment'), icon: Wrench },
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
        </div>
        <p className="text-gray-600">{t('admin.subtitle')}</p>
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
        <div className="space-y-6">
          {/* Content Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                  <p className="text-sm text-gray-500">{t('admin.users')}</p>
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
                  <p className="text-sm text-gray-500">{t('admin.workouts')}</p>
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
                  <p className="text-sm text-gray-500">{t('admin.programs')}</p>
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
                  <p className="text-sm text-gray-500">{t('admin.exercises')}</p>
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
                  <p className="text-sm text-gray-500">{t('admin.equipment')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Statistics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              {t('admin.platformStats')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <p className="text-xs text-gray-500">{t('admin.totalWorkoutsLogged')}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.totalWorkoutLogs?.toLocaleString() || 0}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-500">{t('admin.totalCaloriesBurned')}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.totalCaloriesBurned?.toLocaleString() || 0}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-gray-500">{t('admin.totalMinutesActive')}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.totalMinutesActive?.toLocaleString() || 0}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-gray-500">{t('admin.userCreatedWorkouts')}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.userCreatedWorkouts || 0}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  <p className="text-xs text-gray-500">{t('admin.totalRoutes')}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.totalRoutes || 0}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs text-gray-500">{t('admin.avgRating')}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.avgRating || '–'}</p>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              {t('admin.weeklyActivity')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisWeek || 0}</p>
                    <p className="text-sm text-gray-500">{t('admin.newUsersThisWeek')}</p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsersThisWeek || 0}</p>
                    <p className="text-sm text-gray-500">{t('admin.activeUsersThisWeek')}</p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.workoutsThisWeek || 0}</p>
                    <p className="text-sm text-gray-500">{t('admin.workoutsThisWeek')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Signups */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-green-600" />
                  {t('admin.recentUsers')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">{t('admin.name')}</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 hidden sm:table-cell">{t('admin.email')}</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">{t('admin.joinedOn')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.recentUsers?.length > 0 ? (
                      stats.recentUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <p className="font-medium text-gray-900 text-sm">{user.first_name} {user.last_name}</p>
                          </td>
                          <td className="px-4 py-2 hidden sm:table-cell">
                            <p className="text-sm text-gray-500 truncate max-w-[150px]">{user.email}</p>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <p className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-gray-500 text-sm">
                          {t('admin.noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Most Active Users */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  {t('admin.topUsers')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">{t('admin.name')}</th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">{t('admin.workoutCount')}</th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 hidden sm:table-cell">{t('admin.totalMinutes')}</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 hidden sm:table-cell">{t('admin.totalCalories')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.topUsers?.length > 0 ? (
                      stats.topUsers.filter(u => u.workout_count > 0).map((user, idx) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {idx < 3 && (
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'
                                }`}>
                                  {idx + 1}
                                </span>
                              )}
                              <p className="font-medium text-gray-900 text-sm">{user.first_name} {user.last_name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className="badge bg-primary-100 text-primary-700">{user.workout_count}</span>
                          </td>
                          <td className="px-4 py-2 text-center hidden sm:table-cell">
                            <p className="text-sm text-gray-600">{user.total_minutes?.toLocaleString() || 0}</p>
                          </td>
                          <td className="px-4 py-2 text-right hidden sm:table-cell">
                            <p className="text-sm text-gray-600">{user.total_calories?.toLocaleString() || 0}</p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                          {t('admin.noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Popular Exercises */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                {t('admin.popularExercises')}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">#</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">{t('admin.name')}</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 hidden sm:table-cell">{t('admin.muscleGroup')}</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">{t('admin.usageCount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.popularExercises?.length > 0 ? (
                    stats.popularExercises.map((exercise, idx) => (
                      <tr key={exercise.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-2">
                          <p className="font-medium text-gray-900 text-sm">{exercise.name}</p>
                        </td>
                        <td className="px-4 py-2 hidden sm:table-cell">
                          <span className="badge bg-gray-100 text-gray-700">{exercise.muscle_group || '–'}</span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="badge bg-orange-100 text-orange-700">{exercise.usage_count}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                        {t('admin.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rating Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Rated Workouts */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {t('admin.topRatedWorkouts')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">#</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">{t('admin.name')}</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">{t('admin.avgRating')}</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">{t('admin.ratingCount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.topRatedWorkouts?.length > 0 ? (
                      stats.topRatedWorkouts.map((workout, idx) => (
                        <tr key={workout.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-2">
                            <p className="font-medium text-gray-900 text-sm">{workout.name}</p>
                            <p className="text-xs text-gray-500">{workout.workout_type}</p>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{parseFloat(workout.avg_rating).toFixed(1)}</span>
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="badge bg-gray-100 text-gray-700">{workout.rating_count}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                          {t('admin.noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Rated Programs */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {t('admin.topRatedPrograms')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">#</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">{t('admin.name')}</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">{t('admin.avgRating')}</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">{t('admin.ratingCount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.topRatedPrograms?.length > 0 ? (
                      stats.topRatedPrograms.map((program, idx) => (
                        <tr key={program.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-2">
                            <p className="font-medium text-gray-900 text-sm">{program.name}</p>
                            <p className="text-xs text-gray-500">{program.difficulty}</p>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{parseFloat(program.avg_rating).toFixed(1)}</span>
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="badge bg-gray-100 text-gray-700">{program.rating_count}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                          {t('admin.noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
              {t('admin.add')} {t(`admin.singular.${TAB_TO_SINGULAR[activeTab]}`)}
            </button>
          </div>

          {/* Items List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('admin.noItems', { items: t(`admin.${activeTab}`).toLowerCase() })}</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t('admin.name')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">
                        {activeTab === 'exercises' || activeTab === 'equipment' ? t('admin.category') : t('admin.type')}
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">{t('admin.actions')}</th>
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
                              aria-label={`Edit ${item.name}`}
                            >
                              <Edit className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
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
          <div className={`bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto ${
            (activeTab === 'programs' || activeTab === 'workouts') && editingItem 
              ? 'max-w-2xl' 
              : 'max-w-md'
          }`}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingItem ? t('admin.edit') : t('admin.create')} {t(`admin.${activeTab}`).toLowerCase().slice(0, -1)}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.name')} *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.description')}</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              {activeTab === 'workouts' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.type')}</label>
                    <select
                      value={formData.workout_type || 'strength'}
                      onChange={(e) => setFormData({ ...formData, workout_type: e.target.value })}
                      className="input"
                    >
                      <option value="strength">{t('admin.strength')}</option>
                      <option value="cardio">{t('admin.cardio')}</option>
                      <option value="mixed">{t('admin.mixed')}</option>
                      <option value="flexibility">{t('admin.flexibility')}</option>
                    </select>
                  </div>
                
                  {/* Workout Exercises Section - Only show after creation */}
                  {editingItem && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-500" />
                        {t('admin.workoutExercises')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowExercisePicker(!showExercisePicker)}
                        className="btn-secondary text-sm py-1 px-2 gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        {t('admin.addExercise')}
                      </button>
                    </div>
                    
                    {/* Exercise Picker Dropdown */}
                    {showExercisePicker && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="relative mb-2">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={exerciseSearch}
                            onChange={(e) => setExerciseSearch(e.target.value)}
                            placeholder={t('admin.searchExercises')}
                            className="input pl-9 text-sm"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {allExercises
                            .filter(ex => 
                              ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) &&
                              !workoutExercises.some(we => we.exercise_id === ex.id)
                            )
                            .slice(0, 10)
                            .map(exercise => (
                              <button
                                key={exercise.id}
                                type="button"
                                onClick={() => handleAddExerciseToWorkout(exercise)}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary-50 text-sm flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  {(exercise.category === 'cardio' || exercise.exercise_type === 'cardio') ? (
                                    <Flame className="w-3 h-3 text-orange-500" />
                                  ) : (
                                    <Dumbbell className="w-3 h-3 text-primary-500" />
                                  )}
                                  <span>{exercise.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">{exercise.muscle_group || exercise.category}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Exercise List with Inline Editing */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {workoutExercises.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">{t('admin.noExercisesAdded')}</p>
                      ) : (
                        workoutExercises.map((exercise, idx) => {
                          const isCardio = isCardioExercise(exercise);
                          const isExpanded = expandedExercise === exercise.id;
                          
                          return (
                            <div key={exercise.id} className="bg-gray-50 rounded-lg overflow-hidden">
                              {/* Exercise Header */}
                              <div 
                                className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-100"
                                onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                              >
                                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-500 w-5 flex-shrink-0">{idx + 1}</span>
                                {isCardio ? (
                                  <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                ) : (
                                  <Dumbbell className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{exercise.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {isCardio ? (
                                      <>{exercise.duration || 0} {t('admin.min')} • {exercise.intensity || 'moderate'}</>
                                    ) : (
                                      <>{exercise.sets}×{exercise.reps} {exercise.weight ? `• ${exercise.weight}kg` : ''}</>
                                    )}
                                  </p>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveExerciseFromWorkout(exercise.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                  title={t('admin.removeExercise')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Expanded Configuration Panel */}
                              {isExpanded && (
                                <div className="px-3 pb-3 border-t border-gray-200 bg-white">
                                  {isCardio ? (
                                    /* Cardio Exercise Fields */
                                    <div className="grid grid-cols-2 gap-3 pt-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          <Clock className="w-3 h-3 inline mr-1" />
                                          {t('admin.duration')} ({t('admin.min')})
                                        </label>
                                        <input
                                          type="number"
                                          min="1"
                                          value={exercise.duration || ''}
                                          onChange={(e) => handleUpdateExerciseDetails(exercise.id, { duration: parseInt(e.target.value) || null })}
                                          className="input text-sm py-1"
                                          placeholder="30"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          <MapPin className="w-3 h-3 inline mr-1" />
                                          {t('admin.distance')} (km)
                                        </label>
                                        <input
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          value={exercise.distance || ''}
                                          onChange={(e) => handleUpdateExerciseDetails(exercise.id, { distance: parseFloat(e.target.value) || null })}
                                          className="input text-sm py-1"
                                          placeholder="5.0"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          <Zap className="w-3 h-3 inline mr-1" />
                                          {t('admin.intensity')}
                                        </label>
                                        <select
                                          value={exercise.intensity || 'moderate'}
                                          onChange={(e) => handleUpdateExerciseDetails(exercise.id, { intensity: e.target.value })}
                                          className="input text-sm py-1"
                                        >
                                          <option value="low">{t('admin.intensityLow')}</option>
                                          <option value="moderate">{t('admin.intensityModerate')}</option>
                                          <option value="high">{t('admin.intensityHigh')}</option>
                                          <option value="very_high">{t('admin.intensityVeryHigh')}</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          <Flame className="w-3 h-3 inline mr-1" />
                                          {t('admin.calories')}
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          value={exercise.calories || ''}
                                          onChange={(e) => handleUpdateExerciseDetails(exercise.id, { calories: parseInt(e.target.value) || null })}
                                          className="input text-sm py-1"
                                          placeholder="300"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    /* Strength Exercise Fields */
                                    <div className="grid grid-cols-2 gap-3 pt-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.sets')}</label>
                                        <input
                                          type="number"
                                          min="1"
                                          value={exercise.sets || ''}
                                          onChange={(e) => handleUpdateExerciseDetails(exercise.id, { sets: parseInt(e.target.value) || 3 })}
                                          className="input text-sm py-1"
                                          placeholder="3"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.reps')}</label>
                                        <input
                                          type="number"
                                          min="1"
                                          value={exercise.reps || ''}
                                          onChange={(e) => handleUpdateExerciseDetails(exercise.id, { reps: parseInt(e.target.value) || 10 })}
                                          className="input text-sm py-1"
                                          placeholder="10"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.weight')} (kg)</label>
                                        <input
                                          type="number"
                                          step="0.5"
                                          min="0"
                                          value={exercise.weight || ''}
                                          onChange={(e) => handleUpdateExerciseDetails(exercise.id, { weight: parseFloat(e.target.value) || null })}
                                          className="input text-sm py-1"
                                          placeholder="20"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          <Timer className="w-3 h-3 inline mr-1" />
                                          {t('admin.restTime')} ({t('admin.sec')})
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="5"
                                          value={exercise.rest_time || ''}
                                          onChange={(e) => handleUpdateExerciseDetails(exercise.id, { rest_time: parseInt(e.target.value) || 60 })}
                                          className="input text-sm py-1"
                                          placeholder="60"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Notes field for both types */}
                                  <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('admin.notes')}</label>
                                    <input
                                      type="text"
                                      value={exercise.notes || ''}
                                      onChange={(e) => handleUpdateExerciseDetails(exercise.id, { notes: e.target.value || null })}
                                      className="input text-sm py-1"
                                      placeholder={t('admin.notesPlaceholder')}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  )}
                </>
              )}

              {activeTab === 'programs' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.durationWeeks')}</label>
                    <input
                      type="number"
                      value={formData.duration_weeks || ''}
                      onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                      className="input"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.difficulty')}</label>
                    <select
                      value={formData.difficulty || 'intermediate'}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="input"
                    >
                      <option value="beginner">{t('admin.beginner')}</option>
                      <option value="intermediate">{t('admin.intermediate')}</option>
                      <option value="advanced">{t('admin.advanced')}</option>
                    </select>
                  </div>
                  
                  {/* Program Workouts Section - Only show after creation */}
                  {editingItem && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          {t('admin.weeklySchedule')}
                        </h3>
                      </div>
                      
                      {/* Weekly Schedule Grid */}
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {DAYS.map((day, dayIndex) => {
                          const dayWorkouts = getWorkoutsForDay(dayIndex);
                          return (
                            <div key={day} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700">{t(`admin.days.${day.toLowerCase()}`)}</h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDay(dayIndex);
                                    setShowWorkoutPicker(true);
                                  }}
                                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  {t('admin.addWorkout')}
                                </button>
                              </div>
                              
                              {dayWorkouts.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">{t('admin.restDay')}</p>
                              ) : (
                                <div className="space-y-1">
                                  {dayWorkouts.map((workout) => (
                                    <div key={workout.id} className="flex items-center gap-2 bg-white rounded-lg p-2">
                                      <Dumbbell className="w-4 h-4 text-green-500 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{workout.workout_name}</p>
                                        <p className="text-xs text-gray-500">{workout.workout_type}</p>
                                      </div>
                                      {/* Day Change Dropdown */}
                                      <select
                                        value={workout.day_of_week}
                                        onChange={(e) => handleUpdateProgramWorkout(workout.id, { day_of_week: parseInt(e.target.value) })}
                                        className="text-xs border rounded px-1 py-0.5 bg-white"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {DAYS.map((d, i) => (
                                          <option key={i} value={i}>{t(`admin.days.${d.toLowerCase()}`).slice(0, 3)}</option>
                                        ))}
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveWorkoutFromProgram(workout.id)}
                                        className="p-1 text-gray-400 hover:text-red-500"
                                        title={t('admin.removeWorkout')}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Workout Picker Modal */}
                      {showWorkoutPicker && (
                        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4">
                          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
                            <div className="p-3 border-b flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">
                                {t('admin.addWorkoutTo')} {t(`admin.days.${DAYS[selectedDay].toLowerCase()}`)}
                              </h4>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowWorkoutPicker(false);
                                  setWorkoutSearch('');
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="p-3 border-b">
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  value={workoutSearch}
                                  onChange={(e) => setWorkoutSearch(e.target.value)}
                                  placeholder={t('admin.searchWorkouts')}
                                  className="input pl-9 text-sm"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-2">
                              {allWorkouts
                                .filter(w => w.name.toLowerCase().includes(workoutSearch.toLowerCase()))
                                .slice(0, 15)
                                .map(workout => (
                                  <button
                                    key={workout.id}
                                    type="button"
                                    onClick={() => handleAddWorkoutToProgram(workout)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary-50 text-sm flex items-center gap-3"
                                  >
                                    <Dumbbell className="w-4 h-4 text-green-500" />
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{workout.name}</p>
                                      <p className="text-xs text-gray-500">{workout.workout_type}</p>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                  )}
              </>
            )}

            {activeTab === 'exercises' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.category')} *</label>
                      <select
                        value={formData.category || 'strength'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input"
                      >
                        <option value="strength">{t('admin.strength')}</option>
                        <option value="cardio">{t('admin.cardio')}</option>
                        <option value="flexibility">{t('admin.flexibility')}</option>
                        <option value="bodyweight">{t('admin.bodyweight')}</option>
                        <option value="machine">{t('admin.machine')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.difficulty')}</label>
                      <select
                        value={formData.difficulty || 'intermediate'}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="input"
                      >
                        <option value="beginner">{t('admin.beginner')}</option>
                        <option value="intermediate">{t('admin.intermediate')}</option>
                        <option value="advanced">{t('admin.advanced')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.muscleGroup')}</label>
                      <select
                        value={formData.muscle_group || ''}
                        onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                        className="input"
                      >
                        <option value="">{t('admin.selectMuscleGroup')}</option>
                        <option value="Chest">{t('admin.muscles.chest')}</option>
                        <option value="Back">{t('admin.muscles.back')}</option>
                        <option value="Shoulders">{t('admin.muscles.shoulders')}</option>
                        <option value="Biceps">{t('admin.muscles.biceps')}</option>
                        <option value="Triceps">{t('admin.muscles.triceps')}</option>
                        <option value="Forearms">{t('admin.muscles.forearms')}</option>
                        <option value="Core">{t('admin.muscles.core')}</option>
                        <option value="Quadriceps">{t('admin.muscles.quadriceps')}</option>
                        <option value="Hamstrings">{t('admin.muscles.hamstrings')}</option>
                        <option value="Glutes">{t('admin.muscles.glutes')}</option>
                        <option value="Calves">{t('admin.muscles.calves')}</option>
                        <option value="Full Body">{t('admin.muscles.fullBody')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.equipment')}</label>
                      <select
                        value={formData.equipment || ''}
                        onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                        className="input"
                      >
                        <option value="">{t('admin.selectEquipment')}</option>
                        <option value="None">{t('admin.equipmentOptions.none')}</option>
                        <option value="Barbell">{t('admin.equipmentOptions.barbell')}</option>
                        <option value="Dumbbells">{t('admin.equipmentOptions.dumbbells')}</option>
                        <option value="Kettlebell">{t('admin.equipmentOptions.kettlebell')}</option>
                        <option value="Resistance Band">{t('admin.equipmentOptions.resistanceBand')}</option>
                        <option value="Cable Machine">{t('admin.equipmentOptions.cableMachine')}</option>
                        <option value="Pull-up Bar">{t('admin.equipmentOptions.pullUpBar')}</option>
                        <option value="Bench">{t('admin.equipmentOptions.bench')}</option>
                        <option value="Smith Machine">{t('admin.equipmentOptions.smithMachine')}</option>
                        <option value="TRX">{t('admin.equipmentOptions.trx')}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.instructions')}</label>
                    <textarea
                      value={formData.instructions || ''}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="input"
                      rows={4}
                      placeholder={t('admin.instructionsPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.imageUrl')}</label>
                      <input
                        type="url"
                        value={formData.image_url || ''}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="input"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.videoUrl')}</label>
                      <input
                        type="url"
                        value={formData.video_url || ''}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                        className="input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'equipment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.category')}</label>
                    <select
                      value={formData.category || 'other'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input"
                    >
                      <option value="free_weights">{t('admin.freeWeights')}</option>
                      <option value="machines">{t('admin.machines')}</option>
                      <option value="cardio">{t('admin.cardio')}</option>
                      <option value="bodyweight">{t('admin.bodyweight')}</option>
                      <option value="bands_cables">{t('admin.bandsCables')}</option>
                      <option value="accessories">{t('admin.accessories')}</option>
                      <option value="other">{t('admin.other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.imageUrl')}</label>
                    <input
                      type="url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="input"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-primary flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  {editingItem ? t('admin.update') : t('admin.create')}
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
