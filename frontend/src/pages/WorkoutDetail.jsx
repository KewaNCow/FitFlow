import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workoutAPI, workoutLogAPI, ratingAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  Dumbbell,
  Clock,
  Target,
  Star
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState({
    avgRating: 0,
    ratingCount: 0,
    userRating: null
  });

  useEffect(() => {
    fetchWorkout();
    fetchRating();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const response = await workoutAPI.getById(id);
      setWorkout(response.data.data);
    } catch (error) {
      console.error('Error fetching workout:', error);
      navigate('/my-workouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchRating = async () => {
    try {
      const response = await ratingAPI.getWorkoutRating(id);
      setRatingData(response.data.data);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleRate = async (rating) => {
    try {
      if (rating === 0) {
        const response = await ratingAPI.deleteWorkoutRating(id);
        setRatingData({
          ...response.data.data,
          userRating: null
        });
      } else {
        const response = await ratingAPI.rateWorkout(id, { rating });
        setRatingData(response.data.data);
      }
    } catch (error) {
      console.error('Error rating workout:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('workoutDetail.deleteConfirm'))) return;
    
    try {
      await workoutAPI.delete(id);
      navigate('/my-workouts');
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const handleCopyAndEdit = async () => {
    try {
      const response = await workoutAPI.copy(id);
      navigate(`/my-workouts/${response.data.data.id}/edit`);
    } catch (error) {
      console.error('Error copying workout:', error);
    }
  };

  const handleLogWorkout = async () => {
    navigate(`/my-workouts/${id}/start`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="page-container text-center py-12">
        <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('workoutDetail.notFound')}</h3>
        <Link to="/my-workouts" className="btn-primary">
          {t('workoutDetail.backToWorkouts')}
        </Link>
      </div>
    );
  }

  const totalSets = workout.exercises?.reduce((sum, ex) => sum + (ex.sets || 0), 0) || 0;
  
  // Calculate estimated time: cardio exercises use their duration, strength exercises estimate 5 min each
  const estimatedTime = workout.exercises?.reduce((total, ex) => {
    // If exercise has duration (cardio), use it (duration is in minutes)
    if (ex.duration) {
      return total + ex.duration;
    }
    // For strength exercises, estimate based on sets × 1.5 min per set + rest time
    const sets = ex.sets || 3;
    const restSeconds = ex.rest_time || 60;
    return total + Math.ceil((sets * 1.5) + ((sets - 1) * restSeconds / 60));
  }, 0) || 0;

  return (
    <div className="page-container max-w-3xl">
      {/* Back button */}
      <Link
        to="/my-workouts"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('workoutDetail.backToWorkouts')}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{workout.name}</h1>
          {workout.description && (
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{workout.description}</p>
          )}
          {/* Rating Display */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <StarRating 
                rating={ratingData.avgRating} 
                readonly 
                size="sm"
                showAverage
                showCount
                count={ratingData.ratingCount}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {workout.is_predefined ? (
            <button onClick={handleCopyAndEdit} className="btn-secondary gap-2 flex-1 sm:flex-initial justify-center">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">{t('workoutDetail.editAsMyWorkout')}</span>
            </button>
          ) : (
            <>
              <Link to={`/my-workouts/${id}/edit`} className="btn-secondary gap-2 flex-1 sm:flex-initial justify-center">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.edit')}</span>
              </Link>
              <button onClick={handleDelete} className="btn-danger gap-2 flex-1 sm:flex-initial justify-center">
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.delete')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card p-3 sm:p-4 text-center">
          <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{workout.exercises?.length || 0}</p>
          <p className="text-xs sm:text-sm text-gray-500">{t('workoutDetail.exercises')}</p>
        </div>
        <div className="card p-3 sm:p-4 text-center">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalSets}</p>
          <p className="text-xs sm:text-sm text-gray-500">{t('workoutDetail.totalSets')}</p>
        </div>
        <div className="card p-3 sm:p-4 text-center">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-gray-900">~{estimatedTime}</p>
          <p className="text-xs sm:text-sm text-gray-500">{t('workoutDetail.minutes')}</p>
        </div>
      </div>

      {/* Start Workout Button */}
      <button
        onClick={handleLogWorkout}
        className="w-full btn-primary btn-lg gap-2 mb-6 sm:mb-8"
      >
        <>
          <Play className="w-5 h-5" />
          {t('workoutDetail.startWorkout')}
        </>
      </button>

      {/* Exercises */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{t('workoutDetail.exercises')}</h2>
      {workout.exercises?.length === 0 ? (
        <div className="card p-6 sm:p-8 text-center">
          <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">{t('workoutDetail.noExercises')}</p>
          <Link to={`/my-workouts/${id}/edit`} className="btn-primary">
            {t('workoutDetail.addExercises')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map((exercise, index) => {
            const isCardio = exercise.category === 'cardio' || exercise.exercise_type === 'cardio' || exercise.duration;
            
            return (
            <div key={index} className="card p-3 sm:p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-semibold text-sm sm:text-base ${
                  isCardio ? 'bg-blue-100 text-blue-600' : 'bg-primary-100 text-primary-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/exercises/${exercise.exercise_id}`}
                    className="font-medium text-gray-900 hover:text-primary-600 text-sm sm:text-base truncate block"
                  >
                    {exercise.name}
                  </Link>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-500">
                    {isCardio ? (
                      <>
                        {exercise.duration && (
                          <span>{exercise.duration} min</span>
                        )}
                        {exercise.distance && (
                          <>
                            <span>•</span>
                            <span>{parseFloat(exercise.distance).toFixed(1)} km</span>
                          </>
                        )}
                        {exercise.calories && (
                          <>
                            <span>•</span>
                            <span>{exercise.calories} kcal</span>
                          </>
                        )}
                        {exercise.intensity && (
                          <>
                            <span>•</span>
                            <span className={`capitalize ${
                              exercise.intensity === 'high' ? 'text-red-500' :
                              exercise.intensity === 'moderate' ? 'text-yellow-600' :
                              'text-green-500'
                            }`}>{exercise.intensity}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span>{exercise.sets} {t('workoutDetail.sets')}</span>
                        <span>×</span>
                        <span>{exercise.reps} {t('workoutDetail.reps')}</span>
                        {exercise.weight && (
                          <>
                            <span>×</span>
                            <span>{exercise.weight} kg</span>
                          </>
                        )}
                        {exercise.rest_time && (
                          <>
                            <span>•</span>
                            <span>{exercise.rest_time}s {t('workoutDetail.rest')}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {exercise.notes && (
                <p className="text-xs sm:text-sm text-gray-400 mt-2 ml-11 sm:ml-14">{exercise.notes}</p>
              )}
            </div>
          )})}
        </div>
      )}

      {/* Rate This Workout */}
      <div className="card p-4 sm:p-6 mt-6 sm:mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">{t('rating.rateThisWorkout')}</h3>
        </div>
        <div className="flex items-center gap-4">
          <StarRating 
            rating={ratingData.userRating || 0}
            onRate={handleRate}
            size="lg"
          />
          {ratingData.userRating && (
            <span className="text-sm text-gray-500">{t('rating.yourRating')}: {ratingData.userRating}/5</span>
          )}
        </div>
        {!ratingData.userRating && (
          <p className="text-sm text-gray-500 mt-2">{t('rating.clickToRate')}</p>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetail;
