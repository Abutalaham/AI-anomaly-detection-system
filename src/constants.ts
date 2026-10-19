/**
 * Global Application Constants
 * Strictly follows SCREAMING_SNAKE naming convention.
 */

// Storage Keys
export const STORAGE_KEY_UI = 'sentinel-ui-storage';
export const STORAGE_KEY_VISUAL_MODE = 'sentinel-visual-mode-storage';
export const STORAGE_KEY_AUTH = 'sentinel-auth-token';

// Navigation Routes
export const ROUTES = {
  LANDING: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  STREAM_DETAIL: '/streams/:id',
  ALERTS: '/alerts',
  SETTINGS: '/settings',
} as const;

// Motion Policy Limits
export const MOTION_TIERS = {
  TIER_1_LANDING: 'full',
  TIER_2_APP: 'restrained',
  TIER_3_REDUCED: 'reduced',
} as const;

export const PARTICLE_CONFIG = {
  MAX_PARTICLES_TIER_1: 120,
  MAX_PARTICLES_MOBILE: 50,
  MAX_PARTICLES_TIER_2: 60,
  DEFAULT_COUNT: 80,
  DEFAULT_CONNECT_DISTANCE: 120,
  THREAT_ANIMATION_DURATION_MS: 6000,
} as const;

// Anomaly Severity Levels
export const ALERT_SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

// Stream Types
export const STREAM_KINDS = {
  LATENCY: 'latency',
  VIBRATION: 'vibration',
  PAYMENT: 'payment',
} as const;

// Demo Stream Seed Metadata
export const DEMO_STREAMS = [
  {
    id: 'demo-stream-latency',
    name: 'Server Latency',
    unit: 'ms',
    kind: STREAM_KINDS.LATENCY,
    config: {
      window: 60,
      zThreshold: 3.0,
      ewmaLambda: 0.2,
      cooldownSec: 30,
    },
  },
  {
    id: 'demo-stream-vibration',
    name: 'Factory Vibration Sensor',
    unit: 'mm/s',
    kind: STREAM_KINDS.VIBRATION,
    config: {
      window: 60,
      zThreshold: 2.5,
      ewmaLambda: 0.15,
      cooldownSec: 20,
    },
  },
  {
    id: 'demo-stream-payment',
    name: 'Payment Processing Amount',
    unit: 'INR',
    kind: STREAM_KINDS.PAYMENT,
    config: {
      window: 60,
      zThreshold: 3.5,
      ewmaLambda: 0.25,
      cooldownSec: 45,
    },
  },
] as const;

// UI Layout Grid
export const GRID_UNIT_PX = 8;
