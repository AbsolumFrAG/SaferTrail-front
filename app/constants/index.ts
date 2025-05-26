export const COLORS = {
  HIGH_RISK: "#FF0000",
  MEDIUM_RISK: "#FFA500",
  LOW_RISK: "#4CAF50",
  PRIMARY: "#007AFF",
  BACKGROUND: "#414141",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
} as const;

export const RISK_THRESHOLDS = {
  HIGH: 0.7,
  MEDIUM: 0.4,
} as const;

export const DEFAULT_REGION = {
  latitude: 42.3601, // Boston coordinates
  longitude: -71.0589,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
} as const;
