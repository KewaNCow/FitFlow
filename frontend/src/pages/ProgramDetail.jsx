import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { programAPI } from '../services/api';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  Dumbbell,
  Clock,
  Copy
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      const response = await programAPI.getById(id);
      setProgram(response.data.data);
    } catch (error) {
      console.error('Error fetching program:', error);
      navigate('/my-programs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    
    try {
      await programAPI.delete(id);
      navigate('/my-programs');
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await programAPI.copy(id);
      navigate('/my-programs');
    } catch (error) {
      console.error('Error copying program:', error);
    }
  };

  const handleCopyAndEdit = async () => {
    try {
      const response = await programAPI.copy(id);
      navigate(`/my-programs/${response.data.data.id}/edit`);
    } catch (error) {
      console.error('Error copying program:', error);
    }
  };

  const getWorkoutsForDay = (day) => {
    return program?.workouts?.filter(w => w.day_of_week === day) || [];
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="page-container text-center py-12">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Program not found</h3>
        <Link to="/my-programs" className="btn-primary">
          Back to Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      {/* Back button */}
      <Link
        to="/my-programs"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Programs
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {program.difficulty && (
              <span className={`badge text-xs ${getDifficultyColor(program.difficulty)}`}>
                {program.difficulty}
              </span>
            )}
            {program.is_predefined && (
              <span className="badge bg-blue-100 text-blue-700 text-xs">
                Predefined
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{program.name}</h1>
          {program.description && (
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{program.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {program.is_predefined ? (
            <>
              <button onClick={handleCopyAndEdit} className="btn-secondary gap-2">
                <Edit className="w-4 h-4" />
                Edit as My Program
              </button>
              <button onClick={handleCopy} className="btn-primary gap-2">
                <Copy className="w-4 h-4" />
                Copy to My Programs
              </button>
            </>
          ) : (
            <>
              <Link to={`/my-programs/${id}/edit`} className="btn-secondary gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button onClick={handleDelete} className="btn-danger gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-4 text-center">
          <Clock className="w-6 h-6 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{program.duration_weeks}</p>
          <p className="text-sm text-gray-500">Weeks</p>
        </div>
        <div className="card p-4 text-center">
          <Dumbbell className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{program.workouts?.length || 0}</p>
          <p className="text-sm text-gray-500">Workouts/Week</p>
        </div>
      </div>

      {/* Weekly Schedule */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Schedule</h2>
      <div className="grid gap-3">
        {DAYS.map((day, index) => {
          const dayWorkouts = getWorkoutsForDay(index);
          return (
            <div key={day} className="card p-4">
              <h3 className="font-medium text-gray-900 mb-2">{day}</h3>
              {dayWorkouts.length === 0 ? (
                <p className="text-sm text-gray-400">Rest day</p>
              ) : (
                <div className="space-y-2">
                  {dayWorkouts.map((workout, wIndex) => (
                    <div key={wIndex} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <Dumbbell className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <Link 
                        to={`/my-workouts/${workout.workout_id}`}
                        className="flex-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                      >
                        {workout.workout_name}
                      </Link>
                      {workout.exercise_count > 0 && (
                        <span className="text-xs text-gray-500">
                          {workout.exercise_count} exercises
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgramDetail;
