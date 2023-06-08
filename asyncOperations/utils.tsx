export const handleTimerInterval = async (
    bool_record_locations:boolean,
    initTimestamp: number,
    lastTimestamp: number,
    setActiveTime: React.Dispatch<React.SetStateAction<number>>,
    setPassiveTime: React.Dispatch<React.SetStateAction<number>>,
    setTotalTime: React.Dispatch<React.SetStateAction<number>>,
    setLastTimestamp: React.Dispatch<React.SetStateAction<number>>,
    setInitTimestamp: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const curTimestamp = Date.now();
  
    // Check if bool_record_locations changed to true and initTimestamp is null
    if (bool_record_locations && initTimestamp === null) {
      setInitTimestamp(curTimestamp);
      setLastTimestamp(curTimestamp);
    }
  
    // Check if bool_record_locations changed
    if (lastTimestamp !== null) {
      const duration = curTimestamp - lastTimestamp;
      if (bool_record_locations) {
        setActiveTime((prevActiveTime) => prevActiveTime + duration);
      } else {
        setPassiveTime((prevPassiveTime) => prevPassiveTime + duration);
      }
      setTotalTime((prevTotalTime) => prevTotalTime + duration);
      setLastTimestamp(curTimestamp);
    }
  };
  