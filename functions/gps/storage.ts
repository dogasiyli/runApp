import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The unique key of the location storage.
 */
import { LOCATION_TRACKING_TASK_NAME } from '../../assets/constants';
import { GPS_Data } from '../../assets/types';

/**
 * Get all stored locations from storage.
 * This is a wrapper around AsyncStorage to parse stored JSON.
 */
export async function getLocations(): Promise<GPS_Data[]> {
  const data = await AsyncStorage.getItem(LOCATION_TRACKING_TASK_NAME);
  return data ? JSON.parse(data) : [];
}

/**
 * Update the locations in storage.
 * This is a wrapper around AsyncStorage to stringify the JSON.
 */
export async function setLocations(locations: GPS_Data[]): Promise<void> {
  await AsyncStorage.setItem(LOCATION_TRACKING_TASK_NAME, JSON.stringify(locations));
}

/**
 * Reset all stored locations.
 */
export async function clearLocations(): Promise<void> {
  await AsyncStorage.removeItem(LOCATION_TRACKING_TASK_NAME);
  console.log('[storage]', 'cleared locations');
}
