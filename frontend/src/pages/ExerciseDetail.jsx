import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { exerciseAPI } from '../services/api';
import { 
  ArrowLeft, 
  Dumbbell, 
  Target, 
  Settings, 
  BarChart3,
  Play
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ExerciseDetail = () => {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExercise();
  }, [id]);

  const fetchExercise = async () => {
    try {
      const response = await exerciseAPI.getById(id);
      setExercise(response.data.data);
    } catch (error) {
      console.error('Error fetching exercise:', error);
      setError('Exercise not found');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      strength: 'bg-red-100 text-red-700',
      cardio: 'bg-blue-100 text-blue-700',
      flexibility: 'bg-purple-100 text-purple-700',
      bodyweight: 'bg-green-100 text-green-700',
      machine: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
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

  if (error || !exercise) {
    return (
      <div className="page-container text-center py-12">
        <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Exercise not found</h3>
        <Link to="/exercises" className="btn-primary">
          Back to Exercises
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Back button */}
      <Link
        to="/exercises"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Exercises
      </Link>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Image */}
        <div className="aspect-video bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden">
          {exercise.image_url ? (
            <img
              src={exercise.image_url}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            <span className={`badge text-xs ${getCategoryColor(exercise.category)}`}>
              {exercise.category}
            </span>
            {exercise.difficulty && (
              <span className={`badge text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{exercise.name}</h1>

          {exercise.description && (
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{exercise.description}</p>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {exercise.muscle_group && (
              <div className="card p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Target Muscle</p>
                    <p className="font-medium text-gray-900">{exercise.muscle_group}</p>
                  </div>
                </div>
              </div>
            )}
            {exercise.equipment && (
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Equipment</p>
                    <p className="font-medium text-gray-900">{exercise.equipment}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video link if available */}
          {exercise.video_url && (
            <a
              href={exercise.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary gap-2 mb-6"
            >
              <Play className="w-4 h-4" />
              Watch Video Tutorial
            </a>
          )}
        </div>
      </div>

      {/* Instructions */}
      {exercise.instructions && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
          <div className="card p-6">
            <div className="prose max-w-none">
              {exercise.instructions.split('\n').map((step, index) => (
                <p key={index} className="text-gray-700 mb-2">
                  {step}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetail;
