import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workoutAPI, workoutLogAPI, exerciseAPI } from '../services/api';
import { 
  ArrowLeft, 
  Play,
  Pause,
  Check,
  Plus,
  Trash2,
  Edit2,
  Timer,
  Dumbbell,
  Save,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ActiveWorkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Workout data
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Active workout state
  const [exercises, setExercises] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Exercise search/add modal
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Create exercise form
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    muscle_group: '',
    category: 'strength',
    equipment: '',
    difficulty: 'intermediate'
  });
  
  // Edit modal
  const [editingSet, setEditingSet] = useState(null);
  const [editValues, setEditValues] = useState({ weight: '', reps: '' });

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  // Search exercises with debounce
  useEffect(() => {
    if (!showAddExercise) return;
    
    const timeoutId = setTimeout(() => {
      fetchAvailableExercises(searchQuery);
    }, 300); // Debounce 300ms
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, showAddExercise]);

  // Timer
  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isPaused]);

  const fetchWorkout = async () => {
    try {
      const response = await workoutAPI.getById(id);
      const workoutData = response.data.data;
      console.log('Workout data:', workoutData);
      console.log('Exercises:', workoutData.exercises);
      setWorkout(workoutData);
      
      // Initialize exercises with tracking structure
      const initialExercises = (Array.isArray(workoutData.exercises) ? workoutData.exercises : []).map(ex => ({
        ...ex,
        completed: false,
        sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
          setNumber: i + 1,
          targetReps: ex.reps || 10,
          targetWeight: ex.weight || 0,
          actualReps: null,
          actualWeight: ex.weight || 0,
          completed: false,
          notes: ''
        }))
      }));
      
      console.log('Initialized exercises:', initialExercises);
      setExercises(initialExercises);
    } catch (error) {
      console.error('Error fetching workout:', error);
      navigate('/my-workouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExercises = async (search = '') => {
    setIsSearching(true);
    try {
      // Use the search endpoint to get all matching exercises
      const response = await exerciseAPI.getAll({ search, limit: 100 });
      console.log('API response:', response.data);
      const exercisesData = response.data.data;
      console.log('Available exercises fetched:', exercisesData);
      
      // Check if exercises are nested in an object with pagination
      const exercises = exercisesData.exercises || exercisesData;
      console.log('Extracted exercises:', exercises);
      
      setAvailableExercises(Array.isArray(exercises) ? exercises : []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setAvailableExercises([]);
    } finally {
      setIsSearching(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const completeSet = (exerciseIndex, setIndex) => {
    setExercises(prev => {
      const updated = [...prev];
      const set = updated[exerciseIndex].sets[setIndex];
      
      if (!set.completed) {
        // Mark as complete with default values if not edited
        set.completed = true;
        if (set.actualReps === null) {
          set.actualReps = set.targetReps;
        }
      } else {
        // Unmark
        set.completed = false;
      }
      
      // Check if all sets complete
      updated[exerciseIndex].completed = updated[exerciseIndex].sets.every(s => s.completed);
      
      return updated;
    });
  };

  const editSet = (exerciseIndex, setIndex) => {
    const set = exercises[exerciseIndex].sets[setIndex];
    setEditingSet({ exerciseIndex, setIndex });
    setEditValues({
      weight: set.actualWeight || set.targetWeight || '',
      reps: set.actualReps || set.targetReps || ''
    });
  };

  const saveSetEdit = () => {
    if (!editingSet) return;
    
    setExercises(prev => {
      const updated = [...prev];
      const set = updated[editingSet.exerciseIndex].sets[editingSet.setIndex];
      set.actualWeight = parseFloat(editValues.weight) || 0;
      set.actualReps = parseInt(editValues.reps) || 0;
      return updated;
    });
    
    setEditingSet(null);
  };

  const addSet = (exerciseIndex) => {
    setExercises(prev => {
      const updated = [...prev];
      const exercise = updated[exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];
      
      exercise.sets.push({
        setNumber: exercise.sets.length + 1,
        targetReps: lastSet?.targetReps || 10,
        targetWeight: lastSet?.targetWeight || 0,
        actualReps: null,
        actualWeight: lastSet?.actualWeight || lastSet?.targetWeight || 0,
        completed: false,
        notes: ''
      });
      
      return updated;
    });
  };

  const removeSet = (exerciseIndex, setIndex) => {
    setExercises(prev => {
      const updated = [...prev];
      if (Array.isArray(updated[exerciseIndex]?.sets)) {
        updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
        // Renumber sets
        updated[exerciseIndex].sets.forEach((set, i) => {
          set.setNumber = i + 1;
        });
      }
      return updated;
    });
  };

  const addExerciseToWorkout = (exercise) => {
    setExercises(prev => [...prev, {
      exercise_id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      completed: false,
      sets: Array.from({ length: 3 }, (_, i) => ({
        setNumber: i + 1,
        targetReps: 10,
        targetWeight: 0,
        actualReps: null,
        actualWeight: 0,
        completed: false,
        notes: ''
      }))
    }]);
    setShowAddExercise(false);
    setSearchQuery('');
  };

  const removeExercise = (exerciseIndex) => {
    if (!window.confirm('Remove this exercise from the workout?')) return;
    setExercises(prev => prev.filter((_, i) => i !== exerciseIndex));
  };

  const finishWorkout = async () => {
    if (!window.confirm('Finish and save this workout?')) return;
    
    setSaving(true);
    try {
      // Calculate actual duration
      const durationMinutes = Math.floor(elapsedTime / 60);
      
      // Prepare workout log data
      const workoutLogData = {
        workoutId: parseInt(id),
        durationMinutes,
        notes: `Completed ${exercises.filter(e => e.completed).length}/${exercises.length} exercises`,
        exercises: exercises.map(ex => ({
          exerciseId: ex.exercise_id,
          sets: (Array.isArray(ex.sets) ? ex.sets.filter(s => s.completed) : []).map(s => ({
            reps: s.actualReps || s.targetReps,
            weight: s.actualWeight || s.targetWeight,
            notes: s.notes
          }))
        }))
      };
      
      await workoutLogAPI.create(workoutLogData);
      navigate('/workout-history', { state: { message: 'Workout saved successfully!' } });
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelWorkout = () => {
    if (!window.confirm('Discard this workout session?')) return;
    navigate(`/my-workouts/${id}`);
  };

  const createNewExercise = async () => {
    try {
      const response = await exerciseAPI.create(newExercise);
      const createdExercise = response.data.data;
      
      // Add the newly created exercise to the workout immediately
      addExerciseToWorkout(createdExercise);
      
      // Reset form and close modal
      setNewExercise({
        name: '',
        description: '',
        muscle_group: '',
        category: 'strength',
        equipment: '',
        difficulty: 'intermediate'
      });
      setShowCreateExercise(false);
      setShowAddExercise(false);
      
      alert('Exercise created and added to workout!');
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Error creating exercise. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!workout || !Array.isArray(exercises) || exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalSetsCompleted = exercises.reduce((sum, ex) => 
    sum + (Array.isArray(ex.sets) ? ex.sets.filter(s => s.completed).length : 0), 0
  );
  const totalSets = exercises.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.length : 0), 0);

  return (
    <div className="page-container max-w-4xl pb-24">
      {/* Header with timer */}
      <div className="sticky top-0 bg-white z-10 pb-4 border-b mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={cancelWorkout}
            className="text-gray-600 hover:text-red-600 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <div className="text-2xl font-mono font-bold text-primary-600">
              {formatTime(elapsedTime)}
            </div>
          </div>
          
          <button
            onClick={finishWorkout}
            disabled={saving}
            className="btn-primary gap-2"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Check className="w-5 h-5" />}
            <span>Finish</span>
          </button>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900">{workout?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalSetsCompleted}/{totalSets} sets completed
        </p>
      </div>

      {/* Exercises list */}
      <div className="space-y-4">
        {exercises.map((exercise, exIdx) => (
          <div key={exIdx} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link 
                  to={`/exercises/${exercise.exercise_id}`}
                  className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {exercise.name}
                </Link>
                <p className="text-sm text-gray-500">{exercise.muscle_group}</p>
              </div>
              <button
                onClick={() => removeExercise(exIdx)}
                className="text-gray-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              {Array.isArray(exercise.sets) && exercise.sets.map((set, setIdx) => (
                <div
                  key={setIdx}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    set.completed
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => completeSet(exIdx, setIdx)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      set.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {set.completed && <Check className="w-5 h-5" />}
                  </button>
                  
                  <div className="flex-1 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 w-12">
                      Set {set.setNumber}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {set.actualReps !== null ? set.actualReps : set.targetReps} reps
                      </span>
                      {set.actualWeight > 0 && (
                        <>
                          <span className="text-gray-400">×</span>
                          <span className="font-medium">{set.actualWeight} kg</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => editSet(exIdx, setIdx)}
                    className="text-gray-400 hover:text-primary-600 p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  {exercise.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(exIdx, setIdx)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add set button */}
            <button
              onClick={() => addSet(exIdx)}
              className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Set
            </button>
          </div>
        ))}
      </div>

      {/* Add exercise button */}
      <button
        onClick={() => setShowAddExercise(true)}
        className="w-full mt-4 btn-secondary gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Exercise
      </button>

      {/* Edit Set Modal */}
      {editingSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Set</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={editValues.weight}
                  onChange={(e) => setEditValues(prev => ({ ...prev, weight: e.target.value }))}
                  className="input-field"
                  step="0.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reps
                </label>
                <input
                  type="number"
                  value={editValues.reps}
                  onChange={(e) => setEditValues(prev => ({ ...prev, reps: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingSet(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={saveSetEdit} className="btn-primary flex-1">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExercise && !showCreateExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Exercise</h3>
              <button onClick={() => {
                setShowAddExercise(false);
                setSearchQuery('');
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field mb-4"
              autoFocus
            />
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">
                {isSearching ? 'Searching...' : `${availableExercises.length} exercise${availableExercises.length !== 1 ? 's' : ''}`}
              </div>
              <button
                onClick={() => setShowCreateExercise(true)}
                className="btn-secondary text-sm gap-1"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
              {availableExercises.length > 0 ? (
                availableExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => addExerciseToWorkout(exercise)}
                    className="w-full p-3 text-left rounded-lg hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{exercise.name}</div>
                    <div className="text-sm text-gray-500">{exercise.muscle_group}</div>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {isSearching ? (
                    <>
                      <LoadingSpinner size="lg" />
                      <p className="mt-2">Searching exercises...</p>
                    </>
                  ) : searchQuery ? (
                    <>
                      <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No exercises found matching "{searchQuery}"</p>
                      <button
                        onClick={() => {
                          setNewExercise(prev => ({ ...prev, name: searchQuery }));
                          setShowCreateExercise(true);
                        }}
                        className="btn-primary mt-4 gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create "{searchQuery}"
                      </button>
                    </>
                  ) : (
                    <>
                      <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>Start typing to search exercises</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Exercise Modal */}
      {showCreateExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Exercise</h3>
              <button 
                onClick={() => {
                  setShowCreateExercise(false);
                  setNewExercise({
                    name: '',
                    description: '',
                    muscle_group: '',
                    category: 'strength',
                    equipment: '',
                    difficulty: 'intermediate'
                  });
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Cable Chest Fly"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newExercise.description}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows="3"
                  placeholder="Brief description of the exercise..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Muscle Group
                  </label>
                  <input
                    type="text"
                    value={newExercise.muscle_group}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, muscle_group: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Chest, Back"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newExercise.category}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="machine">Machine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment
                  </label>
                  <input
                    type="text"
                    value={newExercise.equipment}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, equipment: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Dumbbells, Cable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newExercise.difficulty}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="input-field"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowCreateExercise(false)} 
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button 
                onClick={createNewExercise} 
                className="btn-primary flex-1 gap-2"
                disabled={!newExercise.name.trim()}
              >
                <Plus className="w-4 h-4" />
                Create & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveWorkout;
