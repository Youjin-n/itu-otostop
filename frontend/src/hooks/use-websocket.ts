"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createWebSocket,
  type WSEvent,
  type CalibrationResult,
} from "@/lib/api";

export interface LogEntry {
  id: number;
  time: number;
  message: string;
  level: "info" | "warning" | "error";
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<string>("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [crnResults, setCrnResults] = useState<
    Record<string, { status: string; message: string }>
  >({});
  const [calibration, setCalibration] = useState<CalibrationResult | null>(
    null,
  );
  const [done, setDone] = useState(false);
  const logIdRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = createWebSocket();

      ws.onopen = () => setConnected(true);

      ws.onclose = () => {
        setConnected(false);
        // Auto reconnect after 3s
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();

      ws.onmessage = (evt) => {
        try {
          const event: WSEvent = JSON.parse(evt.data);

          switch (event.type) {
            case "log":
              setLogs((prev) => [
                ...prev.slice(-200), // Son 200 log
                {
                  id: ++logIdRef.current,
                  time: event.timestamp,
                  message: String(event.data.message || ""),
                  level: (event.data.level as LogEntry["level"]) || "info",
                },
              ]);
              break;

            case "state":
              setPhase(String(event.data.phase || "idle"));
              break;

            case "countdown":
              setCountdown(event.data.remaining as number);
              break;

            case "crn_update":
              if (event.data.results) {
                setCrnResults(
                  event.data.results as Record<
                    string,
                    { status: string; message: string }
                  >,
                );
              }
              break;

            case "calibration":
              setCalibration(event.data as unknown as CalibrationResult);
              break;

            case "done":
              setDone(true);
              if (event.data.results) {
                setCrnResults(
                  event.data.results as Record<
                    string,
                    { status: string; message: string }
                  >,
                );
              }
              break;

            case "pong":
              break;
          }
        } catch {
          // ignore parse errors
        }
      };

      wsRef.current = ws;
    } catch {
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    logIdRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    clearLogs();
    setPhase("idle");
    setCountdown(null);
    setCrnResults({});
    setCalibration(null);
    setDone(false);
  }, [clearLogs]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    connected,
    logs,
    phase,
    countdown,
    crnResults,
    calibration,
    done,
    clearLogs,
    reset,
  };
}
