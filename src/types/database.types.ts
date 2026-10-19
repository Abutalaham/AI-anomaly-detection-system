/**
 * Supabase Database Contract Definitions for Sentinel
 * Strictly typed entities mirroring public schema and RPC payloads.
 */

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export type ExplanationSource = 'ai' | 'template';
export type StreamKind = 'latency' | 'vibration' | 'payment';

export interface StreamConfig {
  window: number;
  zThreshold: number;
  ewmaLambda: number;
  cooldownSec: number;
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface Stream {
  id: string;
  user_id: string;
  name: string;
  unit: string;
  kind: StreamKind;
  config: StreamConfig;
  created_at: string;
}

export interface Reading {
  id: number;
  stream_id: string;
  ts: string;
  value: number;
  score: number;
  is_anomaly: boolean;
}

export interface AlertEvidence {
  zScore?: number;
  ewmaDiff?: number;
  iqrDeviation?: number;
  baselineMedian?: number;
  observedValue?: number;
  triggerTime?: string;
  contributingDetectors?: string[];
  [key: string]: unknown;
}

export interface Alert {
  id: string;
  user_id: string;
  stream_id: string;
  reading_id: number | null;
  ts: string;
  severity: AlertSeverity;
  type: string;
  score: number;
  evidence: AlertEvidence;
  explanation: string;
  explanation_source: ExplanationSource;
  status: AlertStatus;
  acknowledged_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      streams: {
        Row: Stream;
        Insert: Omit<Stream, 'created_at'> & { created_at?: string };
        Update: Partial<Stream>;
      };
      readings: {
        Row: Reading;
        Insert: Omit<Reading, 'id'> & { id?: number };
        Update: Partial<Reading>;
      };
      alerts: {
        Row: Alert;
        Insert: Omit<Alert, 'id'> & { id?: string };
        Update: Partial<Alert>;
      };
    };
  };
}
