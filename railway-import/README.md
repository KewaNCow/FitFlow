# Railway Import Scripts

This folder contains scripts for importing and managing data in the FitFlow database on Railway.

## Scripts

### 1. Initial Import
```bash
npm start
```
Imports the complete database schema and initial seed data including exercises, equipment, and basic workouts/programs.

### 2. Add Real Images
```bash
npm run add-real-images
```
Updates all exercises and programs with real photos from Pexels. Run this after the initial import.

### 3. Add More Content (NEW!)
```bash
npm run add-more-content
```
Adds 10 additional predefined workouts and 5 more programs to expand the content library.

**New Workouts Added:**
- Upper Body Hypertrophy
- Lower Body Hypertrophy
- Arms & Core Blast
- Chest & Back Superset
- Shoulders & Traps
- Full Body Circuit Training
- Tabata HIIT Protocol
- Steady State Endurance
- Deep Stretch Recovery
- Morning Yoga Flow

**New Programs Added:**
- Classic Bodybuilding Split (12 weeks, Intermediate)
- 8-Week Fat Shredder (8 weeks, Intermediate)
- Power & Hypertrophy (10 weeks, Advanced)
- Busy Professional Fitness (6 weeks, Beginner)
- Summer Shred Challenge (6 weeks, Intermediate)

### 4. Fix Demo Password
```bash
npm run fix-password
```
Resets the demo user password if needed.

## Environment Variables

Make sure these are set in your Railway environment:

```env
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway
```

## Running Order

For a fresh database setup:

1. **Initial Import**: `npm start`
2. **Add Images**: `npm run add-real-images`
3. **Add More Content**: `npm run add-more-content`

For an existing database that needs more content:

```bash
npm run add-more-content
```

This script checks if content already exists and skips if it does, so it's safe to run multiple times.

## Features of add_more_content.js

- ✅ Checks for existing content before importing
- ✅ Uses the existing system user (no duplicate users)
- ✅ References existing exercises from the database
- ✅ Properly links workouts to programs
- ✅ Safe to run multiple times (idempotent)
- ✅ Detailed console logging for debugging
- ✅ Automatic error handling and rollback

## Total Content After All Imports

- **100+ Exercises** across all muscle groups
- **~25 Predefined Workouts** (strength, cardio, mixed, flexibility)
- **14 Predefined Programs** for all levels (beginner to advanced)
- **35+ Equipment Items**

## Troubleshooting

### "System user not found"
Run the initial import first: `npm start`

### "Content already exists"
This is normal - the script detected existing content and skipped the import. No action needed.

### Connection errors
Check your Railway environment variables are set correctly.

### Missing exercises
Make sure the initial import completed successfully before running add-more-content.

## Development

To add more content in the future:

1. Add workouts and exercises using the INSERT pattern in `add_more_content.js`
2. Link workouts to programs using `program_workouts` table
3. Test locally first before running on Railway
4. Update this README with the new content

## Notes

- All new workouts are marked with `is_predefined = TRUE`
- All new programs are marked with `is_predefined = TRUE`
- Content is created under the `system@fitflow.app` user
- Users can copy predefined content to their own workouts/programs
- Only admins can edit/delete predefined content
