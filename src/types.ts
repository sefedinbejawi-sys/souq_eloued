/**
 * AI Audio Robot - Types & Domain Models
 * For Hall Audio Management & Smart Sound Distribution
 */

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

export type RoomStatus = 'online' | 'offline' | 'warning' | 'unconfigured';

export interface Room {
  id: string;
  name: string;
  location: string;
  status: RoomStatus;
  masterVolume: number; // 0 to 100
  isMuted: boolean;
  controllerId?: string;
  targetSplDb?: number; // e.g. 75 dBA
  totalZonesCount?: number;
  totalMicsCount?: number;
  totalSpeakersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Zone {
  id: string;
  roomId: string;
  name: string; // e.g. "Zone A", "Zone B"
  label: string; // e.g. "المنصة الرئيسية", "المقاعد الأمامية"
  volume: number; // 0 to 100
  isMuted: boolean;
  connectionStatus: 'online' | 'offline' | 'unpaired';
  currentLevelDb: number; // e.g. -18 dBFS or 0 if offline
  peakLevelDb: number; // e.g. -6 dBFS
  autoMode: boolean; // AI Auto-gain mode
  safeMinVol: number; // min safe volume, e.g. 20
  safeMaxVol: number; // max safe volume, e.g. 85
}

export type MicActivity = 'active' | 'silent' | 'inactive' | 'clipping';

export interface Microphone {
  id: string;
  roomId: string;
  zoneId?: string;
  name: string; // e.g. "MIC 01"
  description?: string; // e.g. "منصة الإلقاء الرئيسية"
  status: 'online' | 'offline';
  volume: number; // 0 to 100
  isMuted: boolean;
  signalLevel: number; // 0 to 100% (-60 to 0 dB)
  activity: MicActivity;
  batteryPercent?: number; // 0 to 100
  frequencyMhz?: string; // e.g. "542.150 MHz"
  lastActivityTime?: string;
}

export interface Speaker {
  id: string;
  roomId: string;
  zoneId: string;
  name: string;
  model?: string;
  status: 'online' | 'offline' | 'fault';
  impedanceOhm?: number;
  maxWattage?: number;
  currentWattage?: number;
}

export interface AudioController {
  id: string;
  deviceId: string; // e.g. "CTRL-DSP-8800-ALGERIA"
  tokenHash?: string;
  roomId: string;
  name: string;
  connectionStatus: 'connected' | 'disconnected' | 'pending';
  dspLoadPercent: number;
  latencyMs: number;
  firmwareVersion: string;
  ipAddress?: string;
  lastSeen?: string;
}

export type AISeverity = 'info' | 'warning' | 'critical';

export interface AIRecommendation {
  id: string;
  roomId: string;
  targetType: 'master' | 'zone' | 'microphone';
  targetId: string;
  targetName: string;
  recommendation: string;
  recommendationAr: string;
  proposedAction: 'decrease_vol' | 'increase_vol' | 'mute' | 'check_feedback' | 'safe_limiter';
  proposedDelta?: number; // e.g. -4
  proposedValue?: number; // e.g. 68
  reason: string;
  reasonAr: string;
  detectedAt: string;
  isApplied: boolean;
}

export interface AIHealthStatus {
  mode: 'AUTO' | 'MANUAL' | 'MONITORING';
  feedbackStatus: 'safe' | 'warning' | 'critical';
  feedbackFrequencyHz?: number;
  activeMicsCount: number;
  clippingZonesCount: number;
  silentMicsCount: number;
  overallScore: number; // 0 to 100
  summaryAr: string;
}

export type AlertCategory =
  | 'feedback'
  | 'offline'
  | 'mic_inactive'
  | 'excessive_volume'
  | 'ai_recommendation'
  | 'controller_disconnected';

export interface AlertItem {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  category: AlertCategory;
  severity: AISeverity;
  resolved: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userEmail: string;
  userRole: UserRole;
  operation: string;
  operationAr: string;
  roomName: string;
  targetEntity: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  source: 'Manual' | 'AI';
}

export type SystemMode = 'production' | 'simulation';
export type AppLanguage = 'ar' | 'en' | 'fr';
export type ActiveTab =
  | 'dashboard'
  | 'rooms'
  | 'microphones'
  | 'ai_engine'
  | 'controller'
  | 'alerts'
  | 'audit'
  | 'settings';
