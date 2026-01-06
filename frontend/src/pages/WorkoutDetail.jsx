import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workoutAPI, workoutLogAPI } from '../services/api';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  Dumbbell,
  Clock,
  Target
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    fetchWorkout();
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      await workoutAPI.delete(id);
      navigate('/my-workouts');
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const handleLogWorkout = async () => {
    setLogging(true);
    try {
      await workoutLogAPI.create({
        workoutId: parseInt(id),
        durationMinutes: workout.exercises?.length * 5 || 30
      });
      alert('Workout logged successfully!');
    } catch (error) {
      console.error('Error logging workout:', error);
    } finally {
      setLogging(false);
    }
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Workout not found</h3>
        <Link to="/my-workouts" className="btn-primary">
          Back to Workouts
        </Link>
      </div>
    );
  }

  const totalSets = workout.exercises?.reduce((sum, ex) => sum + (ex.sets || 0), 0) || 0;
  const estimatedTime = workout.exercises?.length * 5 || 0;

  return (
    <div className="page-container max-w-3xl">
      {/* Back button */}
      <Link
        to="/my-workouts"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workouts
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{workout.name}</h1>
          {workout.description && (
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{workout.description}</p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link to={`/my-workouts/${id}/edit`} className="btn-secondary gap-2 flex-1 sm:flex-initial justify-center">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          <button onClick={handleDelete} className="btn-danger gap-2 flex-1 sm:flex-initial justify-center">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card p-3 sm:p-4 text-center">
          <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{workout.exercises?.length || 0}</p>
          <p className="text-xs sm:text-sm text-gray-500">Exercises</p>
        </div>
        <div className="card p-3 sm:p-4 text-center">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalSets}</p>
          <p className="text-xs sm:text-sm text-gray-500">Total Sets</p>
        </div>
        <div className="card p-3 sm:p-4 text-center">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl font-bold text-gray-900">~{estimatedTime}</p>
          <p className="text-xs sm:text-sm text-gray-500">Minutes</p>
        </div>
      </div>

      {/* Log Workout Button */}
      <button
        onClick={handleLogWorkout}
        disabled={logging}
        className="w-full btn-primary btn-lg gap-2 mb-6 sm:mb-8"
      >
        {logging ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <Play className="w-5 h-5" />
            Log Completed Workout
          </>
        )}
      </button>

      {/* Exercises */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Exercises</h2>
      {workout.exercises?.length === 0 ? (
        <div className="card p-6 sm:p-8 text-center">
          <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">No exercises in this workout</p>
          <Link to={`/my-workouts/${id}/edit`} className="btn-primary">
            Add Exercises
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map((exercise, index) => (
            <div key={index} className="card p-3 sm:p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-semibold text-sm sm:text-base">
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
                    <span>{exercise.sets} sets</span>
                    <span>×</span>
                    <span>{exercise.reps} reps</span>
                    {exercise.weight && (
                      <>
                        <span>×</span>
                        <span>{exercise.weight} kg</span>
                      </>
                    )}
                    {exercise.rest_time && (
                      <>
                        <span>•</span>
                        <span>{exercise.rest_time}s rest</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {exercise.notes && (
                <p className="text-xs sm:text-sm text-gray-400 mt-2 ml-11 sm:ml-14">{exercise.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;
