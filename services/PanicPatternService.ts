export type PanicLevel = "Normal" | "Warning" | "High" | "Emergency";

export interface PanicInput {
  lockUnlockCount: number;
  sosTapCount: number;
  appSwitchCount: number;
  timeWindowSeconds: number;
}

export interface PanicPrediction {
  level: PanicLevel;
  panicScore: number;
  indicators: string[];
  recommendation: string;
}

/**
 * Detects possible panic patterns from simple phone/app behaviour.
 *
 * No microphone, conversation recording, or message content is used.
 */
export function detectPanicPattern(input: PanicInput): PanicPrediction {
  let panicScore = 0;
  const indicators: string[] = [];

  // 1. Rapid lock/unlock
  if (input.lockUnlockCount >= 3) {
    panicScore += 30;
    indicators.push("Rapid repeated lock/unlock activity");
  }

  if (input.lockUnlockCount >= 5) {
    panicScore += 15;
  }

  // 2. Repeated SOS button taps
  if (input.sosTapCount >= 2) {
    panicScore += 40;
    indicators.push("Repeated SOS button taps");
  }

  if (input.sosTapCount >= 3) {
    panicScore += 10;
  }

  // 3. Sudden app switching
  if (input.appSwitchCount >= 5) {
    panicScore += 20;
    indicators.push("Sudden repeated app switching");
  }

  if (input.appSwitchCount >= 8) {
    panicScore += 10;
  }

  // 4. Limit score
  panicScore = Math.min(panicScore, 100);

  // 5. Determine panic level
  let level: PanicLevel;

  if (panicScore < 30) {
    level = "Normal";
  } else if (panicScore < 50) {
    level = "Warning";
  } else if (panicScore < 80) {
    level = "High";
  } else {
    level = "Emergency";
  }

  // 6. Recommendation
  let recommendation = "No emergency action required.";

  if (level === "Warning") {
    recommendation = "Stay alert and consider checking your surroundings.";
  }

  if (level === "High") {
    recommendation =
      "Possible panic pattern detected. Consider activating SOS and contacting a trusted contact.";
  }

  if (level === "Emergency") {
    recommendation =
      "Strong panic pattern detected. Consider activating SOS and contacting emergency services or a trusted contact.";
  }

  return {
    level,
    panicScore,
    indicators,
    recommendation,
  };
}
