# FitFlow - Smart Workout Planner & Fitness Tracker

FitFlow is a comprehensive fitness application that helps users plan, track, and optimize their workout routines. Built with React and Node.js, it provides a modern and intuitive interface for fitness enthusiasts of all levels, from beginners to advanced athletes.

**Live Demo**: [https://fitflow-plum.vercel.app](https://fitflow-plum.vercel.app)

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

### Multi-Language Support
- **English & Swedish**: Full application translation with i18next
- **Language Switcher**: Toggle between languages from the navbar
- **Persistent Preference**: Language choice saved across sessions

### Accessibility (WCAG 2.1)
- **Skip Links**: Skip to main content for keyboard users
- **ARIA Labels**: All icon buttons have descriptive labels
- **Focus Indicators**: Visible focus states for keyboard navigation
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Screen Reader Support**: Live regions for dynamic content updates
- **Color Contrast**: WCAG AA compliant color combinations

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
- **i18next**: Internationalization (English/Swedish)

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MySQL**: Relational database
- **JWT**: Secure authentication tokens
- **bcryptjs**: Password hashing
- **mysql2**: MySQL client with promise support
- **CORS**: Cross-origin resource sharing

### External APIs
- **OpenRouteService**: Route planning and distance calculations
- **OpenStreetMap/Leaflet**: Interactive map tiles

### Deployment
- **Frontend**: Vercel (Automatic deployments from GitHub)
- **Backend**: Railway (with MySQL database)
- **Database**: Railway MySQL with automated backups

## Live Demo

**Live Application**: [https://fitflow-plum.vercel.app](https://fitflow-plum.vercel.app)

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Demo User | `demo@fitflow.app` | `demo123` |
| Admin | `admin@fitflow.app` | `admin123` |

## Project Structure

```
FitFlow/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── services/         # API service layer
│   │   ├── i18n.js           # Internationalization config
│   │   └── App.jsx           # Main application component
│   └── public/               # Static assets
├── backend/                  # Node.js/Express API
│   └── src/
│       ├── routes/           # API route handlers
│       ├── middleware/       # Auth & validation middleware
│       ├── config/           # Database configuration
│       └── db/               # SQL migrations & seeds
└── README.md
```

## Database Schema

The application uses a relational MySQL database with the following key tables:

- **users**: User accounts and authentication
- **exercises**: Exercise library with muscle groups and equipment
- **workouts**: User-created and predefined workout templates
- **workout_exercises**: Junction table for exercises in workouts
- **programs**: Multi-week training programs
- **program_workouts**: Scheduled workouts within programs
- **workout_logs**: Completed workout history
- **equipment**: Available fitness equipment

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
- JWT-based authentication with 7-day token expiry
- Password hashing with bcrypt (10 salt rounds)
- Protected API routes requiring authentication
- Secure admin-only endpoints with role verification
- CORS configuration for API access control
- Input validation and sanitization

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KewaNCow/FitFlow.git
   cd FitFlow
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure environment variables**
   
   Create `.env` in `/backend`:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=fitflow
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

   Create `.env` in `/frontend`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

5. **Set up the database**
   ```bash
   mysql -u root -p < backend/src/db/schema_complete.sql
   mysql -u root -p < backend/src/db/seed_complete.sql
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

7. **Open the application**
   
   Navigate to `http://localhost:5173`

## Author

**Kevin**
- GitHub: [@KewaNCow](https://github.com/KewaNCow)

## Acknowledgments

- Exercise data compiled from various fitness resources
- Icons by [Lucide](https://lucide.dev/)
- Maps by [OpenStreetMap](https://www.openstreetmap.org/) & [Leaflet](https://leafletjs.com/)
- Route calculations by [OpenRouteService](https://openrouteservice.org/)