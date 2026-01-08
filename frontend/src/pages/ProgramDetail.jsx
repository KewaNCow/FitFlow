import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { programAPI, ratingAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  Dumbbell,
  Clock,
  Copy,
  Star
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState({
    avgRating: 0,
    ratingCount: 0,
    userRating: null
  });
  
  const DAYS = [
    t('common.days.monday'),
    t('common.days.tuesday'),
    t('common.days.wednesday'),
    t('common.days.thursday'),
    t('common.days.friday'),
    t('common.days.saturday'),
    t('common.days.sunday')
  ];

  useEffect(() => {
    fetchProgram();
    fetchRating();
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

  const fetchRating = async () => {
    try {
      const response = await ratingAPI.getProgramRating(id);
      setRatingData(response.data.data);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleRate = async (rating) => {
    try {
      if (rating === 0) {
        const response = await ratingAPI.deleteProgramRating(id);
        setRatingData({
          ...response.data.data,
          userRating: null
        });
      } else {
        const response = await ratingAPI.rateProgram(id, { rating });
        setRatingData(response.data.data);
      }
    } catch (error) {
      console.error('Error rating program:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('programDetail.deleteConfirm'))) return;
    
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('programDetail.notFound')}</h3>
        <Link to="/my-programs" className="btn-primary">
          {t('programDetail.backToPrograms')}
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
        {t('programDetail.backToPrograms')}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {program.difficulty && (
              <span className={`badge text-xs ${getDifficultyColor(program.difficulty)}`}>
                {t(`programs.filter${program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)}`)}
              </span>
            )}
            {!!program.is_predefined && (
              <span className="badge bg-blue-100 text-blue-700 text-xs">
                {t('programDetail.predefined')}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{program.name}</h1>
          {program.description && (
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{program.description}</p>
          )}
          {/* Rating Display */}
          <div className="mt-3 flex items-center gap-3">
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {program.is_predefined ? (
            <button onClick={handleCopy} className="btn-primary gap-2 w-full sm:w-auto">
              <Copy className="w-4 h-4" />
              {t('programDetail.tryProgram')}
            </button>
          ) : (
            <>
              <Link to={`/my-programs/${id}/edit`} className="btn-secondary gap-2 w-full sm:w-auto text-center">
                <Edit className="w-4 h-4" />
                {t('common.edit')}
              </Link>
              <button onClick={handleDelete} className="btn-danger gap-2 w-full sm:w-auto">
                <Trash2 className="w-4 h-4" />
                {t('common.delete')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="card p-4 text-center">
          <Clock className="w-6 h-6 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{program.duration_weeks}</p>
          <p className="text-sm text-gray-500">{t('programDetail.weeks')}</p>
        </div>
        <div className="card p-4 text-center">
          <Dumbbell className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{program.workouts?.length || 0}</p>
          <p className="text-sm text-gray-500">{t('programDetail.workoutsPerWeek')}</p>
        </div>
      </div>

      {/* Weekly Schedule */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('programDetail.weeklySchedule')}</h2>
      <div className="grid gap-3">
        {DAYS.map((day, index) => {
          const dayWorkouts = getWorkoutsForDay(index);
          return (
            <div key={day} className="card p-4">
              <h3 className="font-medium text-gray-900 mb-2">{day}</h3>
              {dayWorkouts.length === 0 ? (
                <p className="text-sm text-gray-400">{t('programDetail.restDay')}</p>
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
                          {workout.exercise_count} {t('programDetail.exercises')}
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

      {/* Rate This Program */}
      <div className="card p-4 sm:p-6 mt-6 sm:mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">{t('rating.rateThisProgram')}</h3>
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

export default ProgramDetail;
