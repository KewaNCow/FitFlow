import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        exercises: 'Exercises',
        equipment: 'Equipment',
        dashboard: 'Dashboard',
        workouts: 'Workouts',
        programs: 'Programs',
        routes: 'Routes',
        stats: 'Stats',
        profile: 'Profile',
        admin: 'Admin Dashboard',
        logout: 'Logout',
        login: 'Log in',
        signup: 'Sign up'
      },
      
      // Common
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search',
        filter: 'Filter',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        name: 'Name',
        description: 'Description',
        type: 'Type',
        category: 'Category',
        difficulty: 'Difficulty',
        duration: 'Duration',
        distance: 'Distance',
        reps: 'Reps',
        sets: 'Sets',
        weight: 'Weight',
        notes: 'Notes',
        date: 'Date',
        time: 'Time',
        start: 'Start',
        finish: 'Finish',
        complete: 'Complete',
        incomplete: 'Incomplete',
        view: 'View',
        viewAll: 'View all',
        details: 'Details',
        exercises: 'exercises',
        log: 'Log',
        days: {
          monday: 'Monday',
          tuesday: 'Tuesday',
          wednesday: 'Wednesday',
          thursday: 'Thursday',
          friday: 'Friday',
          saturday: 'Saturday',
          sunday: 'Sunday'
        },
        categories: {
          strength: 'Strength',
          cardio: 'Cardio',
          flexibility: 'Flexibility',
          bodyweight: 'Bodyweight',
          machine: 'Machine',
          mixed: 'Mixed'
        },
        difficulties: {
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced'
        }
      },
      
      // Exercises
      exercises: {
        library: 'Exercise Library',
        browseCollection: 'Browse our collection of exercises with detailed instructions',
        createExercise: 'Create Exercise',
        allExercises: 'All Exercises',
        myExercises: 'My Exercises',
        searchPlaceholder: 'Search exercises...',
        filters: 'Filters',
        filterExercises: 'Filter Exercises',
        clearAll: 'Clear all',
        clearFilters: 'Clear Filters',
        category: 'Category',
        allCategories: 'All Categories',
        muscleGroup: 'Muscle Group',
        allMuscleGroups: 'All Muscle Groups',
        difficulty: 'Difficulty',
        allDifficulties: 'All Difficulties',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
        noExercisesFound: 'No exercises found',
        tryAdjusting: 'Try adjusting your search or filters',
        showing: 'Showing',
        of: 'of',
        exercise: 'exercise',
        custom: 'Custom',
        loading: 'Loading...',
        loadMore: 'Load More',
        remaining: 'remaining',
        page: 'Page',
        deleteConfirm: 'Are you sure you want to delete this exercise?'
      },
      
      // Landing Page
      landing: {
        hero: {
          title: 'Your Smart',
          subtitle: 'Workout Planner',
          description: 'Create custom workouts, follow structured programs, and track your fitness journey. Everything you need to reach your goals, in one place.'
        },
        cta: {
          getStarted: 'Get Started Free',
          browseExercises: 'Browse Exercises',
          ready: 'Ready to Start Your Fitness Journey?',
          description: 'Join FitFlow today and take control of your training. Create your first workout in minutes.',
          createAccount: 'Create Free Account',
          haveAccount: 'Already have an account?'
        },
        features: {
          title: 'Everything You Need to Succeed',
          subtitle: 'FitFlow provides all the tools you need to plan, execute, and track your fitness journey.',
          exercise: {
            title: 'Exercise Library',
            description: 'Browse hundreds of exercises with detailed instructions, images, and muscle group targeting.'
          },
          workout: {
            title: 'Custom Workouts',
            description: 'Build personalized workouts by selecting exercises and configuring sets, reps, and rest times.'
          },
          program: {
            title: 'Training Programs',
            description: 'Combine workouts into structured weekly programs or follow our predefined plans.'
          },
          tracking: {
            title: 'Track Progress',
            description: 'Log your completed workouts and monitor your consistency and improvements over time.'
          }
        },
        why: {
          title: 'Why Choose FitFlow?',
          description: 'Stop juggling multiple apps and scattered notes. FitFlow brings everything together in one intuitive platform designed for fitness enthusiasts at every level.'
        },
        benefits: {
          0: 'No more scattered notes or multiple apps',
          1: 'Access your workouts anywhere, anytime',
          2: 'Follow structured programs or create your own',
          3: 'Track your progress and stay motivated',
          4: 'Works on all devices - desktop, tablet, mobile',
          5: 'Free to use with all core features'
        },
        stats: {
          users: 'Active Users',
          exercises: 'Exercises',
          responsive: 'Responsive',
          free: 'Free',
          toUse: 'To Use'
        }
      },
      
      // Not Found
      notFound: {
        title: 'Page Not Found',
        description: "Sorry, the page you're looking for doesn't exist or has been moved.",
        goHome: 'Go Home',
        goBack: 'Go Back'
      },
      
      // Profile
      profile: {
        title: 'Profile Settings',
        personalInfo: 'Personal Information',
        fullName: 'Full Name',
        emailAddress: 'Email Address',
        fitnessGoal: 'Fitness Goal',
        selectGoal: 'Select a goal',
        weightLoss: 'Weight Loss',
        muscleGain: 'Muscle Gain',
        strength: 'Strength Training',
        endurance: 'Endurance',
        flexibility: 'Flexibility',
        general: 'General Fitness',
        experienceLevel: 'Experience Level',
        selectLevel: 'Select your level',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmNewPassword: 'Confirm New Password',
        updateProfile: 'Update Profile',
        updatePassword: 'Update Password',
        updating: 'Updating...',
        profileUpdated: 'Profile updated successfully!',
        passwordUpdated: 'Password updated successfully!',
        passwordsNoMatch: 'New passwords do not match',
        passwordMinLength: 'New password must be at least 6 characters',
        updateFailed: 'Failed to update',
        show: 'Show',
        hide: 'Hide'
      },
      
      // Workout Detail
      workoutDetail: {
        backToWorkouts: 'Back to Workouts',
        notFound: 'Workout not found',
        editAsMyWorkout: 'Edit as My Workout',
        totalSets: 'Total Sets',
        minutes: 'Minutes',
        startWorkout: 'Start Workout',
        exercises: 'Exercises',
        noExercises: 'No exercises in this workout',
        addExercises: 'Add Exercises',
        sets: 'sets',
        reps: 'reps',
        rest: 'rest',
        deleteConfirm: 'Are you sure you want to delete this workout?'
      },
      
      // Program Detail
      programDetail: {
        backToPrograms: 'Back to Programs',
        notFound: 'Program not found',
        predefined: 'Predefined',
        tryProgram: 'Try This Program',
        weeks: 'Weeks',
        workoutsPerWeek: 'Workouts/Week',
        weeklySchedule: 'Weekly Schedule',
        restDay: 'Rest day',
        exercises: 'exercises',
        deleteConfirm: 'Are you sure you want to delete this program?'
      },
      
      // Active Workout
      activeWorkout: {
        cancel: 'Cancel',
        finish: 'Finish',
        save: 'Save',
        addExercise: 'Add Exercise',
        addSet: 'Add Set',
        setsCompleted: 'sets completed',
        editSet: 'Edit Set',
        weight: 'Weight (kg)',
        reps: 'Reps',
        set: 'Set',
        removeExercise: 'Remove this exercise from the workout?',
        finishConfirm: 'Finish and save this workout?',
        incompleteSets: 'You have {{count}} incomplete set. Only completed sets will be logged.\n\nFinish workout anyway?',
        incompleteSets_plural: 'You have {{count}} incomplete sets. Only completed sets will be logged.\n\nFinish workout anyway?',
        cancelConfirm: 'Discard this workout session?',
        searchExercises: 'Search exercises...',
        searching: 'Searching...',
        exercisesFound: '{{count}} exercise',
        exercisesFound_plural: '{{count}} exercises',
        createNew: 'Create New',
        noExercisesFound: 'No exercises found matching "{{query}}"',
        startTyping: 'Start typing to search exercises',
        createExercise: 'Create "{{name}}"',
        createNewExercise: 'Create New Exercise',
        exerciseName: 'Exercise Name',
        exerciseNamePlaceholder: 'e.g., Cable Chest Fly',
        description: 'Description',
        descriptionPlaceholder: 'Brief description of the exercise...',
        muscleGroup: 'Muscle Group',
        muscleGroupPlaceholder: 'e.g., Chest, Back',
        category: 'Category',
        strength: 'Strength',
        cardio: 'Cardio',
        flexibility: 'Flexibility',
        bodyweight: 'Bodyweight',
        machine: 'Machine',
        equipment: 'Equipment',
        equipmentPlaceholder: 'e.g., Dumbbells, Cable',
        difficulty: 'Difficulty',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
        back: 'Back',
        createAndAdd: 'Create & Add',
        saveWorkoutTemplate: 'Save Workout Template',
        workoutName: 'Workout Name',
        workoutNamePlaceholder: 'e.g., My Custom Upper Body Workout',
        optionalDescription: 'Optional description...',
        exercisesWillBeSaved: '{{count}} exercises with current sets configuration will be saved',
        saveWorkout: 'Save Workout',
        workoutTimeSettings: 'Workout Time Settings',
        timeSettingsSubtitle: 'Override automatic timer with custom start and end times',
        useCustomTime: 'Use Custom Time',
        customTimeDescription: 'Set specific start and end times for this workout',
        startTime: 'Start Time',
        endTime: 'End Time',
        date: 'Date',
        time: 'Time',
        duration: 'Duration',
        close: 'Close',
        apply: 'Apply',
        customTime: 'Custom',
        completed: 'Completed',
        markComplete: 'Mark as complete',
        exerciseCreated: 'Exercise created and added to workout!',
        workoutSaved: 'Workout saved successfully!',
        enterWorkoutName: 'Please enter a workout name',
        errorCreatingExercise: 'Error creating exercise. Please try again.',
        errorSavingWorkout: 'Error saving workout. Please try again.'
      },
      
      // Exercise Detail
      exerciseDetail: {
        backToExercises: 'Back to Exercises',
        notFound: 'Exercise not found',
        targetMuscle: 'Target Muscle',
        equipment: 'Equipment',
        watchVideo: 'Watch Video Tutorial',
        instructions: 'Instructions'
      },
      
      // Workout Builder  
      workoutBuilder: {
        createWorkout: 'Create Workout',
        editWorkout: 'Edit Workout',
        backToWorkouts: 'Back to Workouts',
        workoutName: 'Workout Name',
        workoutNamePlaceholder: 'e.g., Upper Body Blast',
        descriptionOptional: 'Description (optional)',
        descriptionPlaceholder: 'Brief description of this workout...',
        workoutType: 'Workout Type',
        strength: 'Strength',
        cardio: 'Cardio',
        mixed: 'Mixed',
        linkRoute: 'Link Route (Optional)',
        selectRoute: 'Select a route...',
        noRoutesAvailable: 'No routes available',
        createRoute: 'Create Route',
        linkedRoute: 'Linked Route',
        viewRoute: 'View Route',
        removeRoute: 'Remove Route',
        exercises: 'Exercises',
        addExercise: 'Add Exercise',
        noExercises: 'No exercises added yet. Start building your workout!',
        sets: 'Sets',
        reps: 'Reps',
        weight: 'Weight (kg)',
        rest: 'Rest (sec)',
        duration: 'Duration (min)',
        distance: 'Distance (km)',
        calories: 'Calories',
        intensity: 'Intensity',
        intensityLow: 'Low',
        intensityModerate: 'Moderate',
        intensityHigh: 'High',
        notes: 'Notes',
        searchExercises: 'Search exercises...',
        selectExercise: 'Select an exercise',
        filterByCategory: 'Filter by category',
        allCategories: 'All Categories',
        bodyweight: 'Bodyweight',
        flexibility: 'Flexibility',
        machine: 'Machine',
        noExercisesFound: 'No exercises found. Try a different search.',
        createNewExercise: 'Create New Exercise',
        errorRequired: 'Workout name is required',
        errorSaving: 'Failed to save workout. Please try again.',
        cannotEdit: 'Cannot edit predefined workout. Please try copying it first.'
      },
      
      // Exercise Builder
      exerciseBuilder: {
        createExercise: 'Create Exercise',
        editExercise: 'Edit Exercise',
        backToExercises: 'Back to Exercises',
        exerciseName: 'Exercise Name',
        exerciseNamePlaceholder: 'e.g., Barbell Bench Press',
        description: 'Description',
        descriptionPlaceholder: 'Brief description of the exercise...',
        instructions: 'Instructions',
        instructionsPlaceholder: 'Step-by-step instructions...',
        muscleGroup: 'Muscle Group',
        muscleGroupPlaceholder: 'e.g., Chest, Back, Legs',
        category: 'Category',
        strength: 'Strength',
        cardio: 'Cardio',
        flexibility: 'Flexibility',
        bodyweight: 'Bodyweight',
        machine: 'Machine',
        equipment: 'Equipment',
        equipmentPlaceholder: 'e.g., Barbell, Dumbbells',
        difficulty: 'Difficulty',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
        imageUrl: 'Image URL (optional)',
        imageUrlPlaceholder: 'https://example.com/exercise.jpg',
        videoUrl: 'Video URL (optional)',
        videoUrlPlaceholder: 'https://youtube.com/watch?v=...',
        defaultSets: 'Default Sets',
        defaultReps: 'Default Reps',
        defaultDuration: 'Default Duration (seconds)',
        defaultDistance: 'Default Distance (km)',
        errorRequired: 'Exercise name is required',
        errorSaving: 'Failed to save exercise. Please try again.'
      },
      
      // Program Builder
      programBuilder: {
        createProgram: 'Create Program',
        editProgram: 'Edit Program',
        backToPrograms: 'Back to Programs',
        programName: 'Program Name',
        programNamePlaceholder: 'e.g., 12-Week Strength Builder',
        description: 'Description',
        descriptionPlaceholder: 'Brief description of this program...',
        durationWeeks: 'Duration (Weeks)',
        difficulty: 'Difficulty',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
        weeklySchedule: 'Weekly Schedule',
        selectWorkout: 'Select a workout',
        noWorkout: 'No workout',
        restDay: 'Rest Day',
        addWorkout: 'Add Workout',
        errorRequired: 'Program name is required',
        errorSchedule: 'Please add at least one workout to the schedule',
        errorSaving: 'Failed to save program. Please try again.',
        cannotEdit: 'Cannot edit predefined program. Please try copying it first.'
      },
      
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        welcomeBack: 'Welcome back, {{name}}!',
        readyToWorkout: 'Ready to crush your workout today?',
        workoutsThisMonth: 'Workouts This Month',
        dayStreak: 'Day Streak',
        minutesActive: 'Minutes Active',
        myWorkouts: 'My Workouts',
        stats: {
          totalWorkouts: 'Total Workouts',
          thisWeek: 'This Week',
          activePrograms: 'Active Programs',
          currentStreak: 'Day Streak'
        },
        quickActions: 'Quick Actions',
        startWorkout: 'Start Workout',
        createWorkout: 'Create Workout',
        buildNewWorkout: 'Build a new custom workout',
        browseExercises: 'Browse Exercises',
        exploreLibrary: 'Explore the exercise library',
        myPrograms: 'My Programs',
        viewPrograms: 'View training programs',
        browsePrograms: 'Browse Programs',
        recentWorkouts: 'Recent Workouts',
        noWorkoutsYet: 'No workouts yet',
        createFirstWorkout: 'Create your first workout to get started!',
        noWorkouts: 'No recent workouts',
        getStarted: 'Start your first workout to see it here'
      },
      
      // Workouts
      workouts: {
        title: 'Workouts',
        subtitle: 'Build and manage your training sessions',
        create: 'Create Workout',
        myWorkouts: 'My Workouts',
        predefined: 'Predefined',
        search: 'Search workouts...',
        workoutType: 'Workout Type',
        filterAll: 'All',
        filterStrength: 'Strength',
        filterCardio: 'Cardio',
        filterMixed: 'Mixed',
        filterFlexibility: 'Flexibility',
        noWorkouts: 'No workouts yet',
        noPredefined: 'No predefined workouts',
        createFirst: 'Create your first workout to get started!',
        predefinedWillAppear: 'Predefined workouts will appear here',
        noWorkoutsFound: 'No workouts found',
        tryDifferentSearch: 'Try a different search term',
        duplicate: 'Duplicate',
        editAsMyWorkout: 'Edit as My Workout',
        copyToMyWorkouts: 'Copy to My Workouts',
        exercises: 'exercises',
        minutes: 'minutes',
        startWorkout: 'Start Workout',
        editWorkout: 'Edit',
        deleteWorkout: 'Delete'
      },
      
      // Programs
      programs: {
        title: 'Training Programs',
        subtitle: 'Structured workout plans for your goals',
        create: 'Create Program',
        createProgram: 'Create Program',
        myPrograms: 'My Programs',
        predefined: 'Predefined',
        browse: 'Browse Programs',
        search: 'Search programs...',
        difficultyLevel: 'Difficulty Level',
        filterAll: 'All',
        filterBeginner: 'Beginner',
        filterIntermediate: 'Intermediate',
        filterAdvanced: 'Advanced',
        noPrograms: 'No programs yet',
        noPredefined: 'No predefined programs',
        createFirst: 'Create your first program to get started!',
        predefinedWillAppear: 'Check back later for predefined programs',
        noProgramsFound: 'No programs found',
        tryDifferentSearch: 'Try a different search term',
        weeks: 'weeks',
        workouts: 'workouts',
        predefinedBadge: 'Predefined',
        tryProgram: 'Try This Program',
        viewProgram: 'View Program',
        startProgram: 'Start Program',
        continueProgram: 'Continue'
      },
      
      // Routes
      routes: {
        title: 'Route Planner',
        create: 'New',
        myRoutes: 'My Routes',
        editRoute: 'Edit Route',
        newRoute: 'New Route',
        routeName: 'Route name',
        activityType: {
          running: '🏃 Running',
          biking: '🚴 Biking',
          walking: '🚶 Walking',
          hiking: '🥾 Hiking'
        },
        routeOptions: 'Route Options',
        routeType: 'Route Type',
        avoid: 'Avoid',
        drawRoute: 'Draw Route',
        drawing: 'Drawing...',
        saveRoute: 'Save Route',
        undo: 'Undo',
        clear: 'Clear',
        waypoints: 'Waypoints',
        dragToReorder: 'Drag to reorder • Click × to remove',
        tapToAdd: '📍 Tap map to add waypoints',
        dragMarkers: 'Drag markers to adjust position',
        createWorkout: 'Create Workout',
        noRoutes: 'No routes yet. Create your first route!'
      },
      
      // Statistics
      statistics: {
        title: 'Statistics',
        subtitle: 'Track your progress and analyze your workouts',
        period: {
          week: 'Last 7 days',
          month: 'Last 30 days',
          quarter: 'Last 90 days',
          year: 'Last year'
        },
        overview: {
          workouts: 'Workouts',
          totalTime: 'Total Time',
          dayStreak: 'Day Streak',
          avgDuration: 'Avg Duration'
        },
        charts: {
          workoutsOverTime: 'Workouts Over Time',
          workoutsByDay: 'Workouts by Day',
          weeklyVolume: 'Weekly Volume (Total Weight Lifted)',
          muscleDistribution: 'Muscle Group Distribution',
          workoutTypes: 'Workout Types',
          workoutTimes: 'Workout Times'
        },
        noData: 'No workout data for this period',
        noVolumeData: 'No volume data for this period',
        noMuscleData: 'No muscle group data for this period',
        noTypeData: 'No workout type data',
        noTimeData: 'No workout time data',
        records: {
          title: 'Personal Records',
          totalVolume: 'Total Volume',
          longestWorkout: 'Longest Workout',
          heaviestLift: 'Heaviest Lift',
          mostReps: 'Most Reps',
          allTime: 'All time',
          topLifts: 'Top 5 Heaviest Lifts',
          maxWeight: 'Max weight',
          exercise: 'Exercise',
          muscle: 'Muscle',
          weight: 'Weight'
        },
        topExercises: {
          title: 'Top Exercises',
          exercise: 'Exercise',
          category: 'Category',
          timesPerformed: 'Times Performed',
          maxWeight: 'Max Weight',
          avgWeight: 'Avg Weight',
          progress: 'Progress',
          sessions: 'Sessions',
          max: 'Max',
          avg: 'Avg',
          viewProgress: 'View progress',
          tapToInspect: 'Tap to inspect',
          view: 'View',
          noData: 'No exercise data for this period',
          startLogging: 'Start logging your workouts to see progress'
        },
        exerciseProgress: {
          title: 'Progress',
          maxWeight: 'Max Weight',
          maxReps: 'Max Reps',
          maxVolume: 'Max Volume',
          sessions: 'Sessions',
          weightLabel: 'Weight (kg)',
          noProgressData: 'No progress data available'
        }
      },
      
      // Auth
      auth: {
        welcomeBack: 'Welcome back',
        loginToContinue: 'Log in to continue your fitness journey',
        createAccount: 'Create your account',
        startJourney: 'Start your fitness journey today',
        login: 'Log in',
        loginFailed: 'Login failed',
        signup: 'Sign Up',
        signUp: 'Sign up',
        email: 'Email',
        emailAddress: 'Email address',
        password: 'Password',
        firstName: 'First name',
        lastName: 'Last name',
        confirmPassword: 'Confirm password',
        passwordMinLength: 'Must be at least 6 characters',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        alreadyHaveAccount: 'Already have an account?',
        signupNow: 'Sign up now',
        loginNow: 'Log in',
        loggingIn: 'Logging in...',
        signingUp: 'Signing up...',
        demoCredentials: 'Demo credentials:'
      },
      
      // Workout History
      history: {
        title: 'Workout History',
        workouts: 'Workouts',
        totalTime: 'Total Time',
        totalSets: 'Total Sets',
        recent: 'Recent Workouts',
        noLogs: 'No workouts logged yet',
        startLogging: 'Start logging your workouts to track your progress!',
        goToWorkouts: 'Go to Workouts'
      },
      
      // Footer
      footer: {
        tagline: 'Your smart workout planner. Create custom workouts, follow structured programs, and track your fitness journey all in one place.',
        quickLinks: 'Quick Links',
        exerciseLibrary: 'Exercise Library',
        getStarted: 'Get Started',
        logIn: 'Log In',
        contact: 'Contact',
        madeWith: 'Made with',
        by: 'by'
      },
      
      // Errors & Messages
      messages: {
        error: 'Error',
        success: 'Success',
        saved: 'Saved successfully',
        deleted: 'Deleted successfully',
        loginError: 'Invalid email or password',
        signupError: 'Could not create account',
        requiredField: 'This field is required',
        invalidEmail: 'Invalid email address',
        passwordMismatch: 'Passwords do not match',
        confirmDelete: 'Are you sure you want to delete this?'
      }
    }
  },
  sv: {
    translation: {
      // Navigation
      nav: {
        exercises: 'Övningar',
        equipment: 'Utrustning',
        dashboard: 'Översikt',
        workouts: 'Träningspass',
        programs: 'Program',
        routes: 'Rutter',
        stats: 'Statistik',
        profile: 'Profil',
        admin: 'Admin Panel',
        logout: 'Logga ut',
        login: 'Logga in',
        signup: 'Registrera'
      },
      
      // Common
      common: {
        save: 'Spara',
        cancel: 'Avbryt',
        delete: 'Ta bort',
        edit: 'Redigera',
        create: 'Skapa',
        search: 'Sök',
        filter: 'Filtrera',
        close: 'Stäng',
        back: 'Tillbaka',
        next: 'Nästa',
        previous: 'Föregående',
        loading: 'Laddar...',
        name: 'Namn',
        description: 'Beskrivning',
        type: 'Typ',
        category: 'Kategori',
        difficulty: 'Svårighetsgrad',
        duration: 'Varaktighet',
        distance: 'Distans',
        reps: 'Repetitioner',
        sets: 'Set',
        weight: 'Vikt',
        notes: 'Anteckningar',
        date: 'Datum',
        time: 'Tid',
        start: 'Start',
        finish: 'Avsluta',
        complete: 'Klar',
        incomplete: 'Ofullständig',
        view: 'Visa',
        viewAll: 'Visa alla',
        details: 'Detaljer',
        exercises: 'övningar',
        log: 'Logg',
        days: {
          monday: 'Måndag',
          tuesday: 'Tisdag',
          wednesday: 'Onsdag',
          thursday: 'Torsdag',
          friday: 'Fredag',
          saturday: 'Lördag',
          sunday: 'Söndag'
        },
        categories: {
          strength: 'Styrka',
          cardio: 'Kondition',
          flexibility: 'Flexibilitet',
          bodyweight: 'Kroppsvikt',
          machine: 'Maskin',
          mixed: 'Blandat'
        },
        difficulties: {
          beginner: 'Nybörjare',
          intermediate: 'Medel',
          advanced: 'Avancerad'
        }
      },
            // Exercises
      exercises: {
        library: 'Övningsbibliotek',
        browseCollection: 'Bläddra i vår samling av övningar med detaljerade instruktioner',
        createExercise: 'Skapa Övning',
        allExercises: 'Alla Övningar',
        myExercises: 'Mina Övningar',
        searchPlaceholder: 'Sök övningar...',
        filters: 'Filter',
        filterExercises: 'Filtrera Övningar',
        clearAll: 'Rensa alla',
        clearFilters: 'Rensa Filter',
        category: 'Kategori',
        allCategories: 'Alla Kategorier',
        muscleGroup: 'Muskelgrupp',
        allMuscleGroups: 'Alla Muskelgrupper',
        difficulty: 'Svårighetsgrad',
        allDifficulties: 'Alla Svårighetsgrader',
        beginner: 'Nybörjare',
        intermediate: 'Medel',
        advanced: 'Avancerad',
        noExercisesFound: 'Inga övningar hittades',
        tryAdjusting: 'Prova att justera din sökning eller filter',
        showing: 'Visar',
        of: 'av',
        exercise: 'övning',
        custom: 'Anpassad',
        loading: 'Laddar...',
        loadMore: 'Ladda Mer',
        remaining: 'kvar',
        page: 'Sida',
        deleteConfirm: 'Är du säker på att du vill ta bort denna övning?'
      },
            // Landing Page
      landing: {
        hero: {
          title: 'Din Smarta',
          subtitle: 'Träningsplanerare',
          description: 'Skapa anpassade träningspass, följ strukturerade program och spåra din fitnessresa. Allt du behöver för att nå dina mål, på ett ställe.'
        },
        cta: {
          getStarted: 'Kom Igång Gratis',
          browseExercises: 'Bläddra Övningar',
          ready: 'Redo att Starta Din Fitnessresa?',
          description: 'Gå med i FitFlow idag och ta kontroll över din träning. Skapa ditt första träningspass på några minuter.',
          createAccount: 'Skapa Gratis Konto',
          haveAccount: 'Har du redan ett konto?'
        },
        features: {
          title: 'Allt Du Behöver För Att Lyckas',
          subtitle: 'FitFlow tillhandahåller alla verktyg du behöver för att planera, genomföra och spåra din fitnessresa.',
          exercise: {
            title: 'Övningsbibliotek',
            description: 'Bläddra bland hundratals övningar med detaljerade instruktioner, bilder och muskelgruppmålriktning.'
          },
          workout: {
            title: 'Anpassade Träningspass',
            description: 'Bygg personliga träningspass genom att välja övningar och konfigurera set, repetitioner och vilotider.'
          },
          program: {
            title: 'Träningsprogram',
            description: 'Kombinera träningspass till strukturerade veckoprogram eller följ våra fördefinierade planer.'
          },
          tracking: {
            title: 'Spåra Framsteg',
            description: 'Logga dina genomförda träningspass och övervaka din konsistens och förbättringar över tid.'
          }
        },
        why: {
          title: 'Varför Välja FitFlow?',
          description: 'Sluta jonglera med flera appar och spridda anteckningar. FitFlow samlar allt på en intuitiv plattform designad för fitnessentusiaster på alla nivåer.'
        },
        benefits: {
          0: 'Inga fler spridda anteckningar eller flera appar',
          1: 'Kom åt dina träningspass var som helst, när som helst',
          2: 'Följ strukturerade program eller skapa egna',
          3: 'Spåra dina framsteg och håll motivationen',
          4: 'Fungerar på alla enheter - dator, surfplatta, mobil',
          5: 'Gratis att använda med alla kärnfunktioner'
        },
        stats: {
          users: 'Aktiva Användare',
          exercises: 'Övningar',
          responsive: 'Responsiv',
          free: 'Gratis',
          toUse: 'Att Använda'
        }
      },
      
      // Not Found
      notFound: {
        title: 'Sidan Hittades Inte',
        description: 'Tyvärr, sidan du letar efter finns inte eller har flyttats.',
        goHome: 'Gå Hem',
        goBack: 'Gå Tillbaka'
      },
      
      // Profile
      profile: {
        title: 'Profilinställningar',
        personalInfo: 'Personlig Information',
        fullName: 'Fullständigt Namn',
        emailAddress: 'E-postadress',
        fitnessGoal: 'Fitnessmål',
        selectGoal: 'Välj ett mål',
        weightLoss: 'Viktminskning',
        muscleGain: 'Muskelökning',
        strength: 'Styrketräning',
        endurance: 'Uthållighet',
        flexibility: 'Flexibilitet',
        general: 'Allmän Fitness',
        experienceLevel: 'Erfarenhetsnivå',
        selectLevel: 'Välj din nivå',
        beginner: 'Nybörjare',
        intermediate: 'Medel',
        advanced: 'Avancerad',
        changePassword: 'Ändra Lösenord',
        currentPassword: 'Nuvarande Lösenord',
        newPassword: 'Nytt Lösenord',
        confirmNewPassword: 'Bekräfta Nytt Lösenord',
        updateProfile: 'Uppdatera Profil',
        updatePassword: 'Uppdatera Lösenord',
        updating: 'Uppdaterar...',
        profileUpdated: 'Profil uppdaterad framgångsrikt!',
        passwordUpdated: 'Lösenord uppdaterat framgångsrikt!',
        passwordsNoMatch: 'Nya lösenorden matchar inte',
        passwordMinLength: 'Nytt lösenord måste vara minst 6 tecken',
        updateFailed: 'Misslyckades att uppdatera',
        show: 'Visa',
        hide: 'Dölj'
      },
      
      // Workout Detail
      workoutDetail: {
        backToWorkouts: 'Tillbaka till Träningspass',
        notFound: 'Träningspass hittades inte',
        editAsMyWorkout: 'Redigera som Mitt Träningspass',
        totalSets: 'Totalt Set',
        minutes: 'Minuter',
        startWorkout: 'Starta Träningspass',
        exercises: 'Övningar',
        noExercises: 'Inga övningar i detta träningspass',
        addExercises: 'Lägg till Övningar',
        sets: 'set',
        reps: 'repetitioner',
        rest: 'vila',
        deleteConfirm: 'Är du säker på att du vill ta bort detta träningspass?'
      },
      
      // Program Detail
      programDetail: {
        backToPrograms: 'Tillbaka till Program',
        notFound: 'Program hittades inte',
        predefined: 'Fördefinierad',
        tryProgram: 'Prova Detta Program',
        weeks: 'Veckor',
        workoutsPerWeek: 'Träningspass/Vecka',
        weeklySchedule: 'Veckoschema',
        restDay: 'Vilodag',
        exercises: 'övningar',
        deleteConfirm: 'Är du säker på att du vill ta bort detta program?'
      },
      
      // Active Workout
      activeWorkout: {
        cancel: 'Avbryt',
        finish: 'Avsluta',
        save: 'Spara',
        addExercise: 'Lägg till Övning',
        addSet: 'Lägg till Set',
        setsCompleted: 'set färdiga',
        editSet: 'Redigera Set',
        weight: 'Vikt (kg)',
        reps: 'Repetitioner',
        set: 'Set',
        removeExercise: 'Ta bort denna övning från träningspasset?',
        finishConfirm: 'Avsluta och spara detta träningspass?',
        incompleteSets: 'Du har {{count}} ofullständigt set. Endast färdiga set kommer att loggas.\n\nAvsluta träningspasset ändå?',
        incompleteSets_plural: 'Du har {{count}} ofullständiga set. Endast färdiga set kommer att loggas.\n\nAvsluta träningspasset ändå?',
        cancelConfirm: 'Kassera denna träningssession?',
        searchExercises: 'Sök övningar...',
        searching: 'Söker...',
        exercisesFound: '{{count}} övning',
        exercisesFound_plural: '{{count}} övningar',
        createNew: 'Skapa Ny',
        noExercisesFound: 'Inga övningar hittades som matchar "{{query}}"',
        startTyping: 'Börja skriva för att söka övningar',
        createExercise: 'Skapa "{{name}}"',
        createNewExercise: 'Skapa Ny Övning',
        exerciseName: 'Övningsnamn',
        exerciseNamePlaceholder: 't.ex., Kabelflyes',
        description: 'Beskrivning',
        descriptionPlaceholder: 'Kort beskrivning av övningen...',
        muscleGroup: 'Muskelgrupp',
        muscleGroupPlaceholder: 't.ex., Bröst, Rygg',
        category: 'Kategori',
        strength: 'Styrka',
        cardio: 'Kondition',
        flexibility: 'Flexibilitet',
        bodyweight: 'Kroppsvikt',
        machine: 'Maskin',
        equipment: 'Utrustning',
        equipmentPlaceholder: 't.ex., Hantlar, Kabel',
        difficulty: 'Svårighetsgrad',
        beginner: 'Nybörjare',
        intermediate: 'Medel',
        advanced: 'Avancerad',
        back: 'Tillbaka',
        createAndAdd: 'Skapa & Lägg Till',
        saveWorkoutTemplate: 'Spara Träningspassmall',
        workoutName: 'Träningspassnamn',
        workoutNamePlaceholder: 't.ex., Mitt Anpassade Överkroppspass',
        optionalDescription: 'Valfri beskrivning...',
        exercisesWillBeSaved: '{{count}} övningar med nuvarande setkonfiguration kommer att sparas',
        saveWorkout: 'Spara Träningspass',
        workoutTimeSettings: 'Träningspasstidsinställningar',
        timeSettingsSubtitle: 'Åsidosätt automatisk timer med anpassade start- och sluttider',
        useCustomTime: 'Använd Anpassad Tid',
        customTimeDescription: 'Ställ in specifika start- och sluttider för detta träningspass',
        startTime: 'Starttid',
        endTime: 'Sluttid',
        date: 'Datum',
        time: 'Tid',
        duration: 'Varaktighet',
        close: 'Stäng',
        apply: 'Tillämpa',
        customTime: 'Anpassad',
        completed: 'Slutförd',
        markComplete: 'Markera som slutförd',
        exerciseCreated: 'Övning skapad och tillagd till träningspasset!',
        workoutSaved: 'Träningspass sparat framgångsrikt!',
        enterWorkoutName: 'Vänligen ange ett träningspassnamn',
        errorCreatingExercise: 'Fel vid skapande av övning. Vänligen försök igen.',
        errorSavingWorkout: 'Fel vid sparande av träningspass. Vänligen försök igen.'
      },
      
      // Exercise Detail
      exerciseDetail: {
        backToExercises: 'Tillbaka till Övningar',
        notFound: 'Övning hittades inte',
        targetMuscle: 'Målmuskel',
        equipment: 'Utrustning',
        watchVideo: 'Se Videohandledning',
        instructions: 'Instruktioner'
      },
      
      // Workout Builder
      workoutBuilder: {
        createWorkout: 'Skapa Träningspass',
        editWorkout: 'Redigera Träningspass',
        backToWorkouts: 'Tillbaka till Träningspass',
        workoutName: 'Träningspassnamn',
        workoutNamePlaceholder: 't.ex., Överkroppsexplosion',
        descriptionOptional: 'Beskrivning (valfritt)',
        descriptionPlaceholder: 'Kort beskrivning av detta träningspass...',
        workoutType: 'Träningspasstyp',
        strength: 'Styrka',
        cardio: 'Kondition',
        mixed: 'Blandat',
        linkRoute: 'Länka Rutt (Valfritt)',
        selectRoute: 'Välj en rutt...',
        noRoutesAvailable: 'Inga rutter tillgängliga',
        createRoute: 'Skapa Rutt',
        linkedRoute: 'Länkad Rutt',
        viewRoute: 'Visa Rutt',
        removeRoute: 'Ta bort Rutt',
        exercises: 'Övningar',
        addExercise: 'Lägg till Övning',
        noExercises: 'Inga övningar tillagda ännu. Börja bygga ditt träningspass!',
        sets: 'Set',
        reps: 'Repetitioner',
        weight: 'Vikt (kg)',
        rest: 'Vila (sek)',
        duration: 'Varaktighet (min)',
        distance: 'Distans (km)',
        calories: 'Kalorier',
        intensity: 'Intensitet',
        intensityLow: 'Låg',
        intensityModerate: 'Måttlig',
        intensityHigh: 'Hög',
        notes: 'Anteckningar',
        searchExercises: 'Sök övningar...',
        selectExercise: 'Välj en övning',
        filterByCategory: 'Filtrera efter kategori',
        allCategories: 'Alla Kategorier',
        bodyweight: 'Kroppsvikt',
        flexibility: 'Flexibilitet',
        machine: 'Maskin',
        noExercisesFound: 'Inga övningar hittades. Prova en annan sökning.',
        createNewExercise: 'Skapa Ny Övning',
        errorRequired: 'Träningspassnamn krävs',
        errorSaving: 'Misslyckades att spara träningspass. Vänligen försök igen.',
        cannotEdit: 'Kan inte redigera fördefinierat träningspass. Vänligen kopiera det först.'
      },
      
      // Exercise Builder
      exerciseBuilder: {
        createExercise: 'Skapa Övning',
        editExercise: 'Redigera Övning',
        backToExercises: 'Tillbaka till Övningar',
        exerciseName: 'Övningsnamn',
        exerciseNamePlaceholder: 't.ex., Bänkpress med Skivstång',
        description: 'Beskrivning',
        descriptionPlaceholder: 'Kort beskrivning av övningen...',
        instructions: 'Instruktioner',
        instructionsPlaceholder: 'Steg-för-steg instruktioner...',
        muscleGroup: 'Muskelgrupp',
        muscleGroupPlaceholder: 't.ex., Bröst, Rygg, Ben',
        category: 'Kategori',
        strength: 'Styrka',
        cardio: 'Kondition',
        flexibility: 'Flexibilitet',
        bodyweight: 'Kroppsvikt',
        machine: 'Maskin',
        equipment: 'Utrustning',
        equipmentPlaceholder: 't.ex., Skivstång, Hantlar',
        difficulty: 'Svårighetsgrad',
        beginner: 'Nybörjare',
        intermediate: 'Medel',
        advanced: 'Avancerad',
        imageUrl: 'Bild-URL (valfritt)',
        imageUrlPlaceholder: 'https://example.com/exercise.jpg',
        videoUrl: 'Video-URL (valfritt)',
        videoUrlPlaceholder: 'https://youtube.com/watch?v=...',
        defaultSets: 'Standard Set',
        defaultReps: 'Standard Repetitioner',
        defaultDuration: 'Standard Varaktighet (sekunder)',
        defaultDistance: 'Standard Distans (km)',
        errorRequired: 'Övningsnamn krävs',
        errorSaving: 'Misslyckades att spara övning. Vänligen försök igen.'
      },
      
      // Program Builder
      programBuilder: {
        createProgram: 'Skapa Program',
        editProgram: 'Redigera Program',
        backToPrograms: 'Tillbaka till Program',
        programName: 'Programnamn',
        programNamePlaceholder: 't.ex., 12-veckors Styrkebyggare',
        description: 'Beskrivning',
        descriptionPlaceholder: 'Kort beskrivning av detta program...',
        durationWeeks: 'Varaktighet (Veckor)',
        difficulty: 'Svårighetsgrad',
        beginner: 'Nybörjare',
        intermediate: 'Medel',
        advanced: 'Avancerad',
        weeklySchedule: 'Veckoschema',
        selectWorkout: 'Välj ett träningspass',
        noWorkout: 'Inget träningspass',
        restDay: 'Vilodag',
        addWorkout: 'Lägg till Träningspass',
        errorRequired: 'Programnamn krävs',
        errorSchedule: 'Vänligen lägg till minst ett träningspass i schemat',
        errorSaving: 'Misslyckades att spara program. Vänligen försök igen.',
        cannotEdit: 'Kan inte redigera fördefinierat program. Vänligen kopiera det först.'
      },
      
      // Dashboard
      dashboard: {
        title: 'Översikt',
        welcomeBack: 'Välkommen tillbaka, {{name}}!',
        readyToWorkout: 'Redo att krossa ditt träningspass idag?',
        workoutsThisMonth: 'Träningspass Denna Månad',
        dayStreak: 'Dagars Streak',
        minutesActive: 'Aktiva Minuter',
        myWorkouts: 'Mina Träningspass',
        stats: {
          totalWorkouts: 'Totalt Träningspass',
          thisWeek: 'Denna Vecka',
          activePrograms: 'Aktiva Program',
          currentStreak: 'Dagars Streak'
        },
        quickActions: 'Snabbåtgärder',
        startWorkout: 'Starta Träningspass',
        createWorkout: 'Skapa Träningspass',
        buildNewWorkout: 'Bygg ett nytt anpassat träningspass',
        browseExercises: 'Bläddra Övningar',
        exploreLibrary: 'Utforska övningsbiblioteket',
        myPrograms: 'Mina Program',
        viewPrograms: 'Visa träningsprogram',
        browsePrograms: 'Bläddra Program',
        recentWorkouts: 'Senaste Träningspassen',
        noWorkoutsYet: 'Inga träningspass än',
        createFirstWorkout: 'Skapa ditt första träningspass för att komma igång!',
        noWorkouts: 'Inga senaste träningspass',
        getStarted: 'Starta ditt första träningspass för att se det här'
      },
      
      // Workouts
      workouts: {
        title: 'Träningspass',
        subtitle: 'Bygg och hantera dina träningspass',
        create: 'Skapa Träningspass',
        myWorkouts: 'Mina Träningspass',
        predefined: 'Fördefinierade',
        search: 'Sök träningspass...',
        workoutType: 'Träningstyp',
        filterAll: 'Alla',
        filterStrength: 'Styrka',
        filterCardio: 'Kondition',
        filterMixed: 'Blandat',
        filterFlexibility: 'Flexibilitet',
        noWorkouts: 'Inga träningspass än',
        noPredefined: 'Inga fördefinierade träningspass',
        createFirst: 'Skapa ditt första träningspass för att komma igång!',
        predefinedWillAppear: 'Fördefinierade träningspass kommer att visas här',
        noWorkoutsFound: 'Inga träningspass hittades',
        tryDifferentSearch: 'Prova ett annat sökord',
        duplicate: 'Duplicera',
        editAsMyWorkout: 'Redigera som Mitt Träningspass',
        copyToMyWorkouts: 'Kopiera till Mina Träningspass',
        exercises: 'övningar',
        minutes: 'minuter',
        startWorkout: 'Starta Träningspass',
        editWorkout: 'Redigera',
        deleteWorkout: 'Ta bort'
      },
      
      // Programs
      programs: {
        title: 'Träningsprogram',
        subtitle: 'Strukturerade träningsplaner för dina mål',
        create: 'Skapa Program',
        createProgram: 'Skapa Program',
        myPrograms: 'Mina Program',
        predefined: 'Fördefinierade',
        browse: 'Bläddra Program',
        search: 'Sök program...',
        difficultyLevel: 'Svårighetsgrad',
        filterAll: 'Alla',
        filterBeginner: 'Nybörjare',
        filterIntermediate: 'Medel',
        filterAdvanced: 'Avancerad',
        noPrograms: 'Inga program än',
        noPredefined: 'Inga fördefinierade program',
        createFirst: 'Skapa ditt första program för att komma igång!',
        predefinedWillAppear: 'Kolla tillbaka senare för fördefinierade program',
        noProgramsFound: 'Inga program hittades',
        tryDifferentSearch: 'Prova ett annat sökord',
        weeks: 'veckor',
        workouts: 'träningspass',
        predefinedBadge: 'Fördefinierad',
        tryProgram: 'Prova Detta Program',
        viewProgram: 'Visa Program',
        startProgram: 'Starta Program',
        continueProgram: 'Fortsätt'
      },
      
      // Routes
      routes: {
        title: 'Ruttplanerare',
        create: 'Ny',
        myRoutes: 'Mina Rutter',
        editRoute: 'Redigera Rutt',
        newRoute: 'Ny Rutt',
        routeName: 'Ruttnamn',
        activityType: {
          running: '🏃 Löpning',
          biking: '🚴 Cykling',
          walking: '🚶 Promenad',
          hiking: '🥾 Vandring'
        },
        routeOptions: 'Ruttalternativ',
        routeType: 'Rutttyp',
        avoid: 'Undvik',
        drawRoute: 'Rita Rutt',
        drawing: 'Ritar...',
        saveRoute: 'Spara Rutt',
        undo: 'Ångra',
        clear: 'Rensa',
        waypoints: 'Vägpunkter',
        dragToReorder: 'Dra för att ordna om • Klicka × för att ta bort',
        tapToAdd: '📍 Tryck på kartan för att lägga till vägpunkter',
        dragMarkers: 'Dra markörer för att justera position',
        createWorkout: 'Skapa Träningspass',
        noRoutes: 'Inga rutter än. Skapa din första rutt!'
      },
      
      // Statistics
      statistics: {
        title: 'Statistik',
        subtitle: 'Spåra dina framsteg och analysera dina träningspass',
        period: {
          week: 'Senaste 7 dagarna',
          month: 'Senaste 30 dagarna',
          quarter: 'Senaste 90 dagarna',
          year: 'Senaste året'
        },
        overview: {
          workouts: 'Träningspass',
          totalTime: 'Total Tid',
          dayStreak: 'Dagars Streak',
          avgDuration: 'Genomsnittlig Varaktighet'
        },
        charts: {
          workoutsOverTime: 'Träningspass Över Tid',
          workoutsByDay: 'Träningspass per Dag',
          weeklyVolume: 'Veckovolym (Total Lyft Vikt)',
          muscleDistribution: 'Muskelgruppsfördelning',
          workoutTypes: 'Träningspasstyper',
          workoutTimes: 'Träningstider'
        },
        noData: 'Inga träningsdata för denna period',
        noVolumeData: 'Inga volymdata för denna period',
        noMuscleData: 'Inga muskelgruppsdata för denna period',
        noTypeData: 'Inga träningspasstypsdata',
        noTimeData: 'Inga trän ingstidsdata',
        records: {
          title: 'Personliga Rekord',
          totalVolume: 'Total Volym',
          longestWorkout: 'Längsta Träningspass',
          heaviestLift: 'Tyngsta Lyft',
          mostReps: 'Flest Repetitioner',
          allTime: 'Genom tiderna',
          topLifts: 'Topp 5 Tyngsta Lyft',
          maxWeight: 'Max vikt',
          exercise: 'Övning',
          muscle: 'Muskel',
          weight: 'Vikt'
        },
        topExercises: {
          title: 'Topövningar',
          exercise: 'Övning',
          category: 'Kategori',
          timesPerformed: 'Antal Gånger Utfört',
          maxWeight: 'Max Vikt',
          avgWeight: 'Genomsnittlig Vikt',
          progress: 'Framsteg',
          sessions: 'Sessioner',
          max: 'Max',
          avg: 'Genomsnitt',
          viewProgress: 'Visa framsteg',
          tapToInspect: 'Tryck för att inspektera',
          view: 'Visa',
          noData: 'Inga övningsdata för denna period',
          startLogging: 'Börja logga dina träningspass för att se framsteg'
        },
        exerciseProgress: {
          title: 'Framsteg',
          maxWeight: 'Max Vikt',
          maxReps: 'Max Repetitioner',
          maxVolume: 'Max Volym',
          sessions: 'Sessioner',
          weightLabel: 'Vikt (kg)',
          noProgressData: 'Inga framstegsdata tillgängliga'
        }
      },
      
      // Auth
      auth: {
        welcomeBack: 'Välkommen tillbaka',
        loginToContinue: 'Logga in för att fortsätta din fitnessresa',
        createAccount: 'Skapa ditt konto',
        startJourney: 'Starta din fitnessresa idag',
        login: 'Logga in',
        loginFailed: 'Inloggningen misslyckades',
        signup: 'Registrera',
        signUp: 'Registrera dig',
        email: 'E-post',
        emailAddress: 'E-postadress',
        password: 'Lösenord',
        firstName: 'Förnamn',
        lastName: 'Efternamn',
        confirmPassword: 'Bekräfta Lösenord',
        passwordMinLength: 'Måste vara minst 6 tecken',
        forgotPassword: 'Glömt lösenord?',
        noAccount: 'Har du inget konto?',
        alreadyHaveAccount: 'Har du redan ett konto?',
        signupNow: 'Registrera dig nu',
        loginNow: 'Logga in',
        loggingIn: 'Loggar in...',
        signingUp: 'Registrerar...',
        demoCredentials: 'Demo-inloggningsuppgifter:'
      },
      
      // Workout History
      history: {
        title: 'Träningshistorik',
        workouts: 'Träningspass',
        totalTime: 'Total Tid',
        totalSets: 'Totalt Antal Set',
        recent: 'Senaste Träningspassen',
        noLogs: 'Inga loggade träningspass än',
        startLogging: 'Börja logga dina träningspass för att spåra dina framsteg!',
        goToWorkouts: 'Gå till Träningspass'
      },
      
      // Footer
      footer: {
        tagline: 'Din smarta träningsplanerare. Skapa anpassade träningspass, följ strukturerade program och spåra din fitnessresa på ett ställe.',
        quickLinks: 'Snabblänkar',
        exerciseLibrary: 'Övningsbibliotek',
        getStarted: 'Kom Igång',
        logIn: 'Logga In',
        contact: 'Kontakt',
        madeWith: 'Gjord med',
        by: 'av'
      },
      
      // Errors & Messages
      messages: {
        error: 'Fel',
        success: 'Lyckades',
        saved: 'Sparat framgångsrikt',
        deleted: 'Borttaget framgångsrikt',
        loginError: 'Ogiltig e-post eller lösenord',
        signupError: 'Kunde inte skapa konto',
        requiredField: 'Detta fält är obligatoriskt',
        invalidEmail: 'Ogiltig e-postadress',
        passwordMismatch: 'Lösenorden matchar inte',
        confirmDelete: 'Är du säker på att du vill ta bort detta?'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
