import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { programAPI, workoutAPI } from '../services/api';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Calendar,
  Search,
  X,
  Dumbbell,
  GripVertical
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ProgramBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditing = !!id;
  
  const DAYS = [
    t('common.days.monday'),
    t('common.days.tuesday'),
    t('common.days.wednesday'),
    t('common.days.thursday'),
    t('common.days.friday'),
    t('common.days.saturday'),
    t('common.days.sunday')
  ];

  const [program, setProgram] = useState({
    name: '',
    description: '',
    durationWeeks: 4,
    difficulty: 'beginner',
    workouts: []
  });
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Drag and drop state for workouts within days
  const [draggedWorkout, setDraggedWorkout] = useState(null);
  const [dragOverWorkout, setDragOverWorkout] = useState(null);

  useEffect(() => {
    fetchWorkouts();
    if (isEditing) {
      fetchProgram();
    }
  }, [id]);

  const fetchWorkouts = async () => {
    try {
      const response = await workoutAPI.getAll();
      setAllWorkouts(response.data.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchProgram = async () => {
    try {
      const response = await programAPI.getById(id);
      const data = response.data.data;
      setProgram({
        name: data.name,
        description: data.description || '',
        durationWeeks: data.duration_weeks,
        difficulty: data.difficulty || 'beginner',
        workouts: data.workouts?.map(w => ({
          workoutId: w.workout_id,
          workoutName: w.workout_name,
          dayOfWeek: w.day_of_week,
          notes: w.notes
        })) || []
      });
    } catch (error) {
      console.error('Error fetching program:', error);
      navigate('/my-programs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = (workout) => {
    setProgram(prev => ({
      ...prev,
      workouts: [
        ...prev.workouts,
        {
          workoutId: workout.id,
          workoutName: workout.name,
          dayOfWeek: selectedDay,
          notes: ''
        }
      ]
    }));
    setShowWorkoutModal(false);
    setSearchTerm('');
  };

  const handleRemoveWorkout = (index) => {
    setProgram(prev => ({
      ...prev,
      workouts: prev.workouts.filter((_, i) => i !== index)
    }));
  };

  // Drag and drop handlers for workouts
  const handleWorkoutDragStart = (e, workoutIndex, dayOfWeek) => {
    setDraggedWorkout({ index: workoutIndex, dayOfWeek });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', workoutIndex);
  };

  const handleWorkoutDragOver = (e, workoutIndex, dayOfWeek) => {
    e.preventDefault();
    if (draggedWorkout && (draggedWorkout.index !== workoutIndex || draggedWorkout.dayOfWeek !== dayOfWeek)) {
      setDragOverWorkout({ index: workoutIndex, dayOfWeek });
    }
  };

  const handleWorkoutDragLeave = () => {
    setDragOverWorkout(null);
  };

  const handleWorkoutDrop = (e, targetIndex, targetDay) => {
    e.preventDefault();
    if (!draggedWorkout) {
      setDragOverWorkout(null);
      return;
    }

    // Find the original workout in the program.workouts array
    const dayWorkouts = program.workouts.filter(w => w.dayOfWeek === draggedWorkout.dayOfWeek);
    const draggedItem = dayWorkouts[draggedWorkout.index];
    
    if (!draggedItem) {
      setDraggedWorkout(null);
      setDragOverWorkout(null);
      return;
    }

    // Get the global index of the dragged item
    const globalDraggedIndex = program.workouts.findIndex(
      (w, i) => program.workouts.filter((ww, ii) => ii < i && ww.dayOfWeek === draggedWorkout.dayOfWeek).length === draggedWorkout.index && w.dayOfWeek === draggedWorkout.dayOfWeek
    );

    setProgram(prev => {
      const newWorkouts = [...prev.workouts];
      
      // Find and remove the dragged workout
      let dragIdx = -1;
      let count = 0;
      for (let i = 0; i < newWorkouts.length; i++) {
        if (newWorkouts[i].dayOfWeek === draggedWorkout.dayOfWeek) {
          if (count === draggedWorkout.index) {
            dragIdx = i;
            break;
          }
          count++;
        }
      }
      
      if (dragIdx === -1) return prev;
      
      const [removed] = newWorkouts.splice(dragIdx, 1);
      
      // Update the day if moving to a different day
      removed.dayOfWeek = targetDay;
      
      // Find the target position
      let targetIdx = 0;
      count = 0;
      for (let i = 0; i < newWorkouts.length; i++) {
        if (newWorkouts[i].dayOfWeek === targetDay) {
          if (count === targetIndex) {
            targetIdx = i;
            break;
          }
          count++;
          targetIdx = i + 1;
        }
      }
      
      // If dropping in empty day or at end of day workouts
      if (count < targetIndex || targetIndex === -1) {
        // Find where this day's workouts end
        let lastDayIdx = -1;
        for (let i = newWorkouts.length - 1; i >= 0; i--) {
          if (newWorkouts[i].dayOfWeek === targetDay) {
            lastDayIdx = i;
            break;
          }
        }
        targetIdx = lastDayIdx >= 0 ? lastDayIdx + 1 : newWorkouts.length;
      }
      
      newWorkouts.splice(targetIdx, 0, removed);
      
      return { ...prev, workouts: newWorkouts };
    });

    setDraggedWorkout(null);
    setDragOverWorkout(null);
  };

  const handleWorkoutDragEnd = () => {
    setDraggedWorkout(null);
    setDragOverWorkout(null);
  };

  // Handle dropping on empty day area
  const handleDayDragOver = (e, dayIndex) => {
    e.preventDefault();
    if (draggedWorkout) {
      setDragOverWorkout({ index: -1, dayOfWeek: dayIndex });
    }
  };

  const handleDayDrop = (e, dayIndex) => {
    e.preventDefault();
    if (!draggedWorkout) return;
    
    handleWorkoutDrop(e, -1, dayIndex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!program.name.trim()) {
      setError('Program name is required');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: program.name,
        description: program.description,
        durationWeeks: program.durationWeeks,
        difficulty: program.difficulty,
        workouts: program.workouts.map(w => ({
          workoutId: w.workoutId,
          dayOfWeek: w.dayOfWeek,
          notes: w.notes
        }))
      };

      if (isEditing) {
        await programAPI.update(id, payload);
      } else {
        await programAPI.create(payload);
      }
      navigate('/my-programs');
    } catch (error) {
      console.error('Error saving program:', error);
      setError('Failed to save program. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getWorkoutsForDay = (day) => {
    return program.workouts.filter(w => w.dayOfWeek === day);
  };

  const filteredWorkouts = allWorkouts.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="flex items-center flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link
          to="/my-programs"
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isEditing ? t('programBuilder.editProgram') : t('programBuilder.createProgram')}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Program Details */}
        <div className="card p-4 sm:p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="label">
                {t('programBuilder.programName')} *
              </label>
              <input
                id="name"
                type="text"
                value={program.name}
                onChange={(e) => setProgram(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder={t('programBuilder.programNamePlaceholder')}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="label">
                {t('programBuilder.description')}
              </label>
              <textarea
                id="description"
                value={program.description}
                onChange={(e) => setProgram(prev => ({ ...prev, description: e.target.value }))}
                className="input"
                rows={2}
                placeholder={t('programBuilder.descriptionPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="durationWeeks" className="label">
                {t('programBuilder.durationWeeks')}
              </label>
              <input
                id="durationWeeks"
                type="number"
                min="1"
                max="52"
                value={program.durationWeeks}
                onChange={(e) => setProgram(prev => ({ ...prev, durationWeeks: parseInt(e.target.value) }))}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="difficulty" className="label">
                {t('programBuilder.difficulty')}
              </label>
              <select
                id="difficulty"
                value={program.difficulty}
                onChange={(e) => setProgram(prev => ({ ...prev, difficulty: e.target.value }))}
                className="input"
              >
                <option value="beginner">{t('programBuilder.beginner')}</option>
                <option value="intermediate">{t('programBuilder.intermediate')}</option>
                <option value="advanced">{t('programBuilder.advanced')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('programBuilder.weeklySchedule')}</h2>
          <div className="grid gap-3">
            {DAYS.map((day, index) => {
              const dayWorkouts = getWorkoutsForDay(index);
              return (
                <div key={day} className="card p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{day}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay(index);
                        setShowWorkoutModal(true);
                      }}
                      className="btn-ghost btn-sm gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {t('programBuilder.addWorkout')}
                    </button>
                  </div>
                  {dayWorkouts.length === 0 ? (
                    <div
                      className={`text-sm text-gray-400 p-3 rounded-lg transition-all ${
                        dragOverWorkout?.index === -1 && dragOverWorkout?.dayOfWeek === index
                          ? 'bg-primary-50 ring-2 ring-primary-400 ring-dashed'
                          : 'bg-gray-50'
                      }`}
                      onDragOver={(e) => handleDayDragOver(e, index)}
                      onDragLeave={handleWorkoutDragLeave}
                      onDrop={(e) => handleDayDrop(e, index)}
                    >
                      {t('programBuilder.restDay')}
                    </div>
                  ) : (
                    <div 
                      className="space-y-2"
                      onDragOver={(e) => handleDayDragOver(e, index)}
                      onDrop={(e) => handleDayDrop(e, index)}
                    >
                      {dayWorkouts.map((workout, wIndex) => {
                        const originalIndex = program.workouts.findIndex(
                          w => w.workoutId === workout.workoutId && w.dayOfWeek === workout.dayOfWeek
                        );
                        const isDragging = draggedWorkout?.index === wIndex && draggedWorkout?.dayOfWeek === index;
                        const isDragOver = dragOverWorkout?.index === wIndex && dragOverWorkout?.dayOfWeek === index;
                        return (
                          <div 
                            key={wIndex} 
                            className={`flex items-center gap-3 bg-gray-50 rounded-lg p-3 transition-all duration-200 ${
                              isDragging ? 'opacity-50 scale-95' : ''
                            } ${isDragOver ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}
                            draggable
                            onDragStart={(e) => handleWorkoutDragStart(e, wIndex, index)}
                            onDragOver={(e) => handleWorkoutDragOver(e, wIndex, index)}
                            onDragLeave={handleWorkoutDragLeave}
                            onDrop={(e) => handleWorkoutDrop(e, wIndex, index)}
                            onDragEnd={handleWorkoutDragEnd}
                          >
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                            <Dumbbell className="w-4 h-4 text-primary-600 flex-shrink-0" />
                            <span className="flex-1 text-sm">{workout.workoutName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkout(originalIndex)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
                {isEditing ? t('common.save') + ' Changes' : t('programBuilder.createProgram')}
              </>
            )}
          </button>
          <Link to="/my-programs" className="btn-secondary w-full sm:w-auto text-center">
            {t('common.cancel')}
          </Link>
        </div>
      </form>

      {/* Add Workout Modal */}
      {showWorkoutModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="workout-modal-title"
        >
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 id="workout-modal-title" className="text-lg font-semibold">{t('programBuilder.addWorkout')} to {DAYS[selectedDay]}</h3>
              <button
                onClick={() => {
                  setShowWorkoutModal(false);
                  setSearchTerm('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('workouts.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              {allWorkouts.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">{t('workouts.noWorkouts')}</p>
                  <Link to="/my-workouts/new" className="btn-primary btn-sm">
                    {t('workouts.create')}
                  </Link>
                </div>
              ) : filteredWorkouts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {t('workouts.noWorkoutsFound')}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => handleAddWorkout(workout)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 text-left"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{workout.name}</p>
                        <p className="text-sm text-gray-500">
                          {workout.exercise_count || 0} exercises
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramBuilder;
