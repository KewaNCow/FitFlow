import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workoutAPI, exerciseAPI, routeAPI } from '../services/api';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  Search,
  X,
  Dumbbell,
  Clock,
  Route,
  Flame,
  Timer,
  MapPin,
  Bike,
  PersonStanding
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const WorkoutBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [workout, setWorkout] = useState({
    name: '',
    description: '',
    workout_type: 'strength',
    route_id: null,
    exercises: []
  });
  const [allExercises, setAllExercises] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]); // Available routes
  const [selectedRoute, setSelectedRoute] = useState(null); // Currently selected route
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Helper to determine if an exercise is cardio-based
  const isCardioExercise = (exercise) => {
    return exercise?.category === 'cardio' || exercise?.exercise_type === 'cardio';
  };

  // Get the exercise object from allExercises by id
  const getExerciseById = (id) => {
    return allExercises.find(ex => ex.id === id);
  };

  useEffect(() => {
    fetchExercises();
    fetchRoutes();
    if (isEditing) {
      fetchWorkout();
    }
  }, [id]);

  const fetchExercises = async () => {
    try {
      const response = await exerciseAPI.getAll({ limit: 100 });
      setAllExercises(response.data.data.exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await routeAPI.getAll();
      setAllRoutes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchWorkout = async () => {
    try {
      const response = await workoutAPI.getById(id);
      const data = response.data.data;
      setWorkout({
        name: data.name,
        description: data.description || '',
        workout_type: data.workout_type || 'strength',
        route_id: data.route_id || null,
        exercises: data.exercises.map(ex => ({
          exerciseId: ex.exercise_id,
          name: ex.name,
          category: ex.category,
          exercise_type: ex.exercise_type,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.rest_time,
          duration: ex.duration,
          distance: ex.distance,
          calories: ex.calories,
          intensity: ex.intensity,
          notes: ex.notes
        }))
      });
      // Set selected route from embedded data if available
      if (data.route_id) {
        setSelectedRoute({
          id: data.route_id,
          name: data.route_name || 'Linked Route',
          distance_km: data.route_distance || 0,
          estimated_duration: data.route_duration || 0,
          activity_type: data.route_activity || ''
        });
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
      navigate('/my-workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exercise) => {
    const isCardio = isCardioExercise(exercise);
    
    setWorkout(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: exercise.id,
          name: exercise.name,
          category: exercise.category,
          exercise_type: exercise.exercise_type,
          // Strength fields
          sets: isCardio ? null : 3,
          reps: isCardio ? null : 10,
          weight: null,
          restTime: isCardio ? null : 60,
          // Cardio fields
          duration: isCardio ? (exercise.default_duration || 1800) : null,
          distance: isCardio ? (exercise.default_distance || null) : null,
          calories: null,
          intensity: isCardio ? 'moderate' : null,
          notes: ''
        }
      ]
    }));
    
    // Auto-update workout type based on exercises
    updateWorkoutType([...workout.exercises, exercise]);
    
    setShowExerciseModal(false);
    setSearchTerm('');
  };

  const updateWorkoutType = (exercises) => {
    if (exercises.length === 0) return;
    
    const cardioCount = exercises.filter(ex => isCardioExercise(ex)).length;
    const strengthCount = exercises.length - cardioCount;
    
    let newType = 'strength';
    if (cardioCount > 0 && strengthCount === 0) {
      newType = 'cardio';
    } else if (cardioCount > 0 && strengthCount > 0) {
      newType = 'mixed';
    }
    
    setWorkout(prev => ({ ...prev, workout_type: newType }));
  };

  const handleRemoveExercise = (index) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!workout.name.trim()) {
      setError('Workout name is required');
      return;
    }

    setSaving(true);

    try {
      const workoutData = {
        ...workout,
        route_id: selectedRoute?.id || null
      };
      
      if (isEditing) {
        await workoutAPI.update(id, workoutData);
      } else {
        await workoutAPI.create(workoutData);
      }
      navigate('/my-workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      setError('Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.muscle_group?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || ex.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Format duration for display
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // Parse duration from minutes input
  const parseDurationMinutes = (mins) => {
    return mins ? parseInt(mins) * 60 : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link
          to="/my-workouts"
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Workout' : 'Create Workout'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Workout Details */}
        <div className="card p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Workout Name *
              </label>
              <input
                id="name"
                type="text"
                value={workout.name}
                onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder="e.g., Push Day, Full Body, Leg Day"
              />
            </div>
            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                value={workout.description}
                onChange={(e) => setWorkout(prev => ({ ...prev, description: e.target.value }))}
                className="input"
                rows={3}
                placeholder="Describe your workout..."
              />
            </div>
            
            {/* Route Selection */}
            <div>
              <label className="label flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Linked Route (Optional)
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedRoute?.id || ''}
                  onChange={(e) => {
                    const routeId = e.target.value;
                    if (routeId) {
                      const route = allRoutes.find(r => r.id === parseInt(routeId));
                      setSelectedRoute(route);
                    } else {
                      setSelectedRoute(null);
                    }
                  }}
                  className="input flex-1"
                >
                  <option value="">No route linked</option>
                  {allRoutes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name} - {parseFloat(route.distance_km || 0).toFixed(2)} km ({route.activity_type})
                    </option>
                  ))}
                </select>
                <Link
                  to="/routes"
                  className="btn-outline px-3 flex items-center gap-1"
                  title="Create new route"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
              {selectedRoute && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{selectedRoute.name}</p>
                      <p className="text-sm text-blue-700">
                        {parseFloat(selectedRoute.distance_km || 0).toFixed(2)} km
                        {selectedRoute.estimated_duration ? ` • ${selectedRoute.estimated_duration} min` : ''}
                        {selectedRoute.activity_type ? ` • ${selectedRoute.activity_type}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRoute(null)}
                      className="p-1 text-blue-400 hover:text-blue-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Exercises ({workout.exercises.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowExerciseModal(true)}
              className="btn-primary btn-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          </div>

          {workout.exercises.length === 0 ? (
            <div className="card p-8 text-center">
              <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No exercises added yet</p>
              <button
                type="button"
                onClick={() => setShowExerciseModal(true)}
                className="btn-outline btn-sm"
              >
                Add your first exercise
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => {
                const isCardio = isCardioExercise(exercise);
                
                return (
                <div key={index} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 text-gray-400 pt-1">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isCardio 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {isCardio ? 'Cardio' : 'Strength'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {isCardio ? (
                        // Cardio-specific inputs
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                              <Timer className="w-3 h-3" /> Duration (min)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={exercise.duration ? Math.floor(exercise.duration / 60) : ''}
                              onChange={(e) => handleExerciseChange(index, 'duration', parseDurationMinutes(e.target.value))}
                              className="input text-sm py-1.5"
                              placeholder="30"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                              <Route className="w-3 h-3" /> Distance (km)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={exercise.distance || ''}
                              onChange={(e) => handleExerciseChange(index, 'distance', e.target.value ? parseFloat(e.target.value) : null)}
                              className="input text-sm py-1.5"
                              placeholder="5.0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                              <Flame className="w-3 h-3" /> Calories
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={exercise.calories || ''}
                              onChange={(e) => handleExerciseChange(index, 'calories', e.target.value ? parseInt(e.target.value) : null)}
                              className="input text-sm py-1.5"
                              placeholder="300"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Intensity</label>
                            <select
                              value={exercise.intensity || 'moderate'}
                              onChange={(e) => handleExerciseChange(index, 'intensity', e.target.value)}
                              className="input text-sm py-1.5"
                            >
                              <option value="low">Low</option>
                              <option value="moderate">Moderate</option>
                              <option value="high">High</option>
                              <option value="interval">Interval</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        // Strength-specific inputs
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-gray-500">Sets</label>
                            <input
                              type="number"
                              min="1"
                              value={exercise.sets || ''}
                              onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                              className="input text-sm py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Reps</label>
                            <input
                              type="number"
                              min="1"
                              value={exercise.reps || ''}
                              onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                              className="input text-sm py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Weight (kg)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exercise.weight || ''}
                              onChange={(e) => handleExerciseChange(index, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                              className="input text-sm py-1.5"
                              placeholder="--"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Rest (sec)</label>
                            <input
                              type="number"
                              min="0"
                              value={exercise.restTime || ''}
                              onChange={(e) => handleExerciseChange(index, 'restTime', parseInt(e.target.value))}
                              className="input text-sm py-1.5"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary gap-2"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Create Workout'}
              </>
            )}
          </button>
          <Link to="/my-workouts" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      {/* Add Exercise Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Exercise</h3>
              <button
                onClick={() => {
                  setShowExerciseModal(false);
                  setSearchTerm('');
                  setCategoryFilter('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                  autoFocus
                />
              </div>
              {/* Category filter tabs */}
              <div className="flex gap-2 flex-wrap">
                {['', 'strength', 'cardio', 'bodyweight', 'flexibility'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      categoryFilter === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat === '' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              {filteredExercises.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No exercises found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredExercises.map((exercise) => {
                    const isCardio = isCardioExercise(exercise);
                    return (
                    <button
                      key={exercise.id}
                      onClick={() => handleAddExercise(exercise)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCardio ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {isCardio ? (
                          <Timer className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Dumbbell className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{exercise.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isCardio ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {exercise.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {exercise.muscle_group}
                          {exercise.equipment && exercise.equipment !== 'None' && ` • ${exercise.equipment}`}
                        </p>
                      </div>
                    </button>
                  )})}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder;
