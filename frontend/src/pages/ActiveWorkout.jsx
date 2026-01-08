import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  X,
  Route,
  Flame,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

// Helper to determine if an exercise is cardio-based
const isCardioExercise = (exercise) => {
  return exercise?.category === 'cardio' || exercise?.exercise_type === 'cardio' || exercise?.duration;
};

const ActiveWorkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Workout data
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Active workout state
  const [exercises, setExercises] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Custom time settings
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  
  // Exercise search/add modal
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [showSaveWorkout, setShowSaveWorkout] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Save workout form
  const [saveWorkoutData, setSaveWorkoutData] = useState({
    name: '',
    description: ''
  });
  
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
      
      // Check if workout is linked to a route
      const hasRoute = workoutData.route_id && workoutData.route_distance;
      const routeDistance = hasRoute ? parseFloat(workoutData.route_distance) : null;
      
      // Initialize exercises with tracking structure
      const initialExercises = (Array.isArray(workoutData.exercises) ? workoutData.exercises : []).map(ex => {
        const isCardio = isCardioExercise(ex);
        
        if (isCardio) {
          // Cardio exercise: single "set" representing the cardio session
          // Use route distance if workout is linked to a route
          return {
            ...ex,
            isCardio: true,
            completed: false,
            // Cardio tracking data - prioritize route distance over exercise distance
            actualDuration: ex.duration || 30,
            actualDistance: ex.distance || routeDistance || null,
            actualCalories: ex.calories || null,
            actualIntensity: ex.intensity || 'moderate',
            // Keep sets array for compatibility but with single entry
            sets: [{
              setNumber: 1,
              completed: false,
              notes: ''
            }]
          };
        } else {
          // Strength exercise: multiple sets
          return {
            ...ex,
            isCardio: false,
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
          };
        }
      });
      
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
      const exercise = updated[exerciseIndex];
      
      // For cardio exercises, toggle the whole exercise completion
      if (exercise.isCardio) {
        exercise.completed = !exercise.completed;
        exercise.sets[0].completed = exercise.completed;
        return updated;
      }
      
      // For strength exercises
      const set = exercise.sets[setIndex];
      
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
      exercise.completed = exercise.sets.every(s => s.completed);
      
      return updated;
    });
  };

  // Update cardio exercise data
  const updateCardioData = (exerciseIndex, field, value) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex][field] = value;
      
      // Auto-recalculate intensity from pace when duration or distance changes
      if ((field === 'actualDuration' || field === 'actualDistance')) {
        const duration = field === 'actualDuration' ? value : updated[exerciseIndex].actualDuration;
        const distance = field === 'actualDistance' ? value : updated[exerciseIndex].actualDistance;
        
        if (duration && distance && distance > 0) {
          const paceMinPerKm = duration / distance;
          if (paceMinPerKm < 5) {
            updated[exerciseIndex].actualIntensity = 'high';
          } else if (paceMinPerKm < 6.5) {
            updated[exerciseIndex].actualIntensity = 'moderate';
          } else {
            updated[exerciseIndex].actualIntensity = 'low';
          }
        }
        
        // Auto-calculate calories
        if (duration) {
          const exerciseName = updated[exerciseIndex].name?.toLowerCase() || '';
          const activityType = exerciseName.includes('run') ? 'running' : 
                               exerciseName.includes('cycl') || exerciseName.includes('bik') ? 'biking' :
                               exerciseName.includes('walk') ? 'walking' : 'running';
          const intensity = updated[exerciseIndex].actualIntensity || 'moderate';
          const caloriesPerMinute = { running: 11, biking: 8, walking: 5, hiking: 7 };
          const intensityMultiplier = { low: 0.7, moderate: 1.0, high: 1.3, interval: 1.4 };
          const baseRate = caloriesPerMinute[activityType] || 8;
          const multiplier = intensityMultiplier[intensity] || 1.0;
          updated[exerciseIndex].actualCalories = Math.round(duration * baseRate * multiplier);
        }
      }
      
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
    if (!window.confirm(t('activeWorkout.removeExercise'))) return;
    setExercises(prev => prev.filter((_, i) => i !== exerciseIndex));
  };

  const finishWorkout = async () => {
    // Ensure exercises is an array
    const exercisesArray = Array.isArray(exercises) ? exercises : [];
    
    // Check for incomplete sets
    const incompleteSets = exercisesArray.reduce((count, ex) => {
      if (ex.isCardio) {
        return count + (ex.sets?.[0]?.completed ? 0 : 1);
      }
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      return count + sets.filter(s => !s.completed).length;
    }, 0);
    
    let confirmMessage = t('activeWorkout.finishConfirm');
    if (incompleteSets > 0) {
      confirmMessage = t('activeWorkout.incompleteSets', { count: incompleteSets });
    }
    
    if (!window.confirm(confirmMessage)) return;
    
    setSaving(true);
    try {
      // Ensure exercises is an array
      const exercisesArray = Array.isArray(exercises) ? exercises : [];
      
      // Calculate duration and completion time
      let durationMinutes;
      let completedAt;
      
      if (useCustomTime && customStartDate && customStartTime && customEndDate && customEndTime) {
        const startDateTime = new Date(`${customStartDate}T${customStartTime}`);
        const endDateTime = new Date(`${customEndDate}T${customEndTime}`);
        durationMinutes = Math.floor((endDateTime - startDateTime) / 60000); // milliseconds to minutes
        completedAt = endDateTime.toISOString();
      } else {
        durationMinutes = Math.floor(elapsedTime / 60);
        completedAt = new Date().toISOString();
      }
      
      // Calculate total calories from all cardio exercises
      const totalCalories = exercisesArray.reduce((sum, ex) => {
        if (ex.isCardio && ex.actualCalories) {
          return sum + (parseInt(ex.actualCalories) || 0);
        }
        return sum;
      }, 0);
      
      // Calculate total distance from cardio exercises
      const totalDistance = exercisesArray.reduce((sum, ex) => {
        if (ex.isCardio && ex.actualDistance) {
          return sum + (parseFloat(ex.actualDistance) || 0);
        }
        return sum;
      }, 0);
      
      // Prepare exercise data - handle both cardio and strength
      const exerciseLogData = exercisesArray
        .map(ex => {
          if (ex.isCardio) {
            // Cardio exercise
            const isCompleted = ex.sets?.[0]?.completed;
            if (!isCompleted) return null;
            
            return {
              exerciseId: ex.exercise_id,
              isCardio: true,
              duration: ex.actualDuration || 0,
              distance: ex.actualDistance || null,
              calories: ex.actualCalories || null,
              intensity: ex.actualIntensity || 'moderate'
            };
          } else {
            // Strength exercise
            const completedSets = (Array.isArray(ex.sets) ? ex.sets.filter(s => s.completed) : []);
            if (completedSets.length === 0) return null;
            
            return {
              exerciseId: ex.exercise_id,
              isCardio: false,
              sets: completedSets.map(s => ({
                reps: s.actualReps || s.targetReps,
                weight: s.actualWeight || s.targetWeight,
                notes: s.notes
              }))
            };
          }
        })
        .filter(ex => ex !== null);
      
      // Count completed exercises
      const completedExercises = exerciseLogData.length;
      const completedSets = exerciseLogData.reduce((sum, ex) => {
        if (ex.isCardio) return sum + 1;
        return sum + (ex.sets?.length || 0);
      }, 0);
      
      const workoutLogData = {
        workoutId: parseInt(id),
        durationMinutes,
        caloriesBurned: totalCalories > 0 ? totalCalories : null,
        completedAt,
        notes: `Completed ${completedExercises}/${exercisesArray.length} exercises (${completedSets} sets)`,
        exercises: exerciseLogData
      };
      
      await workoutLogAPI.create(workoutLogData);
      
      // Navigate to history with summary data
      navigate('/history', { 
        state: { 
          message: 'Workout saved successfully!',
          summary: {
            workoutName: workout?.name || 'Workout',
            duration: durationMinutes,
            exercisesCompleted: completedExercises,
            setsCompleted: completedSets,
            caloriesBurned: totalCalories,
            distanceCovered: totalDistance
          }
        } 
      });
    } catch (error) {
      console.error('Error saving workout:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Error saving workout. Please try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const cancelWorkout = () => {
    if (!window.confirm(t('activeWorkout.cancelConfirm'))) return;
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
      
      alert(t('activeWorkout.exerciseCreated'));
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert(t('activeWorkout.errorCreatingExercise'));
    }
  };

  const saveCurrentWorkout = async () => {
    if (!saveWorkoutData.name.trim()) {
      alert(t('activeWorkout.enterWorkoutName'));
      return;
    }

    try {
      // Map current exercises with their sets configuration
      const workoutExercises = exercises.map(exercise => ({
        exercise_id: exercise.exercise_id,
        sets: exercise.sets.length,
        reps: exercise.sets[0]?.reps || 10,
        weight: exercise.sets[0]?.weight || 0,
        rest_time: 60,
        notes: ''
      }));

      const workoutData = {
        name: saveWorkoutData.name,
        description: saveWorkoutData.description || '',
        exercises: workoutExercises
      };

      await workoutAPI.create(workoutData);
      
      alert(t('activeWorkout.workoutSaved'));
      setShowSaveWorkout(false);
      setSaveWorkoutData({ name: '', description: '' });
      
      // Optionally navigate to My Workouts
      // navigate('/my-workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert(t('activeWorkout.errorSavingWorkout'));
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
            aria-label="Cancel workout"
          >
            <X className="w-5 h-5" aria-hidden="true" />
            <span>{t('activeWorkout.cancel')}</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTimeSettings(true)}
              className={`p-2 rounded-lg ${
                useCustomTime ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
              }`}
              title="Set custom workout time"
              aria-label="Set custom workout time"
            >
              <Timer className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg hover:bg-gray-100"
              disabled={useCustomTime}
              aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
            >
              {isPaused ? <Play className="w-5 h-5" aria-hidden="true" /> : <Pause className="w-5 h-5" aria-hidden="true" />}
            </button>
            <div className="text-2xl font-mono font-bold text-primary-600">
              {useCustomTime ? `⏱️ ${t('activeWorkout.customTime')}` : formatTime(elapsedTime)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveWorkout(true)}
              className="btn-secondary gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{t('activeWorkout.save')}</span>
            </button>
            <button
              onClick={finishWorkout}
              disabled={saving}
              className="btn-primary gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Check className="w-5 h-5" />}
              <span>{t('activeWorkout.finish')}</span>
            </button>
          </div>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900">{workout?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalSetsCompleted}/{totalSets} {t('activeWorkout.setsCompleted')}
        </p>
      </div>

      {/* Exercises list */}
      <div className="space-y-4">
        {exercises.map((exercise, exIdx) => (
          <div key={exIdx} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/exercises/${exercise.exercise_id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {exercise.name}
                  </Link>
                  {exercise.isCardio && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {t('workoutBuilder.cardio')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{exercise.muscle_group}</p>
              </div>
              <button
                onClick={() => removeExercise(exIdx)}
                className="text-gray-400 hover:text-red-600 p-1"
                aria-label={`Remove ${exercise.name} from workout`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {exercise.isCardio ? (
              /* Cardio exercise UI */
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    exercise.completed
                      ? 'bg-green-50 border-green-500'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => completeSet(exIdx, 0)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                        exercise.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-blue-300 hover:border-blue-500'
                      }`}
                    >
                      {exercise.completed && <Check className="w-5 h-5" />}
                    </button>
                    <span className="font-medium text-gray-700">
                      {exercise.completed ? t('activeWorkout.completed') : t('activeWorkout.markComplete')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> {t('workoutBuilder.duration')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.actualDuration || ''}
                        onChange={(e) => updateCardioData(exIdx, 'actualDuration', parseInt(e.target.value) || 0)}
                        className="input text-sm py-1.5 mt-1"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 flex items-center gap-1">
                        <Route className="w-3 h-3" /> {t('workoutBuilder.distance')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={exercise.actualDistance || ''}
                        onChange={(e) => updateCardioData(exIdx, 'actualDistance', parseFloat(e.target.value) || 0)}
                        className="input text-sm py-1.5 mt-1"
                        placeholder="5.00"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {t('workoutBuilder.calories')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={exercise.actualCalories !== undefined && exercise.actualCalories !== null ? exercise.actualCalories : ''}
                        onChange={(e) => updateCardioData(exIdx, 'actualCalories', parseInt(e.target.value) || 0)}
                        className="input text-sm py-1.5 mt-1"
                        placeholder="300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {t('workoutBuilder.intensity')}
                      </label>
                      <select
                        value={exercise.actualIntensity || 'moderate'}
                        onChange={(e) => updateCardioData(exIdx, 'actualIntensity', e.target.value)}
                        className="input text-sm py-1.5 mt-1"
                      >
                        <option value="low">{t('workoutBuilder.intensityLow')}</option>
                        <option value="moderate">{t('workoutBuilder.intensityModerate')}</option>
                        <option value="high">{t('workoutBuilder.intensityHigh')}</option>
                        <option value="interval">Interval</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Strength exercise UI */
              <>
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
                          {t('activeWorkout.set')} {set.setNumber}
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            {set.actualReps !== null ? set.actualReps : set.targetReps} {t('workoutDetail.reps')}
                          </span>
                          <span className="text-gray-400">×</span>
                          <span className={`font-medium ${!set.actualWeight && set.actualWeight !== 0 ? 'text-gray-400' : ''}`}>
                            {set.actualWeight > 0 ? `${set.actualWeight} kg` : '– kg'}
                          </span>
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

                {/* Add set button - only for strength exercises */}
                <button
                  onClick={() => addSet(exIdx)}
                  className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t('activeWorkout.addSet')}
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add exercise button */}
      <button
        onClick={() => setShowAddExercise(true)}
        className="w-full mt-4 btn-secondary gap-2"
      >
        <Plus className="w-5 h-5" />
        {t('activeWorkout.addExercise')}
      </button>

      {/* Edit Set Modal */}
      {editingSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{t('activeWorkout.editSet')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('activeWorkout.weight')}
                </label>
                <input
                  type="number"
                  value={editValues.weight}
                  onChange={(e) => setEditValues(prev => ({ ...prev, weight: e.target.value }))}
                  className="input"
                  step="0.5"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('activeWorkout.reps')}
                </label>
                <input
                  type="number"
                  value={editValues.reps}
                  onChange={(e) => setEditValues(prev => ({ ...prev, reps: e.target.value }))}
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingSet(null)} className="btn-secondary flex-1">
                {t('common.cancel')}
              </button>
              <button onClick={saveSetEdit} className="btn-primary flex-1">
                {t('common.save')}
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
              <h3 className="text-lg font-semibold">{t('activeWorkout.addExercise')}</h3>
              <button onClick={() => {
                setShowAddExercise(false);
                setSearchQuery('');
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder={t('activeWorkout.searchExercises')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field mb-4"
              autoFocus
            />
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">
                {isSearching ? t('activeWorkout.searching') : t('activeWorkout.exercisesFound', { count: availableExercises.length })}
              </div>
              <button
                onClick={() => setShowCreateExercise(true)}
                className="btn-secondary text-sm gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('activeWorkout.createNew')}
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
                      <p className="mt-2">{t('activeWorkout.searching')}</p>
                    </>
                  ) : searchQuery ? (
                    <>
                      <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>{t('activeWorkout.noExercisesFound', { query: searchQuery })}</p>
                      <button
                        onClick={() => {
                          setNewExercise(prev => ({ ...prev, name: searchQuery }));
                          setShowCreateExercise(true);
                        }}
                        className="btn-primary mt-4 gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t('activeWorkout.createExercise', { name: searchQuery })}
                      </button>
                    </>
                  ) : (
                    <>
                      <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>{t('activeWorkout.startTyping')}</p>
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
              <h3 className="text-lg font-semibold">{t('activeWorkout.createNewExercise')}</h3>
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
                  {t('activeWorkout.exerciseName')} *
                </label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder={t('activeWorkout.exerciseNamePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('activeWorkout.description')}
                </label>
                <textarea
                  value={newExercise.description}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows="3"
                  placeholder={t('activeWorkout.descriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('activeWorkout.muscleGroup')}
                  </label>
                  <input
                    type="text"
                    value={newExercise.muscle_group}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, muscle_group: e.target.value }))}
                    className="input-field"
                    placeholder={t('activeWorkout.muscleGroupPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('activeWorkout.category')}
                  </label>
                  <select
                    value={newExercise.category}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                  >
                    <option value="strength">{t('activeWorkout.strength')}</option>
                    <option value="cardio">{t('activeWorkout.cardio')}</option>
                    <option value="flexibility">{t('activeWorkout.flexibility')}</option>
                    <option value="bodyweight">{t('activeWorkout.bodyweight')}</option>
                    <option value="machine">{t('activeWorkout.machine')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('activeWorkout.equipment')}
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

      {/* Save Workout Modal */}
      {showSaveWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{t('activeWorkout.saveWorkoutTemplate')}</h3>
              <button
                onClick={() => {
                  setShowSaveWorkout(false);
                  setSaveWorkoutData({ name: '', description: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('activeWorkout.workoutName')} *
                </label>
                <input
                  type="text"
                  value={saveWorkoutData.name}
                  onChange={(e) => setSaveWorkoutData({ ...saveWorkoutData, name: e.target.value })}
                  placeholder={t('activeWorkout.workoutNamePlaceholder')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('activeWorkout.description')}
                </label>
                <textarea
                  value={saveWorkoutData.description}
                  onChange={(e) => setSaveWorkoutData({ ...saveWorkoutData, description: e.target.value })}
                  placeholder={t('activeWorkout.optionalDescription')}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  {t('activeWorkout.exercisesWillBeSaved', { count: exercises.length })}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveWorkout(false);
                  setSaveWorkoutData({ name: '', description: '' });
                }}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={saveCurrentWorkout} 
                className="btn-primary flex-1 gap-2"
                disabled={!saveWorkoutData.name.trim()}
              >
                <Save className="w-4 h-4" />
                {t('activeWorkout.saveWorkout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Settings Modal */}
      {showTimeSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t('activeWorkout.workoutTimeSettings')}</h2>
                <button
                  onClick={() => setShowTimeSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {t('activeWorkout.timeSettingsSubtitle')}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Toggle for custom time */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900">{t('activeWorkout.useCustomTime')}</label>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('activeWorkout.customTimeDescription')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomTime}
                    onChange={(e) => {
                      setUseCustomTime(e.target.checked);
                      if (e.target.checked) {
                        // Pre-fill with current time by default
                        const now = new Date();
                        const dateStr = now.toISOString().split('T')[0];
                        const timeStr = now.toTimeString().slice(0, 5);
                        setCustomEndDate(dateStr);
                        setCustomEndTime(timeStr);
                        
                        // Set start time to 1 hour ago
                        const hourAgo = new Date(now.getTime() - 3600000);
                        setCustomStartDate(hourAgo.toISOString().split('T')[0]);
                        setCustomStartTime(hourAgo.toTimeString().slice(0, 5));
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {useCustomTime && (
                <>
                  {/* Start Time */}
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {t('activeWorkout.startTime')}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t('activeWorkout.date')}</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t('activeWorkout.time')}</label>
                        <input
                          type="time"
                          value={customStartTime}
                          onChange={(e) => setCustomStartTime(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {t('activeWorkout.endTime')}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t('activeWorkout.date')}</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t('activeWorkout.time')}</label>
                        <input
                          type="time"
                          value={customEndTime}
                          onChange={(e) => setCustomEndTime(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration Preview */}
                  {customStartDate && customStartTime && customEndDate && customEndTime && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-indigo-900">
                        <Timer className="w-5 h-5" />
                        <span className="font-medium">{t('activeWorkout.duration')}: </span>
                        <span className="font-bold">
                          {(() => {
                            const start = new Date(`${customStartDate}T${customStartTime}`);
                            const end = new Date(`${customEndDate}T${customEndTime}`);
                            const diffMinutes = Math.floor((end - start) / 60000);
                            const hours = Math.floor(diffMinutes / 60);
                            const minutes = diffMinutes % 60;
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowTimeSettings(false);
                }}
                className="btn-secondary flex-1"
              >
                {t('activeWorkout.close')}
              </button>
              <button
                onClick={() => {
                  setShowTimeSettings(false);
                }}
                className="btn-primary flex-1"
              >
                {t('activeWorkout.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveWorkout;
