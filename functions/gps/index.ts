import { useCallback, useEffect, useRef, useState } from 'react';

import * as Storage from './storage';
import * as Track from './track';

import { useAppState } from '../../assets/stateContext';
import { GPS_Data } from '../../assets/types';

/**
 * An easy-to-use hook that combines all required functionality.
 * It keeps the data in sync as much as possible.
 */
export function useLocationTracking() {
  const { bool_update_locations, enable_update_locations } = useAppState();

  const onStartTracking = useCallback(async () => {
    await Track.startTracking();
    enable_update_locations(true);
  }, []);

  const onStopTracking = useCallback(async () => {
    await Track.stopTracking();
    enable_update_locations(false);
  }, []);

  const onClearTracking = useCallback(async () => {
    if (bool_update_locations) {
      await onStopTracking();
    }
    await Storage.clearLocations();
  }, [bool_update_locations]);

  useEffect(() => {
    Track.isTracking().then(enable_update_locations);
  }, []);

  return {
    bool_update_locations,
    startTracking: onStartTracking,
    stopTracking: onStopTracking,
    clearTracking: onClearTracking,
  };
}

/**
 * A hook to poll for changes in the storage, updates the UI if locations were added.
 */
export function useLocationData(interval = 2000) {
  const locations = useRef<GPS_Data[]>([]);
  const [count, setCount] = useState(0); // count state is only used as rerender trigger, from timer callback

  const onLocations = useCallback((stored: GPS_Data[]) => {
    // check if data was changed using ref data.
    // this method is called from outside react, so we can't use state data without reinitializing it
    if (stored.length !== locations.current.length) {
      // update the locations, but this won't trigger a rerender or update
      locations.current = stored;
      // update the state value, triggering a rerender
      setCount(locations.current.length);
    }
  }, [setCount, locations]);

  useEffect(() => {
    // load the locations on first render
    Storage.getLocations().then(onLocations);
    // create a timer to poll for changes
    const timerId = window.setInterval(() => Storage.getLocations().then(onLocations), interval);
    // when the hook is unmounted, remove the timer
    return () => window.clearInterval(timerId);
  }, [interval]);

  return locations.current;
}