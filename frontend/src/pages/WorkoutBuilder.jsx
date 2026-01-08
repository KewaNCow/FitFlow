import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  PersonStanding,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const WorkoutBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      
      // If this is a predefined workout, automatically copy it and redirect to edit the copy
      if (data.is_predefined) {
        console.log('Predefined workout detected, creating copy...');
        try {
          const copyResponse = await workoutAPI.copy(id);
          const newWorkoutId = copyResponse.data.data.id;
          console.log('Created copy with ID:', newWorkoutId);
          navigate(`/my-workouts/${newWorkoutId}/edit`, { replace: true });
          return;
        } catch (copyError) {
          console.error('Error copying predefined workout:', copyError);
          setError(t('workoutBuilder.cannotEdit'));
          setTimeout(() => navigate('/my-workouts'), 2000);
          return;
        }
      }
      
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

  // Estimate calories burned based on activity type, duration, and intensity
  const estimateCalories = (durationMinutes, activityType, intensity) => {
    if (!durationMinutes) return null;
    
    // Base calories per minute by activity type
    const caloriesPerMinute = {
      running: 11,
      biking: 8,
      walking: 5,
      hiking: 7,
      default: 8
    };
    
    // Intensity multipliers
    const intensityMultiplier = {
      low: 0.7,
      moderate: 1.0,
      high: 1.3,
      interval: 1.4
    };
    
    const baseRate = caloriesPerMinute[activityType] || caloriesPerMinute.default;
    const multiplier = intensityMultiplier[intensity] || 1.0;
    
    return Math.round(durationMinutes * baseRate * multiplier);
  };

  // Estimate intensity from route pace (min/km)
  const estimateIntensityFromPace = (distanceKm, durationMinutes) => {
    if (!distanceKm || !durationMinutes || distanceKm <= 0) return 'moderate';
    
    const paceMinPerKm = durationMinutes / distanceKm;
    
    // Pace thresholds for running
    if (paceMinPerKm < 5) return 'high';      // Fast: < 5 min/km
    if (paceMinPerKm < 6.5) return 'moderate'; // Moderate: 5-6.5 min/km
    return 'low';                              // Easy: > 6.5 min/km
  };

  const handleAddExercise = (exercise) => {
    const isCardio = isCardioExercise(exercise);
    
    // If adding a cardio exercise and a route is selected, use route data
    const routeDistance = selectedRoute?.distance_km ? parseFloat(selectedRoute.distance_km) : null;
    const routeDuration = selectedRoute?.estimated_duration ? parseInt(selectedRoute.estimated_duration) : null; // Already in minutes
    const activityType = selectedRoute?.activity_type || 'running';
    
    // Calculate intensity and calories from route data
    const estimatedIntensity = isCardio && routeDistance && routeDuration 
      ? estimateIntensityFromPace(routeDistance, routeDuration)
      : 'moderate';
    const estimatedCalories = isCardio && routeDuration
      ? estimateCalories(routeDuration, activityType, estimatedIntensity)
      : null;
    
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
          // Cardio fields - duration stored in MINUTES
          duration: isCardio ? (routeDuration || exercise.default_duration || 30) : null,
          distance: isCardio ? (routeDistance || exercise.default_distance || null) : null,
          calories: isCardio ? estimatedCalories : null,
          intensity: isCardio ? estimatedIntensity : null,
          notes: '',
          linkedToRoute: isCardio && selectedRoute ? true : false
        }
      ]
    }));
    
    // Auto-update workout type based on exercises
    updateWorkoutType([...workout.exercises, exercise]);
    
    setShowExerciseModal(false);
    setSearchTerm('');
  };

  // Apply route data to a cardio exercise
  const applyRouteDataToExercise = (index) => {
    if (!selectedRoute) return;
    
    const routeDistance = selectedRoute.distance_km ? parseFloat(selectedRoute.distance_km) : null;
    const routeDuration = selectedRoute.estimated_duration ? parseInt(selectedRoute.estimated_duration) : null; // Already in minutes
    const activityType = selectedRoute?.activity_type || 'running';
    
    // Calculate intensity and calories
    const estimatedIntensity = estimateIntensityFromPace(routeDistance, routeDuration);
    const estimatedCalories = estimateCalories(routeDuration, activityType, estimatedIntensity);
    
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { 
          ...ex, 
          distance: routeDistance,
          duration: routeDuration,
          calories: estimatedCalories,
          intensity: estimatedIntensity,
          linkedToRoute: true
        } : ex
      )
    }));
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
      exercises: prev.exercises.map((ex, i) => {
        if (i !== index) return ex;
        
        const updatedEx = { ...ex, [field]: value };
        
        // Auto-recalculate intensity and calories when duration or distance changes for cardio
        if ((field === 'duration' || field === 'distance') && isCardioExercise(ex)) {
          const duration = field === 'duration' ? value : ex.duration;
          const distance = field === 'distance' ? value : ex.distance;
          
          // Recalculate intensity from pace if both values exist
          if (duration && distance && distance > 0) {
            updatedEx.intensity = estimateIntensityFromPace(distance, duration);
          }
          
          // Recalculate calories
          if (duration) {
            const activityType = selectedRoute?.activity_type || ex.name?.toLowerCase() || 'running';
            updatedEx.calories = estimateCalories(duration, activityType, updatedEx.intensity || 'moderate');
          }
        }
        
        return updatedEx;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!workout.name.trim()) {
      setError(t('workoutBuilder.errorRequired'));
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
      setError(t('workoutBuilder.errorSaving'));
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
      <div className="flex items-center flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link
          to="/my-workouts"
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isEditing ? t('workoutBuilder.editWorkout') : t('workoutBuilder.createWorkout')}
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
                {t('workoutBuilder.workoutName')} *
              </label>
              <input
                id="name"
                type="text"
                value={workout.name}
                onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder={t('workoutBuilder.workoutNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="description" className="label">
                {t('workoutBuilder.descriptionOptional')}
              </label>
              <textarea
                id="description"
                value={workout.description}
                onChange={(e) => setWorkout(prev => ({ ...prev, description: e.target.value }))}
                className="input"
                rows={3}
                placeholder={t('workoutBuilder.descriptionPlaceholder')}
              />
            </div>
            
            {/* Route Selection */}
            <div>
              <label className="label flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('workoutBuilder.linkRoute')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedRoute?.id || ''}
                  onChange={(e) => {
                    const routeId = e.target.value;
                    if (routeId) {
                      const route = allRoutes.find(r => r.id === parseInt(routeId));
                      setSelectedRoute(route);
                      
                      if (route) {
                        const routeDistance = route.distance_km ? parseFloat(route.distance_km) : null;
                        const routeDuration = route.estimated_duration ? parseInt(route.estimated_duration) : null;
                        const activityType = route.activity_type || 'running';
                        
                        // Map activity_type to exercise name
                        const activityToExercise = {
                          'running': 'Running',
                          'foot-walking': 'Walking',
                          'walking': 'Walking',
                          'cycling-regular': 'Cycling',
                          'cycling-road': 'Cycling',
                          'cycling-mountain': 'Cycling',
                          'cycling': 'Cycling',
                          'swimming': 'Swimming',
                          'hiking': 'Walking'
                        };
                        
                        const targetExerciseName = activityToExercise[activityType] || 'Running';
                        
                        // Check if workout already has a matching cardio exercise
                        const hasMatchingCardio = workout.exercises.some(ex => 
                          isCardioExercise(ex) && ex.name === targetExerciseName
                        );
                        
                        // Find the exercise from allExercises
                        const matchingExercise = allExercises.find(ex => 
                          ex.name === targetExerciseName && isCardioExercise(ex)
                        );
                        
                        // Calculate intensity and calories
                        const estimatedIntensity = routeDistance && routeDuration 
                          ? estimateIntensityFromPace(routeDistance, routeDuration) 
                          : 'moderate';
                        const estimatedCalories = routeDuration
                          ? estimateCalories(routeDuration, activityType, estimatedIntensity)
                          : null;
                        
                        if (!hasMatchingCardio && matchingExercise) {
                          // Auto-add the matching cardio exercise with route data
                          setWorkout(prev => ({
                            ...prev,
                            workout_type: 'cardio',
                            exercises: [
                              ...prev.exercises,
                              {
                                exerciseId: matchingExercise.id,
                                name: matchingExercise.name,
                                category: matchingExercise.category,
                                exercise_type: matchingExercise.exercise_type,
                                sets: null,
                                reps: null,
                                weight: null,
                                restTime: null,
                                duration: routeDuration,
                                distance: routeDistance,
                                calories: estimatedCalories,
                                intensity: estimatedIntensity,
                                notes: `From route: ${route.name}`,
                                linkedToRoute: true
                              }
                            ]
                          }));
                        } else {
                          // Update existing cardio exercises with route data
                          setWorkout(prev => ({
                            ...prev,
                            exercises: prev.exercises.map(ex => {
                              if (isCardioExercise(ex)) {
                                return {
                                  ...ex,
                                  distance: routeDistance,
                                  duration: routeDuration,
                                  intensity: estimatedIntensity,
                                  calories: estimatedCalories,
                                  linkedToRoute: true
                                };
                              }
                              return ex;
                            })
                          }));
                        }
                      }
                    } else {
                      setSelectedRoute(null);
                      // Clear route link from exercises
                      setWorkout(prev => ({
                        ...prev,
                        exercises: prev.exercises.map(ex => ({
                          ...ex,
                          linkedToRoute: false
                        }))
                      }));
                    }
                  }}
                  className="input flex-1"
                >
                  <option value="">{t('workoutBuilder.selectRoute')}</option>
                  {allRoutes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name} - {parseFloat(route.distance_km || 0).toFixed(2)} km ({route.activity_type})
                    </option>
                  ))}
                </select>
                <Link
                  to="/routes"
                  className="btn-outline px-3 flex items-center gap-1 justify-center"
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
                      title={t('workoutBuilder.removeRoute')}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('workoutBuilder.exercises')} ({workout.exercises.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowExerciseModal(true)}
              className="btn-primary btn-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('workoutBuilder.addExercise')}
            </button>
          </div>

          {workout.exercises.length === 0 ? (
            <div className="card p-8 text-center">
              <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">{t('workoutBuilder.noExercises')}</p>
              <button
                type="button"
                onClick={() => setShowExerciseModal(true)}
                className="btn-outline btn-sm"
              >
                {t('workoutBuilder.addExercise')}
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
                            {isCardio ? t('workoutBuilder.cardio') : t('workoutBuilder.strength')}
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
                        <div className="space-y-3">
                          {/* Route Link Indicator */}
                          {selectedRoute && (
                            <div className="flex items-center gap-2 text-xs">
                              {exercise.linkedToRoute ? (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                  <MapPin className="w-3 h-3" />
                                  Using route: {selectedRoute.name}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => applyRouteDataToExercise(index)}
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                  <MapPin className="w-3 h-3" />
                                  Apply route data ({parseFloat(selectedRoute.distance_km || 0).toFixed(1)} km)
                                </button>
                              )}
                            </div>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                              <Timer className="w-3 h-3" /> {t('workoutBuilder.duration')}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={exercise.duration || ''}
                              onChange={(e) => handleExerciseChange(index, 'duration', e.target.value ? parseInt(e.target.value) : null)}
                              className="input text-sm py-1.5"
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
                              step="0.1"
                              value={exercise.distance || ''}
                              onChange={(e) => handleExerciseChange(index, 'distance', e.target.value ? parseFloat(e.target.value) : null)}
                              className="input text-sm py-1.5"
                              placeholder="5.0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                              <Flame className="w-3 h-3" /> {t('workoutBuilder.calories')}
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
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> {t('workoutBuilder.intensity')}
                            </label>
                            <select
                              value={exercise.intensity || 'moderate'}
                              onChange={(e) => handleExerciseChange(index, 'intensity', e.target.value)}
                              className="input text-sm py-1.5"
                            >
                              <option value="low">{t('workoutBuilder.intensityLow')}</option>
                              <option value="moderate">{t('workoutBuilder.intensityModerate')}</option>
                              <option value="high">{t('workoutBuilder.intensityHigh')}</option>
                              <option value="interval">Interval</option>
                            </select>
                          </div>
                          </div>
                        </div>
                      ) : (
                        // Strength-specific inputs
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-gray-500">{t('workoutBuilder.sets')}</label>
                            <input
                              type="number"
                              min="1"
                              value={exercise.sets || ''}
                              onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                              className="input text-sm py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">{t('workoutBuilder.reps')}</label>
                            <input
                              type="number"
                              min="1"
                              value={exercise.reps || ''}
                              onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                              className="input text-sm py-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">{t('workoutBuilder.weight')}</label>
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
                            <label className="text-xs text-gray-500">{t('workoutBuilder.rest')}</label>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary gap-2 w-full sm:w-auto"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? t('common.save') + ' Changes' : t('workoutBuilder.createWorkout')}
              </>
            )}
          </button>
          <Link to="/my-workouts" className="btn-secondary w-full sm:w-auto text-center">
            {t('common.cancel')}
          </Link>
        </div>
      </form>

      {/* Add Exercise Modal */}
      {showExerciseModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exercise-modal-title"
        >
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 id="exercise-modal-title" className="text-lg font-semibold">{t('workoutBuilder.addExercise')}</h3>
              <button
                onClick={() => {
                  setShowExerciseModal(false);
                  setSearchTerm('');
                  setCategoryFilter('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('workoutBuilder.searchExercises')}
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
                    {cat === '' ? t('workoutBuilder.allCategories') : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              {filteredExercises.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {t('workoutBuilder.noExercisesFound')}
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
                            {t(`common.categories.${exercise.category}`)}
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
