# FitFlow - Smart Workout Planner & Fitness Tracker

FitFlow is a comprehensive fitness application that helps users plan, track, and optimize their workout routines. Built with React and Node.js, it provides a modern and intuitive interface for fitness enthusiasts of all levels, from beginners to advanced athletes.

## Features

### Exercise Management
- **Extensive Exercise Library**: Browse 100+ pre-loaded exercises with detailed instructions
- **Smart Filtering**: Filter by muscle group, equipment type, and difficulty level
- **Custom Exercise Builder**: Create your own exercises with detailed specifications
- **Rich Media Support**: View exercise images, GIFs, and video tutorials
- **Equipment Library**: Track and filter exercises by available equipment

### Workout Planning
- **Custom Workout Builder**: Create personalized workout routines with drag-and-drop interface
- **Predefined Workouts**: Access 15+ professionally designed workout templates
  - Beginner Full Body Workouts
  - Intermediate Push/Pull/Legs Split
  - Upper/Lower Body Hypertrophy
  - HIIT & Cardio Sessions
  - Flexibility & Recovery Workouts
- **Smart Filtering**: Filter workouts by type (strength, cardio, mixed, flexibility)
- **Exercise Customization**: Adjust sets, reps, duration, and rest times
- **Copy & Edit**: Duplicate predefined workouts and customize them to your needs

### Program Management
- **Multi-Week Programs**: Build complete training programs with scheduled workouts
- **Predefined Programs**: Choose from 9 professionally designed programs
  - Beginner Strength Foundation (4 weeks)
  - Push Pull Legs Split (6 weeks)
  - Classic Bodybuilding Split (12 weeks)
  - 8-Week Fat Shredder
  - Power & Hypertrophy (10 weeks)
  - Busy Professional Fitness (6 weeks)
  - Summer Shred Challenge
- **Program Scheduling**: Assign workouts to specific days of the week
- **Difficulty Levels**: Filter by beginner, intermediate, or advanced
- **Progress Tracking**: Monitor program completion and adherence

### Workout Tracking & History
- **Live Workout Sessions**: Start workouts with real-time exercise tracking
- **Set Completion**: Mark sets as complete during your workout
- **Workout History**: View all completed workouts with detailed logs
- **Performance Analytics**: Track progress with visual statistics and charts
- **Exercise-Level Stats**: Monitor sets, reps, and weight progression per exercise

### Route Planning (Beta)
- **GPS Route Tracking**: Plan running and cycling routes
- **Interactive Maps**: Powered by Leaflet and OpenStreetMap
- **Distance Tracking**: View route distance and elevation

### User Profile & Admin
- **Secure Authentication**: JWT-based login and registration
- **Profile Management**: Update personal information and preferences
- **Demo Account**: Test the app with pre-populated data (demo@fitflow.app / demo123)
- **Admin Dashboard**: Manage users and system settings (admin access required)

## Tech Stack

### Frontend
- **React 18.2**: Modern React with hooks and context
- **Vite 5**: Lightning-fast build tool and dev server
- **React Router v6**: Client-side routing
- **Tailwind CSS 3**: Utility-first styling
- **Axios**: HTTP client for API requests
- **Lucide React**: Beautiful icon set
- **React Leaflet**: Interactive maps for route planning
- **Recharts**: Data visualization and statistics

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MySQL**: Relational database
- **JWT**: Secure authentication tokens
- **bcryptjs**: Password hashing
- **mysql2**: MySQL client with promise support
- **CORS**: Cross-origin resource sharing

### Deployment
- **Frontend**: Vercel (Automatic deployments from GitHub)
- **Backend**: Railway (with MySQL database)
- **Database**: Railway MySQL with automated backups

## Live Demo

**Live Application**: [https://fitflow-plum.vercel.app](https://fitflow-plum.vercel.app)

**Demo Credentials**:
- Email: `demo@fitflow.app`
- Password: `demo123`

**Admin Credentials**:
- Email: `admin@fitflow.app`
- Password: `admin123`

## Key Features Explained

### Predefined vs Custom Content
- **Predefined Content**: Professional workouts and programs created by the system (marked with blue "Predefined" badge)
- **Protection**: Predefined content cannot be deleted or directly edited by regular users
- **Customization**: Users can copy predefined content to create their own editable versions
- **"Edit as My Workout/Program"**: Quick action to copy and immediately start editing

### Workout Types
- **Strength**: Weight training and resistance exercises
- **Cardio**: Running, cycling, HIIT, and endurance training
- **Mixed**: Combination of strength and cardio
- **Flexibility**: Stretching, yoga, and mobility work

### Program Difficulty Levels
- **Beginner**: 3-4 workouts per week, basic exercises
- **Intermediate**: 4-6 workouts per week, moderate complexity
- **Advanced**: 5-6+ workouts per week, high intensity and volume

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes requiring authentication
- Secure admin-only endpoints
- CORS configuration for API access control

## Author

**Kevin**
- GitHub: [@KewaNCow](https://github.com/KewaNCow)

## Acknowledgments

- Exercise data compiled from various fitness resources
- Icons by [Lucide](https://lucide.dev/)
- Maps by [OpenStreetMap](https://www.openstreetmap.org/) & [Leaflet](https://leafletjs.com/)