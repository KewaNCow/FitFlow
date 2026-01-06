-- FitFlow Database Migration v4 - Link Routes to Workouts
-- Run this after migration_v2.sql and migration_v3.sql

USE fitflow;

-- Add route_id to workouts table to link a route to a workout
ALTER TABLE workouts 
ADD COLUMN route_id INT DEFAULT NULL AFTER description,
ADD FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL;

-- Add workout_id to routes table to link a workout to a route
ALTER TABLE routes 
ADD COLUMN workout_id INT DEFAULT NULL AFTER is_favorite,
ADD FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL;
