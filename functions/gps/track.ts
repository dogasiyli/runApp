import * as Location from 'expo-location';
/**
 * The unique name of the background location task.
 */
import { LOCATION_TRACKING_TASK_NAME } from '../../assets/constants';


/**
 * Check if the background location is started and running.
 * This is a wrapper around `Location.hasStartedLocationUpdatesAsync` with the task name prefilled.
 */
export async function isTracking(): Promise<boolean> {
  return await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME);
}

/**
 * Start the background location monitoring and add new locations to the storage.
 * This is a wrapper around `Location.startLocationUpdatesAsync` with the task name prefilled.
 */
export async function startTracking() {
  await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
    // android behavior
    foregroundService: {
      notificationTitle: 'RuBY is active',
      notificationBody: 'Monitoring your location to give you feedback on your running performance.',
      notificationColor: '#00ffff',
    },
    // ios behavior
    activityType: Location.ActivityType.Fitness,
    showsBackgroundLocationIndicator: true,
  });
  console.log('[tracking] - started background location task');
}

/**
 * Stop the background location monitoring.
 * This is a wrapper around `Location.stopLocationUpdatesAsync` with the task name prefilled.
 */
export async function stopTracking() {
  await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME);
  console.log('[tracking] - stopped background location task');
}