import { useEffect, useState } from "react";

import {
  getBatteryStatus,
  saveLastKnownLocation,
} from "../services/BatteryService";

export default function useBatteryMonitor() {
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [survivalMode, setSurvivalMode] = useState(false);

  useEffect(() => {
    checkBattery();

    const interval = setInterval(() => {
      checkBattery();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const checkBattery = async () => {
    try {
      const status = await getBatteryStatus();

      setBatteryLevel(status.batteryLevel);
      setIsCharging(status.isCharging);
      setSurvivalMode(status.survivalMode);

      if (status.survivalMode) {
        await saveLastKnownLocation();
      }
    } catch (error) {
      console.log("Battery Monitor Error:", error);
    }
  };

  return {
    batteryLevel,
    isCharging,
    survivalMode,
  };
}
