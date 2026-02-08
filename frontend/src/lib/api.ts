const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ──

export interface ConfigData {
  token: string;
  ecrn_list: string[];
  scrn_list: string[];
  kayit_saati: string;
  max_deneme: number;
  retry_aralik: number;
  gecikme_buffer: number;
}

export interface ConfigResponse {
  ecrn_list: string[];
  scrn_list: string[];
  kayit_saati: string;
  max_deneme: number;
  retry_aralik: number;
  gecikme_buffer: number;
  token_set: boolean;
  token_preview: string;
}

export interface CalibrationResult {
  server_offset_ms: number;
  rtt_one_way_ms: number;
  rtt_full_ms: number;
  ntp_offset_ms: number | null;
  server_ntp_diff_ms: number | null;
  accuracy_ms: number;
}

export interface CRNResultItem {
  crn: string;
  status:
    | "pending"
    | "success"
    | "already"
    | "full"
    | "conflict"
    | "upgrade"
    | "debounce"
    | "error";
  message: string;
}

export interface RegistrationState {
  phase: "idle" | "calibrating" | "waiting" | "registering" | "done";
  running: boolean;
  current_attempt: number;
  max_attempts: number;
  crn_results: CRNResultItem[];
  calibration: CalibrationResult | null;
  countdown_seconds: number | null;
  trigger_time: number | null;
}

export interface TokenTestResult {
  valid: boolean;
  status_code: number;
  message: string;
}

export interface WSEvent {
  type:
    | "log"
    | "state"
    | "crn_update"
    | "calibration"
    | "countdown"
    | "done"
    | "pong";
  data: Record<string, unknown>;
  timestamp: number;
}

// ── API Functions ──

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => fetchAPI<{ status: string }>("/api/health"),

  getConfig: () => fetchAPI<ConfigResponse>("/api/config"),

  setConfig: (config: ConfigData) =>
    fetchAPI<ConfigResponse>("/api/config", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  testToken: () =>
    fetchAPI<TokenTestResult>("/api/test-token", { method: "POST" }),

  calibrate: () =>
    fetchAPI<CalibrationResult>("/api/calibrate", { method: "POST" }),

  startRegistration: () =>
    fetchAPI<{ status: string }>("/api/register/start", { method: "POST" }),

  cancelRegistration: () =>
    fetchAPI<{ status: string }>("/api/register/cancel", { method: "POST" }),

  getStatus: () => fetchAPI<RegistrationState>("/api/register/status"),
};

// ── WebSocket ──

export function createWebSocket(): WebSocket {
  const wsUrl = API_BASE.replace("http", "ws") + "/ws";
  return new WebSocket(wsUrl);
}
